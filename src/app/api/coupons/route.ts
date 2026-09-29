// app/api/coupons/route.ts
import { NextResponse } from "next/server"
import { getAllCoupons } from "@/lib/data"

export async function GET() {
    try {
        const coupons = await getAllCoupons()
        return NextResponse.json(coupons, {
            status: 200,
            headers: {
                // Serve from CDN for up to 60s,
                // allow stale responses while revalidating in the background for 120s
                "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
            },
        })
    } catch (error) {
        console.error("Error fetching coupons:", error)
        return NextResponse.json(
            { error: "Failed to fetch coupons" },
            {
                status: 500,
                headers: {
                    // Even errors can be cached briefly to avoid thrashing your database
                    "Cache-Control": "public, max-age=10, stale-while-revalidate=30",
                },
            }
        )
    }
}
