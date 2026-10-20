import Link from "next/link"
import { BadgePercent, Tag } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Store } from "@/lib/models"

export function StoreCard({ store }: { store: Store }) {
  return (
    <Link
      href={`/stores/${store.slug}`}
      className="group block h-full rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grape focus-visible:ring-offset-4"
    >
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
  )
}
