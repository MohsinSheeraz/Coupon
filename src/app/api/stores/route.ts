import { NextResponse } from "next/server"
import { getAllStores } from "@/lib/data"

export async function GET() {
    try {
        const stores = await getAllStores()
        return NextResponse.json(stores)
    } catch (error) {
        console.error("Error fetching stores:", error)
        return NextResponse.json({ error: "Failed to fetch stores" }, { status: 500 })
    }
}
