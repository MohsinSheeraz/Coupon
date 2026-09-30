import type React from "react"
import { Sidebar } from "@/components/admin/sidebar"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { headers } from 'next/headers'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // read the cookie (cookies() returns a Promise here)
    const cookieStore = await cookies()
    const auth = cookieStore.get("admin-auth")?.value
    const path = (await headers()).get('x-invoke-path') || ''
    // If we’re on /admin/login, let ’login/page.tsx’ render
    if (path === '/login') {
        return <>{children}</>
    }

    // if no valid cookie, send to login
    if (auth !== "1") {
        redirect("/login")
    }

    return (
        <div className="admin-shell flex min-h-screen">
            <Sidebar />
            <div className="admin-content flex-1 p-8 overflow-auto">
                <div className="laptop-container animate-fadeIn">{children}</div>
            </div>
        </div>
    )
}
