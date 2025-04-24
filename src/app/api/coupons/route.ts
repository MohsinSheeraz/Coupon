import { NextResponse } from "next/server"
import { getAllCoupons } from "@/lib/data"

export async function GET() {
    try {
        const coupons = await getAllCoupons()
        return NextResponse.json(coupons)
    } catch (error) {
        console.error("Error fetching coupons:", error)
        return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 })
    }
}
