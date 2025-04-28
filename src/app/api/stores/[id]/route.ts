import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id

        if (!id) {
            return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
        }

        const client = await clientPromise
        const db = client.db("couponhub")

        const store = await db.collection("stores").findOne({ _id: new ObjectId(id) })

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 })
        }

        // Convert ObjectId to string
        store.id = store._id.toString()

        return NextResponse.json(store)
    } catch (error) {
        console.error("Error fetching store:", error)
        return NextResponse.json({ error: "Failed to fetch store" }, { status: 500 })
    }
}
