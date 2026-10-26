import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COOKIE_NAME, isValidToken } from "@/lib/auth"
import { getManagedCategories, syncLegacyCategories } from "@/lib/data"

export async function GET() {
    const token = (await cookies()).get(COOKIE_NAME)?.value
    if (!(await isValidToken(token))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        await syncLegacyCategories()
        return NextResponse.json(await getManagedCategories())
    } catch (error) {
        console.error("Error fetching categories:", error)
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
    }
}