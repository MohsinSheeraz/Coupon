// src/app/stores/page.tsx
import Link from "next/link"
import { categoryKey, categoriesMatch } from "@/lib/categories"
import { getAllStores } from "@/lib/data"
import type { Store } from "@/lib/models"
import MobilePageSearch from "@/components/mobile-page-search"
import { StoreCard } from "@/components/store-card"

interface SearchParams {
    page?: string
    view?: "one" | "two" | "all"
    category?: string
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
    const category = params.category?.trim()

    // ▶ fetch stores
    const stores: Store[] = await getAllStores()
const allStores =
    category && categoryKey(category)
        ? stores.filter((s) => (s.categories ?? []).some((c) => categoriesMatch(c, category)))
        : stores
    const categoryQuery = category ? `&category=${encodeURIComponent(category)}` : ""

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
                <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-ink mb-2">
                    {category ? `${category} Stores` : "All Stores"}
                </h1>
                <p className="text-gray-600">
                    {category
                        ? `Browse stores in ${category}.`
                        : "Browse our collection of stores and find the best coupons and deals"}
                </p>
            </div>

            {/* Controls Bar */}
            <div className="listing-controls">
                <div className="listing-pagination-row">
                    {view !== "all" && totalPages > 1 && (
                        <div className="flex items-center space-x-2">
                        <Link
                            href={`?view=${view}&page=${prevPage}${categoryQuery}`}
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
                                href={`?view=${view}&page=${p}${categoryQuery}`}
                                className={`px-3.5 py-1.5 border rounded-full text-sm font-medium transition-colors ${p === currentPage
                                    ? "bg-ink text-white border-ink"
                                    : "text-gray-700 hover:bg-white"
                                    }`}
                            >
                                {p}
                            </Link>
                        ))}

                        <Link
                            href={`?view=${view}&page=${nextPage}${categoryQuery}`}
                            className={`px-3.5 py-1.5 border rounded-full text-sm font-medium transition-colors ${currentPage >= totalPages
                                ? "cursor-not-allowed text-gray-400 border-gray-300"
                                : "text-gray-700 hover:bg-white"
                                }`}
                        >
                            Next
                        </Link>
                        </div>
                    )}
                </div>

                <div className="listing-view-controls flex gap-2 overflow-x-auto md:hidden">
                    <Link
                        href={`?view=one&page=1${categoryQuery}`}
                        className={`whitespace-nowrap px-3.5 py-1.5 border rounded-full text-sm font-medium transition-colors ${view === "one"
                            ? "bg-ink text-white border-ink"
                            : "bg-white text-gray-700"
                            }`}
                    >
                        One per row
                    </Link>
                    <Link
                        href={`?view=two&page=1${categoryQuery}`}
                        className={`whitespace-nowrap px-3.5 py-1.5 border rounded-full text-sm font-medium transition-colors ${view === "two"
                            ? "bg-ink text-white border-ink"
                            : "bg-white text-gray-700"
                            }`}
                    >
                        Two per row
                    </Link>
                    <Link
                        href={`?view=all&page=1${categoryQuery}`}
                        className={`whitespace-nowrap px-3.5 py-1.5 border rounded-full text-sm font-medium transition-colors ${view === "all"
                            ? "bg-ink text-white border-ink"
                            : "bg-white text-gray-700"
                            }`}
                    >
                        Show all
                    </Link>
                </div>
                <MobilePageSearch />
            </div>

            {/* Stores Grid */}
            {pagedStores.length > 0 ? (
                <div className={`grid ${gridColsClass} gap-6 stagger`}>
                    {pagedStores.map((store) => (
                        <StoreCard key={store.id} store={store} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">
                    {category ? `No stores found in ${category}.` : "No stores available right now."}
                </p>
            )}
        </div>
    )
}
