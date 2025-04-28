import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id

        if (!id) {
            return NextResponse.json({ error: "Deal ID is required" }, { status: 400 })
        }

        const client = await clientPromise
        const db = client.db("couponhub")

        // Deals are stored in the coupons collection with type="deal"
        const deal = await db.collection("coupons").findOne({
            _id: new ObjectId(id),
            type: "deal",
        })

        if (!deal) {
            return NextResponse.json({ error: "Deal not found" }, { status: 404 })
        }

        // If the deal has a storeId, fetch the store details
        if (deal.storeId) {
            const store = await db.collection("stores").findOne({ _id: new ObjectId(deal.storeId) })
            if (store) {
                deal.store = {
                    id: store._id.toString(),
                    name: store.name,
                    slug: store.slug,
                    logo: store.logo,
                }
            }
        }

        // Convert ObjectId to string
        deal.id = deal._id.toString()
        deal.storeId = deal.storeId.toString()

        return NextResponse.json(deal)
    } catch (error) {
        console.error("Error fetching deal:", error)
        return NextResponse.json({ error: "Failed to fetch deal" }, { status: 500 })
    }
}
