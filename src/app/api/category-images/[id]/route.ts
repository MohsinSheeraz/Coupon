import { Readable } from "node:stream"
import { GridFSBucket, ObjectId } from "mongodb"
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Image not found" }, { status: 404 })

    const client = await clientPromise
    const bucket = new GridFSBucket(client.db("DealzyCoup"), { bucketName: "categoryImages" })
    const file = await bucket.find({ _id: new ObjectId(id) }).limit(1).next()
    if (!file) return NextResponse.json({ error: "Image not found" }, { status: 404 })

    const stream = bucket.openDownloadStream(file._id)
    return new Response(Readable.toWeb(stream) as ReadableStream, {
        headers: {
            "Content-Type": file.metadata?.contentType ?? "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
        },
    })
}