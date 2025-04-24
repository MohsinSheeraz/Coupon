import Link from "next/link"
import { getAllStores } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"

export default async function StoresPage() {
    const stores = await getAllStores()

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">All Stores</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Browse our collection of stores and find the best coupons and deals
                </p>
            </div>

            <StoreGrid stores={stores} />
        </div>
    )
}

function StoreGrid({ stores }: { stores: any[] }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {stores.map((store) => (
                <Link key={store.id ?? store._id?.toString?.() ?? store.slug} href={`/stores/${store.slug}`}>
                    <Card className="hover:shadow-md transition-shadow h-full">
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                            <div className="h-20 w-20 rounded-full bg-white border flex items-center justify-center mb-4">
                                <img src={store.logo || "/placeholder.svg"} alt={store.name} className="h-12 w-12 object-contain" />
                            </div>
                            <h3 className="font-medium">{store.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{store.couponCount} Coupons</p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}
