import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// 👇 Accept Promise<{ id: string }>, then await it
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params           // ← resolve the promise

        if (!id) {
            return NextResponse.json(
                { error: "Coupon ID is required" },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db("DealzyCoupon")

        const coupon = await db
            .collection("coupons")
            .findOne({ _id: new ObjectId(id) })

        if (!coupon) {
            return NextResponse.json(
                { error: "Coupon not found" },
                { status: 404 }
            )
        }

        // If the coupon has a storeId, fetch the store details
        if (coupon.storeId) {
            const store = await db
                .collection("stores")
                .findOne({ _id: new ObjectId(coupon.storeId) })
            if (store) {
                coupon.store = {
                    id: store._id.toString(),
                    name: store.name,
                    slug: store.slug,
                    logo: store.logo,
                }
            }
        }

        coupon.id = coupon._id.toString()
        if (coupon.storeId) coupon.storeId = coupon.storeId.toString()

        return NextResponse.json(coupon)
    } catch (err) {
        console.error("Error fetching coupon:", err)
        return NextResponse.json(
            { error: "Failed to fetch coupon" },
            { status: 500 }
        )
    }
}
