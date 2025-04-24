"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Tag, Store, Settings, LogOut } from "lucide-react"

export function Sidebar() {
    const pathname = usePathname()

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
            name: "Stores",
            href: "/admin/stores",
            icon: <Store className="h-5 w-5" />,
        },
        {
            name: "Settings",
            href: "/admin/settings",
            icon: <Settings className="h-5 w-5" />,
        },
    ]

    return (
        <div className="w-64 bg-white border-r min-h-screen">
            <div className="p-6">
                <Link href="/admin" className="flex items-center">
                    <span className="text-2xl font-bold text-teal-600">CouponHub</span>
                </Link>
                <span className="text-xs text-gray-500 mt-1">Admin Panel</span>
            </div>
            <nav className="mt-6">
                <ul className="space-y-1">
                    {links.map((link) => (
                        <li key={link.name}>
                            <Link
                                href={link.href}
                                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${isActive(link.href) ? "bg-gray-100 border-r-4 border-teal-600" : ""
                                    }`}
                            >
                                <span className={`mr-3 ${isActive(link.href) ? "text-teal-600" : ""}`}>{link.icon}</span>
                                <span className={isActive(link.href) ? "font-medium" : ""}>{link.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="absolute bottom-0 w-64 p-6">
                <Link href="/" className="flex items-center text-gray-700 hover:text-teal-600">
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Back to Site</span>
                </Link>
            </div>
        </div>
    )
}
