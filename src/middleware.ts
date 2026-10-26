import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME, isValidToken } from "@/lib/auth"

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (pathname === "/api/admin/login") return NextResponse.next()

    const valid = await isValidToken(request.cookies.get(COOKIE_NAME)?.value)
    if (valid) return NextResponse.next()

    if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.search = ""
    return NextResponse.redirect(loginUrl)
}

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*"],
}