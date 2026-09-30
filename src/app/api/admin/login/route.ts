import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
    const { user, pass } = await request.json()
    if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
        const res = NextResponse.json({ ok: true })
        res.cookies.set({
            name: "admin-auth",
            value: "1",
            path: "/admin",
            httpOnly: true,
            maxAge: 15 * 60, // 15 minutes
        })
        return res
    }
    return NextResponse.json({ ok: false }, { status: 401 })
}
