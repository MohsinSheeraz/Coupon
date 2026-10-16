import { NextRequest, NextResponse } from "next/server"
import { getAllCoupons, getCouponById } from "@/lib/data"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id?: string[] }> }) {
    try {
        const { id } = await params
        const routeArray = id || []

        // Case A: /api/coupons
        if (routeArray.length === 0) {
            const coupons = await getAllCoupons()
            return NextResponse.json(coupons, {
                status: 200,
                headers: {
                    "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
                },
            })
        }

        // Case B: /api/coupons/increment
        if (routeArray[0] === "increment") {
            // ➡️ PASTE YOUR ORIGINAL INCREMENT GET LOGIC HERE
            return NextResponse.json({ message: "Increment endpoint hit safely" })
        }

        // Case C: /api/coupons/[id]
        const couponId = routeArray[0]
        const coupon = await getCouponById(couponId)
        if (!coupon) {
            return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
        }
        return NextResponse.json(coupon, {
            headers: { "Cache-Control": "private, no-store" },
        })

    } catch (error) {
        console.error("Error fetching coupons:", error)
        return NextResponse.json(
            { error: "Failed to fetch coupons" },
            {
                status: 500,
                headers: {
                    "Cache-Control": "public, max-age=10, stale-while-revalidate=30",
                },
            }
        )
    }
}

// Handle POST/PUT/DELETE methods for all sub-routes here
export async function POST(req: NextRequest, { params }: { params: Promise<{ id?: string[] }> }) {
    const { id } = await params
    const routeArray = id || []

    if (routeArray[0] === "increment") {
        // ➡️ PASTE YOUR ORIGINAL /api/coupons/increment/route.ts POST LOGIC HERE
        return NextResponse.json({ success: true })
    }

    // Otherwise treat as standard /api/coupons POST creation logic
    return NextResponse.json({ success: true })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id?: string[] }> }) {
    const { id } = await params
    const couponId = id ? id[0] : null
    
    // ➡️ PASTE YOUR ORIGINAL /api/coupons/[id]/route.ts PUT EDIT LOGIC HERE
    return NextResponse.json({ updated: couponId })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id?: string[] }> }) {
    const { id } = await params
    const couponId = id ? id[0] : null
    
    // ➡️ PASTE YOUR ORIGINAL /api/coupons/[id]/route.ts DELETE LOGIC HERE
    return NextResponse.json({ deleted: couponId })
}
