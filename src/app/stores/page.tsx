// src/app/stores/page.tsx
import Link from "next/link"
import { getAllStores } from "@/lib/data"
import type { Store } from "@/lib/models"
import { Card, CardContent } from "@/components/ui/card"
import { BadgePercent, Tag } from "lucide-react"

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
    const normalizeCategory = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "")
    const normalizedCategory = category ? normalizeCategory(category) : ""
    const allStores = normalizedCategory
        ? stores.filter((store) =>
            store.categories.some((storeCategory) => {
                const normalizedStoreCategory = normalizeCategory(storeCategory)
                return normalizedStoreCategory === normalizedCategory
                    || normalizedStoreCategory.replace(/s$/, "") === normalizedCategory.replace(/s$/, "")
            }),
        )
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
            </div>

            {/* Stores Grid */}
            {pagedStores.length > 0 ? (
                <div className={`grid ${gridColsClass} gap-6 stagger`}>
                    {pagedStores.map((store) => (
                        <Link key={store.id} href={`/stores/${store.slug}`} className="group block h-full rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-offset-4">
                            <Card className="h-full min-h-[250px] gap-0 overflow-hidden rounded-3xl border border-[#e5e9df] bg-white p-0 shadow-[0_8px_24px_-18px_rgba(34,39,32,0.35)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#b9c9ac] group-hover:shadow-[0_18px_36px_-20px_rgba(34,39,32,0.35)]">
                                <CardContent className="flex h-full flex-col items-center p-5 text-center sm:p-6">
                                    <div className="mb-4 grid h-[76px] w-[76px] shrink-0 place-items-center rounded-2xl bg-[#f3f6ee] ring-1 ring-inset ring-[#e8ecdf] transition-colors group-hover:bg-[#edf2e6]">
                                        <img
                                            src={store.logo || "/placeholder.svg"}
                                            alt={store.name}
                                            className="h-12 w-12 object-contain"
                                        />
                                    </div>
                                    <h3 className="line-clamp-2 min-h-10 text-base font-semibold leading-5 text-ink transition-colors group-hover:text-grape">
                                        {store.name}
                                    </h3>
                                    <div className="mt-auto flex w-full flex-col gap-2 border-t border-[#edf0e8] pt-4 text-sm">
                                        <div className="flex items-center justify-between gap-2 text-ink/70">
                                            <span className="flex items-center gap-2">
                                                <Tag className="h-4 w-4 text-grape" aria-hidden="true" />
                                                Coupons
                                            </span>
                                            <span className="min-w-7 rounded-full bg-[#f3f6ee] px-2 py-0.5 text-center text-xs font-semibold text-ink">
                                                {store.couponCount}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 text-ink/70">
                                            <span className="flex items-center gap-2">
                                                <BadgePercent className="h-4 w-4 text-ink/70" aria-hidden="true" />
                                                Deals
                                            </span>
                                            <span className="min-w-7 rounded-full bg-[#f3f6ee] px-2 py-0.5 text-center text-xs font-semibold text-ink">
                                                {store.dealCount}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
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
