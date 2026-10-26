"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

export function PublicChrome({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    if (pathname?.startsWith("/admin") || pathname === "/login") return null
    return children
}