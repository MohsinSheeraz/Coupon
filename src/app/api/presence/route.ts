import { randomUUID } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { recordVisitorPresence } from "@/lib/presence"

export async function POST(request: NextRequest) {
    const visitorId = request.cookies.get("dealzycoup_visitor")?.value
    const validVisitorId = visitorId && /^[\da-f-]{36}$/i.test(visitorId)
        ? visitorId
        : randomUUID()

    try {
        await recordVisitorPresence(validVisitorId)
        const response = new NextResponse(null, {
            status: 204,
            headers: { "Cache-Control": "no-store" },
        })
        if (validVisitorId !== visitorId) {
            response.cookies.set("dealzycoup_visitor", validVisitorId, {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: "/",
            })
        }
        return response
    } catch (error) {
        console.error("Could not record visitor presence:", error)
        return NextResponse.json({ error: "Could not record visitor presence" }, { status: 500 })
    }
}
