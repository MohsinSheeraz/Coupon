import { searchCouponsAndStores } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Store } from "lucide-react"
import Link from "next/link"
import { CouponCard } from "@/components/coupon-card"
import { StoreCard } from "@/components/store-card"

// 👇  add this line (or rename it however you like)
type SearchParams = Record<string, string | string[] | undefined>

export default async function SearchPage({
    searchParams,
}: {
    // Next.js wants a *Promise* here:
    searchParams?: Promise<SearchParams>
}) {
    const sp = (await searchParams) ?? {}
    const raw = sp.q
    const query = Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "")

    const { coupons, stores } = await searchCouponsAndStores(query)

    return (
        <div className="listing-page container mx-auto px-4 py-12">
            <div className="listing-intro mb-12">
                <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-ink mb-4">Search Results for "{query}"</h1>
                <p className="text-gray-600">
                    Found {coupons.length} coupons and {stores.length} stores
                </p>
            </div>

            {stores.length > 0 && (
                <div className="mb-12">
                    <h2 className="font-display text-2xl font-semibold tracking-tight text-ink mb-6">Stores</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {stores.map((store) => (
                            <StoreCard key={store.id} store={store} />
                        ))}
                    </div>
                </div>
            )}

            {coupons.length > 0 && (
                <div>
                    <h2 className="font-display text-2xl font-semibold tracking-tight text-ink mb-6">Coupons</h2>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                        {coupons.map((coupon) => <CouponCard key={coupon.id} coupon={coupon} />)}
                    </div>
                </div>
            )}

            {coupons.length === 0 && stores.length === 0 && (
                <div className="text-center py-12">
                    <Store className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">No results found</h2>
                    <p className="text-gray-600 mb-6">We couldn't find any coupons or stores matching "{query}"</p>
                    <Link href="/">
                        <Button className="bg-grape text-white rounded-full hover:bg-grape-deep">Back to Home</Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
