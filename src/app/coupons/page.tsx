// src/app/coupons/page.tsx
import Link from "next/link"
import { getAllCoupons } from "@/lib/data"
import { CouponCard } from "@/components/coupon-card"
import type { Coupon } from "@/lib/models"

interface SearchParams {
    page?: string
    view?: "one" | "two" | "all"
}

export const revalidate = 30   // seconds
export default async function CouponsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    const params = await searchParams
    const PAGE_SIZE = 9

    // parse page + view
    const currentPage = parseInt(params.page ?? "1", 10) || 1
    const view = params.view ?? "default"

    // fetch & filter
    const all: Coupon[] = await getAllCoupons()
    const coupons = all.filter((c) => c.type === "code")

    // decide pageSize & pagination
    const pageSize = view === "all" ? coupons.length : PAGE_SIZE
    const totalPages =
        view === "all" ? 1 : Math.ceil(coupons.length / PAGE_SIZE)
    const start = (currentPage - 1) * PAGE_SIZE
    const paged = coupons.slice(start, start + pageSize)

    const prevPage = Math.max(currentPage - 1, 1)
    const nextPage = Math.min(currentPage + 1, totalPages)

    // decide grid columns
    let gridColsClass = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    if (view === "one") gridColsClass = "grid-cols-1"
    else if (view === "two") gridColsClass = "grid-cols-2"

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-6">
                <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-ink mb-2">All Coupons</h1>
                <p className="text-gray-600">
                    Browse our collection of verified coupons.
                </p>
            </div>
            <div className="flex item-center justify-between mb-5">
                {/* Pagination */}
                {view !== "all" && totalPages > 1 && (
                    <div className="flex justify-start items-center space-x-2">
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

                {/* View Controls */}
                <div className="flex justify-end gap-2">
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
                        className={`px-3.5 py-1.5 border rounded-full text-sm font-medium transition-colors ${view === "two"
                            ? "bg-ink text-white border-ink"
                            : "bg-white text-gray-700"
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

            {/* Coupon Grid */}
            {paged.length > 0 ? (
                <div className={`grid ${gridColsClass} gap-6 stagger`}>
                    {paged.map((coupon) => (
                        <CouponCard
                            key={coupon._id?.toString()}
                            coupon={coupon}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">
                    No coupons available right now.
                </p>
            )}
        </div>
    )
}
