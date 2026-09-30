// src/app/stores/page.tsx
import Link from "next/link"
import { getAllStores } from "@/lib/data"
import type { Store } from "@/lib/models"
import { Card, CardContent } from "@/components/ui/card"
import { BadgePercent, Tag } from "lucide-react"

interface SearchParams {
    page?: string
    view?: "one" | "two" | "all"
}

export const revalidate = 30   // seconds

export default async function StoresPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const params = await searchParams
    const PAGE_SIZE = 15

    // ▶ parse pagination + view
    const currentPage = parseInt(params.page ?? "1", 10) || 1
    const view = params.view ?? "default"

    // ▶ fetch stores
    const allStores: Store[] = await getAllStores()

    // ▶ pagination math
    const pageSize = view === "all" ? allStores.length : PAGE_SIZE
    const totalPages =
        view === "all" ? 1 : Math.ceil(allStores.length / PAGE_SIZE)
    const start = (currentPage - 1) * PAGE_SIZE
    const pagedStores = allStores.slice(start, start + pageSize)

    const prevPage = Math.max(currentPage - 1, 1)
    const nextPage = Math.min(currentPage + 1, totalPages)

    // ▶ grid-columns based on view
    let gridColsClass = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    if (view === "one") gridColsClass = "grid-cols-1"
    else if (view === "two") gridColsClass = "grid-cols-2"

    return (
        <div className="listing-page container mx-auto px-4 py-12">
            {/* Header */}
            <div className="listing-intro text-center mb-6">
                <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-ink mb-2">All Stores</h1>
                <p className="text-gray-600">
                    Browse our collection of stores and find the best coupons and deals
                </p>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between mb-5">
                {/* Pagination (left) */}
                {view !== "all" && totalPages > 1 && (
                    <div className="flex items-center space-x-2">
                        <Link
                            href={`?view=${view}&page=${prevPage}`}
                            className={`px-3.5 py-1.5 border rounded-full text-sm font-medium transition-colors ${currentPage <= 1
                                ? "cursor-not-allowed text-gray-400 border-gray-300"
                                : "text-gray-700 hover:bg-white"
                                }`}
                        >
                            Prev
                        </Link>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <Link
                                key={p}
                                href={`?view=${view}&page=${p}`}
                                className={`px-3.5 py-1.5 border rounded-full text-sm font-medium transition-colors ${p === currentPage
                                    ? "bg-ink text-white border-ink"
                                    : "text-gray-700 hover:bg-white"
                                    }`}
                            >
                                {p}
                            </Link>
                        ))}

                        <Link
                            href={`?view=${view}&page=${nextPage}`}
                            className={`px-3.5 py-1.5 border rounded-full text-sm font-medium transition-colors ${currentPage >= totalPages
                                ? "cursor-not-allowed text-gray-400 border-gray-300"
                                : "text-gray-700 hover:bg-white"
                                }`}
                        >
                            Next
                        </Link>
                    </div>
                )}

                {/* View Controls (right) */}
                <div className="flex gap-2">
                    <Link
                        href={`?view=one&page=1`}
                        className={`px-3.5 py-1.5 border rounded-full text-sm font-medium transition-colors ${view === "one"
                            ? "bg-ink text-white border-ink"
                            : "bg-white text-gray-700"
                            }`}
                    >
                        One per row
                    </Link>
                    <Link
                        href={`?view=two&page=1`}
                        className={`hidden lg:block px-3.5 py-1.5 border rounded-full text-sm font-medium transition-colors ${view === "two"
                            ? "bg-ink text-white border-ink hidden lg:block"
                            : "bg-white text-gray-700 hidden lg:block"
                            }`}
                    >
                        Two per row
                    </Link>
                    <Link
                        href={`?view=all&page=1`}
                        className={`px-3.5 py-1.5 border rounded-full text-sm font-medium transition-colors ${view === "all"
                            ? "bg-ink text-white border-ink"
                            : "bg-white text-gray-700"
                            }`}
                    >
                        Show all
                    </Link>
                </div>
            </div>

            {/* Stores Grid */}
            {pagedStores.length > 0 ? (
                <div className={`grid ${gridColsClass} gap-6 stagger`}>
                    {pagedStores.map((store) => (
                        <Link key={store.id} href={`/stores/${store.slug}`}>
                            <Card className="h-full rounded-3xl border-0 bg-white ring-1 ring-ink/5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-grape/30">
                                <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                                    <div className="h-20 w-20 rounded-full bg-white border flex items-center justify-center mb-4">
                                        <img
                                            src={store.logo || "/placeholder.svg"}
                                            alt={store.name}
                                            className="h-12 w-12 object-contain"
                                        />
                                    </div>
                                    <h3 className="font-medium">{store.name}</h3>
                                    {/* <p className="text-sm text-gray-500 mt-1">
                                        {store.couponCount} Coupons
                                    </p> */}
                                    <div className="flex flex-col gap-2 mt-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-grape" />
                                            <span>{store.couponCount} {store.couponCount === 1 ? "Coupon" : "Coupons"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <BadgePercent className="h-4 w-4 text-ink" />
                                            <span>{store.dealCount} {store.dealCount === 1 ? "Deal" : "Deals"}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">
                    No stores available right now.
                </p>
            )}
        </div>
    )
}
