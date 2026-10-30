import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/admin/sidebar"
import { SiteSearch } from "@/components/site-search"
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
        <div className="admin-shell flex h-screen overflow-hidden">
            <Sidebar />
            <div className="admin-content min-h-0 flex-1 overflow-auto">
                <div className="laptop-container animate-fadeIn px-8 pb-8">
                    <header className="sticky top-0 z-30 mb-6 flex max-w-6xl flex-col gap-3 border-b bg-[#f3f5ed]/95 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase text-teal-700">DealzyCoup</p>
                            <h1 className="text-xl font-semibold">Admin Panel</h1>
                        </div>
                        <SiteSearch className="w-full sm:max-w-xl" />
                    </header>
                    {children}
                </div>
            </div>
        </div>
    )
}
