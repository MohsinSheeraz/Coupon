import { NextResponse } from "next/server"
import { getSettings } from "@/lib/data"

export async function GET() {
    try {
        const settings = await getSettings()
        return NextResponse.json(settings)
    } catch (error) {
        console.error("Error fetching settings:", error)
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
    }
}
