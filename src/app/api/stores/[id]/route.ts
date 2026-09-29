import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// 👇  accept Promise<{ id: string }>, then await it
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params           // ← resolve the promise

        if (!id) {
            return NextResponse.json(
                { error: "Store ID is required" },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db("DealzyCoupon")

        const store = await db
            .collection("stores")
            .findOne({ _id: new ObjectId(id) })

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 })
        }

        store.id = store._id.toString()

        return NextResponse.json(store)
    } catch (err) {
        console.error("Error fetching store:", err)
        return NextResponse.json(
            { error: "Failed to fetch store" },
            { status: 500 }
        )
    }
}
