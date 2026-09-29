import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// key change ↓  params is a Promise, and the function is async
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // resolve the promise the checker generates
        const { id } = await params

        if (!id) {
            return NextResponse.json(
                { error: "Deal ID is required" },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db("DealzyCoupon")

        // deals live in the coupons collection with type = "deal"
        const deal = await db.collection("coupons").findOne({
            _id: new ObjectId(id),
            type: "deal",
        })

        if (!deal) {
            return NextResponse.json({ error: "Deal not found" }, { status: 404 })
        }

        // hydrate store info if present
        if (deal.storeId) {
            const store = await db
                .collection("stores")
                .findOne({ _id: new ObjectId(deal.storeId) })
            if (store) {
                deal.store = {
                    id: store._id.toString(),
                    name: store.name,
                    slug: store.slug,
                    logo: store.logo,
                }
            }
        }

        // normalise ids to strings
        deal.id = deal._id.toString()
        if (deal.storeId) deal.storeId = deal.storeId.toString()

        return NextResponse.json(deal)
    } catch (err) {
        console.error("Error fetching deal:", err)
        return NextResponse.json(
            { error: "Failed to fetch deal" },
            { status: 500 }
        )
    }
}
