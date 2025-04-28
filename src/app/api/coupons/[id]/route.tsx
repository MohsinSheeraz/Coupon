import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id

        if (!id) {
            return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 })
        }

        const client = await clientPromise
        const db = client.db("couponhub")

        const coupon = await db.collection("coupons").findOne({ _id: new ObjectId(id) })

        if (!coupon) {
            return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
        }

        // If the coupon has a storeId, fetch the store details
        if (coupon.storeId) {
            const store = await db.collection("stores").findOne({ _id: new ObjectId(coupon.storeId) })
            if (store) {
                coupon.store = {
                    id: store._id.toString(),
                    name: store.name,
                    slug: store.slug,
                    logo: store.logo,
                }
            }
        }

        // Convert ObjectId to string
        coupon.id = coupon._id.toString()
        coupon.storeId = coupon.storeId.toString()

        return NextResponse.json(coupon)
    } catch (error) {
        console.error("Error fetching coupon:", error)
        return NextResponse.json({ error: "Failed to fetch coupon" }, { status: 500 })
    }
}
