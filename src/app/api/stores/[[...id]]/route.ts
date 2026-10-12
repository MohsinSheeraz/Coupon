import { NextRequest, NextResponse } from "next/server"
import { getAllStores, getStoreById } from "@/lib/data"
// Import your store functions from your library, for example:
// import { getAllStores, getStoreById, createStore, updateStore, deleteStore } from "@/lib/data"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id?: string[] }> }) {
    try {
        const { id } = await params
        const routeArray = id || []

        // /api/stores -> all stores
        if (routeArray.length === 0) {
            return NextResponse.json(await getAllStores())
        }

        // /api/stores/<id> -> one store
        const store = await getStoreById(routeArray[0])
        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 })
        }
        return NextResponse.json(store)
    } catch (error) {
        console.error("Error managing stores GET requests:", error)
        return NextResponse.json({ error: "Failed to process stores request" }, { status: 500 })
    }
}


export async function POST(req: NextRequest, { params }: { params: Promise<{ id?: string[] }> }) {
    try {
        const { id } = await params
        const routeArray = id || []

        if (routeArray.length === 0) {
            // ➡️ PASTE YOUR ORIGINAL /api/stores/route.ts POST LOGIC HERE
            return NextResponse.json({ success: true, message: "Store created successfully" })
        }

        return NextResponse.json({ error: "Method not allowed on sub-path" }, { status: 405 })
    } catch (error) {
        console.error("Error creating store:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id?: string[] }> }) {
    try {
        const { id } = await params
        const storeId = id ? id : null

        // ➡️ PASTE YOUR ORIGINAL /api/stores/[id]/route.ts PUT EDIT LOGIC HERE
        return NextResponse.json({ updated: storeId })
    } catch (error) {
        console.error("Error updating store:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id?: string[] }> }) {
    try {
        const { id } = await params
        const storeId = id ? id : null

        // ➡️ PASTE YOUR ORIGINAL /api/stores/[id]/route.ts DELETE LOGIC HERE
        return NextResponse.json({ deleted: storeId })
    } catch (error) {
        console.error("Error deleting store:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
