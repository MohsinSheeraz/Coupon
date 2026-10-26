import { Readable } from "node:stream"
import { GridFSBucket } from "mongodb"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME, isValidToken } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

export async function POST(request: NextRequest) {
    const token = (await cookies()).get(COOKIE_NAME)?.value
    if (!(await isValidToken(token))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const formData = await request.formData()
        const file = formData.get("file")
        if (!(file instanceof File) || !ALLOWED_TYPES.has(file.type)) {
            return NextResponse.json({ error: "Choose a JPG, PNG, WebP, or GIF image" }, { status: 400 })
        }
        if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
            return NextResponse.json({ error: "Image must be smaller than 5 MB" }, { status: 400 })
        }

        const client = await clientPromise
        const bucket = new GridFSBucket(client.db("DealzyCoup"), { bucketName: "categoryImages" })
        const upload = bucket.openUploadStream(file.name, {
            metadata: { contentType: file.type },
        })
        const buffer = Buffer.from(await file.arrayBuffer())
        await new Promise<void>((resolve, reject) => {
            const source = Readable.from([buffer])
            source.on("error", reject)
            upload.on("error", reject)
            upload.on("finish", resolve)
            source.pipe(upload)
        })

        return NextResponse.json({ url: `/api/category-images/${upload.id.toString()}` })
    } catch (error) {
        console.error("Error uploading category image:", error)
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
    }
}