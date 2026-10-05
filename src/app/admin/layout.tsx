import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/admin/sidebar"
import { COOKIE_NAME, isValidToken } from "@/lib/auth"

// Never pre-render or cache admin pages at build time
export const dynamic = "force-dynamic"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Second line of defence (middleware already blocks unauthenticated requests)
    const token = (await cookies()).get(COOKIE_NAME)?.value
    if (!(await isValidToken(token))) {
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