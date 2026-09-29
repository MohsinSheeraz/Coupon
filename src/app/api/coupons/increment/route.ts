import { NextResponse } from "next/server"
import { incrementCouponUsage } from "@/lib/data"

export async function POST(request: Request) {
    try {
        const { id } = await request.json()

        if (!id) {
            return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 })
        }

        await incrementCouponUsage(id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error incrementing coupon usage:", error)
        return NextResponse.json({ error: "Failed to increment coupon usage" }, { status: 500 })
    }
}
