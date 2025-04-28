import { NextResponse } from "next/server"
import { getAllDeals } from "@/lib/data"

export async function GET() {
    try {
        const deals = await getAllDeals()
        return NextResponse.json(deals)
    } catch (error) {
        console.error("Error fetching deals:", error)
        return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 })
    }
}
