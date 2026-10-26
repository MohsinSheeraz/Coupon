"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Tag, Store, Settings, LogOut, Percent, Layers } from "lucide-react"
import { useState } from "react"

export function Sidebar() {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    const isActive = (path: string) => {
        return pathname === path
    }

    const links = [
        {
            name: "Dashboard",
            href: "/admin",
            icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
            name: "Coupons",
            href: "/admin/coupons",
            icon: <Tag className="h-5 w-5" />,
        },
        {
            name: "Deals",
            href: "/admin/deals",
            icon: <Percent className="h-5 w-5" />,
        },
        {
            name: "Stores",
            href: "/admin/stores",
            icon: <Store className="h-5 w-5" />,
        },
        {
            name: "Categories",
            href: "/admin/categories",
            icon: <Layers className="h-5 w-5" />,
        },
        {
            name: "Settings",
            href: "/admin/settings",
            icon: <Settings className="h-5 w-5" />,
        },
    ] as const

    return (
        <div
            className={`admin-sidebar min-h-screen transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}
        >
            <div className="p-6 flex justify-between items-center">
                <Link href="/admin" className="flex items-center">
                    {!collapsed && <span className="text-2xl font-bold text-brand-400">DealzyCoup</span>}
                    {collapsed && <span className="text-xl font-bold text-brand-400">CH</span>}
                </Link>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-teal-600 hover:text-brand-400 transition-colors"
                >
                    {collapsed ? "→" : "←"}
                </button>
            </div>
            {!collapsed && <span className="text-xs text-gray-500 px-6">Admin Panel</span>}
            <nav className="mt-6">
                <ul className="space-y-1">
                    {links.map((link) => (
                        <li key={link.name}>
                            <Link
                                href={link.href}
                                className={`flex items-center px-6 py-3 text-teal-600 hover:bg-dark-700 transition-colors ${isActive(link.href) ? "bg-dark-700 border-r-4 border-teal-600" : ""
                                    }`}
                            >
                                <span className={`${isActive(link.href) ? "text-brand-400" : ""}`}>{link.icon}</span>
                                {!collapsed && (
                                    <span className={`ml-3 ${isActive(link.href) ? "font-medium text-brand-400" : ""}`}>{link.name}</span>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className={`absolute bottom-0 ${collapsed ? "w-20" : "w-64"} p-6`}>
                <Link href="/" className="flex items-center text-teal-600 hover:text-brand-400 transition-colors">
                    <LogOut className="h-5 w-5" />
                    {!collapsed && <span className="ml-3">Back to Site</span>}
                </Link>
            </div>
        </div>
    )
}
