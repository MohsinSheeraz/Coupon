import { searchCouponsAndStores } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Store } from "lucide-react"
import Link from "next/link"
import { CouponCard } from "@/components/coupon-card"

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
                            <Link key={store.id} href={`/stores/${store.slug}`}>
                                <Card className="h-full rounded-3xl border-0 bg-white ring-1 ring-ink/5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-grape/30">
                                    <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                                        <div className="h-16 w-16 rounded-full bg-white border flex items-center justify-center mb-4">
                                            <img
                                                src={store.logo || "/placeholder.svg"}
                                                alt={store.name}
                                                className="h-10 w-10 object-contain"
                                            />
                                        </div>
                                        <h3 className="font-medium">{store.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{store.couponCount} Coupons</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {coupons.length > 0 && (
                <div>
                    <h2 className="font-display text-2xl font-semibold tracking-tight text-ink mb-6">Coupons</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
