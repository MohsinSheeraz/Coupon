"use client"

import { useEffect, useRef, useState } from "react"
import type { Route } from "next"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"

interface ListingPageSelectProps {
    pathname: string
    view: string
    currentPage: number
    totalPages: number
    category?: string
}

export function ListingPageSelect({
    pathname,
    view,
    currentPage,
    totalPages,
    category,
}: ListingPageSelectProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const activeOptionRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (!isOpen) return

        const closeOnOutsideClick = (event: PointerEvent) => {
            if (!dropdownRef.current?.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false)
        }

        document.addEventListener("pointerdown", closeOnOutsideClick)
        document.addEventListener("keydown", closeOnEscape)
        activeOptionRef.current?.scrollIntoView({ block: "nearest" })

        return () => {
            document.removeEventListener("pointerdown", closeOnOutsideClick)
            document.removeEventListener("keydown", closeOnEscape)
        }
    }, [isOpen])

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                aria-label={`Current page ${currentPage}. Choose page`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={`${pathname}-page-options`}
                onClick={() => setIsOpen((open) => !open)}
                className="inline-flex h-10 min-w-16 items-center justify-between gap-2 rounded-full border border-[#dce3d4] bg-white px-3 text-sm font-semibold text-ink shadow-[0_2px_8px_rgba(27,39,26,0.08)] transition hover:border-[#82986d] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82986d]"
            >
                <span>{currentPage}</span>
                <ChevronDown size={14} aria-hidden="true" className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
                <div
                    id={`${pathname}-page-options`}
                    role="listbox"
                    aria-label="Choose page"
                    className="absolute left-0 top-full z-[70] mt-2 w-20 overflow-y-auto rounded-2xl border border-[#dce3d4] bg-white p-1.5 shadow-xl ring-1 ring-black/5"
                    style={{ maxHeight: "min(334px, 60vh)" }}
                >
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
                        const isActive = page === currentPage
                        return (
                            <button
                                key={page}
                                ref={isActive ? activeOptionRef : undefined}
                                type="button"
                                role="option"
                                aria-selected={isActive}
                                onClick={() => {
                                    setIsOpen(false)
                                    const query = new URLSearchParams({ view, page: String(page) })
                                    if (category) query.set("category", category)
                                    router.push(`${pathname}?${query.toString()}` as Route)
                                }}
                                className={`block h-8 w-full rounded-xl px-3 text-left text-sm transition-colors ${isActive
                                    ? "bg-ink font-semibold text-white"
                                    : "text-gray-700 hover:bg-[#edf0e5] hover:text-ink"
                                    }`}
                            >
                                {page}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
