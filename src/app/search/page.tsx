import { searchCouponsAndStores } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tag, Percent, Store } from "lucide-react"
import Link from "next/link"

export default async function SearchPage({
    searchParams,
}: {
    searchParams: { q: string }
}) {
    const query = searchParams.q || ""
    const { coupons, stores } = await searchCouponsAndStores(query)

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="mb-12">
                <h1 className="text-3xl font-bold mb-4">Search Results for "{query}"</h1>
                <p className="text-gray-600">
                    Found {coupons.length} coupons and {stores.length} stores
                </p>
            </div>

            {stores.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Stores</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {stores.map((store) => (
                            <Link key={store.id} href={`/stores/${store.slug}`}>
                                <Card className="hover:shadow-md transition-shadow h-full">
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
                    <h2 className="text-2xl font-bold mb-6">Coupons</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coupons.map((coupon) => (
                            <Card key={coupon.id} className="hover:shadow-md transition-shadow h-full">
                                <CardContent className="p-6 flex flex-col h-full">
                                    <div className="flex items-center mb-4">
                                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                                            <img
                                                src={coupon.store.logo || "/placeholder.svg"}
                                                alt={coupon.store.name}
                                                className="h-8 w-8 object-contain"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{coupon.store.name}</h3>
                                            <p className="text-sm text-gray-500">Verified {coupon.verifiedTime}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start mb-3">
                                        {coupon.type === "code" ? (
                                            <Tag className="h-5 w-5 text-teal-600 mr-2 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <Percent className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                                        )}
                                        <p className="font-medium">{coupon.title}</p>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-4 flex-grow">{coupon.description}</p>

                                    <div className="flex justify-between items-center mt-auto">
                                        <span className="text-sm text-gray-500">Used {coupon.usedCount} times</span>
                                        <Button
                                            className={
                                                coupon.type === "code" ? "bg-teal-600 hover:bg-teal-700" : "bg-purple-600 hover:bg-purple-700"
                                            }
                                        >
                                            {coupon.type === "code" ? "Get Code" : "Get Deal"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {coupons.length === 0 && stores.length === 0 && (
                <div className="text-center py-12">
                    <Store className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">No results found</h2>
                    <p className="text-gray-600 mb-6">We couldn't find any coupons or stores matching "{query}"</p>
                    <Link href="/">
                        <Button className="bg-teal-600 hover:bg-teal-700">Back to Home</Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
