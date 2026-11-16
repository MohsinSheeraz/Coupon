import Link from "next/link"
import type { Route } from "next"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ListingPageSelect } from "@/components/listing-page-select"

interface ListingPaginationProps {
    pathname: string
    view: string
    currentPage: number
    totalPages: number
    category?: string
}

export function ListingPagination({
    pathname,
    view,
    currentPage,
    totalPages,
    category,
}: ListingPaginationProps) {
    const firstPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
    const lastPage = Math.min(totalPages, firstPage + 4)
    const pageHref = (page: number) => {
        const query = new URLSearchParams({ view, page: String(page) })
        if (category) query.set("category", category)
        return `${pathname}?${query.toString()}`
    }
    return (
        <div className="flex flex-wrap items-center gap-2">
            <Link
                href={pageHref(Math.max(1, currentPage - 1)) as Route}
                aria-label="Previous page"
                aria-disabled={currentPage <= 1}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${currentPage <= 1 ? "pointer-events-none text-gray-400" : "text-gray-700 hover:bg-white"}`}
            >
                <ChevronLeft size={18} />
            </Link>

            {Array.from({ length: lastPage - firstPage + 1 }, (_, index) => firstPage + index).map((page) => (
                <Link
                    key={page}
                    href={pageHref(page) as Route}
                    aria-current={page === currentPage ? "page" : undefined}
                    className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors ${page === currentPage
                        ? "border-ink bg-ink text-white"
                        : "text-gray-700 hover:bg-white"
                        }`}
                >
                    {page}
                </Link>
            ))}

            <Link
                href={pageHref(Math.min(totalPages, currentPage + 1)) as Route}
                aria-label="Next page"
                aria-disabled={currentPage >= totalPages}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${currentPage >= totalPages ? "pointer-events-none text-gray-400" : "text-gray-700 hover:bg-white"}`}
            >
                <ChevronRight size={18} />
            </Link>

            <ListingPageSelect
                pathname={pathname}
                view={view}
                currentPage={currentPage}
                totalPages={totalPages}
                category={category}
            />
        </div>
    )
}
