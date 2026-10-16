import { NextRequest, NextResponse } from "next/server"
import { getAllDeals, getDealById } from "@/lib/data"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id?: string[] }> }) {
    try {
        const { id } = await params
        const routeArray = id || []

        // Case A: /api/deals (Fetch all deals)
        if (routeArray.length === 0) {
            const deals = await getAllDeals()
            return NextResponse.json(deals)
        }

        // Case B: /api/deals/[id] (Fetch a specific deal by its ID)
        const dealId = routeArray[0]
        const deal = await getDealById(dealId)
        if (!deal) {
            return NextResponse.json({ error: "Deal not found" }, { status: 404 })
        }
        return NextResponse.json(deal, {
            headers: { "Cache-Control": "private, no-store" },
        })

    } catch (error) {
        console.error("Error managing deals GET requests:", error)
        return NextResponse.json({ error: "Failed to process deals request" }, { status: 500 })
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id?: string[] }> }) {
    try {
        const { id } = await params
        const routeArray = id || []

        // Treat as standard /api/deals POST creation logic
        if (routeArray.length === 0) {
            // ➡️ PASTE YOUR ORIGINAL /api/deals/route.ts POST LOGIC HERE
            return NextResponse.json({ success: true, message: "Deal created successfully" })
        }
        
        return NextResponse.json({ error: "Method not allowed on sub-path" }, { status: 405 })
    } catch (error) {
        console.error("Error creating deal:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id?: string[] }> }) {
    try {
        const { id } = await params
        const dealId = id ? id[0] : null
        
        // ➡️ PASTE YOUR ORIGINAL /api/deals/[id]/route.ts PUT EDIT LOGIC HERE
        return NextResponse.json({ updated: dealId })
    } catch (error) {
        console.error("Error updating deal:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id?: string[] }> }) {
    try {
        const { id } = await params
        const dealId = id ? id[0] : null
        
        // ➡️ PASTE YOUR ORIGINAL /api/deals/[id]/route.ts DELETE LOGIC HERE
        return NextResponse.json({ deleted: dealId })
    } catch (error) {
        console.error("Error deleting deal:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
