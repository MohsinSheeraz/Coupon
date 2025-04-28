import { getAllDeals } from "@/lib/data"
import { CouponCard } from "@/components/coupon-card"

export default async function DealsPage() {
    const deals = await getAllDeals()

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">All Deals</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Browse our collection of verified deals from top stores
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {deals.map((deal) => (
                    <CouponCard key={deal._id?.toString()} coupon={deal} />
                ))}
            </div>
        </div>
    )
}
