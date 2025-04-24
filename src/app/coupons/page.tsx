import { getAllCoupons } from "@/lib/data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CouponCard } from "@/components/coupon-card"

export default async function CouponsPage() {
    const coupons = await getAllCoupons()

    // Group coupons by type
    const codeCoupons = coupons.filter((coupon) => coupon.type === "code")
    const dealCoupons = coupons.filter((coupon) => coupon.type === "deal")

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">All Coupons</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Browse our collection of verified coupons and deals from top stores
                </p>
            </div>

            <Tabs defaultValue="all" className="mb-8">
                <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="codes">Codes</TabsTrigger>
                    <TabsTrigger value="deals">Deals</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                        {coupons.map((coupon) => (
                            <CouponCard key={coupon._id?.toString()} coupon={coupon} />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="codes">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                        {codeCoupons.map((coupon) => (
                            <CouponCard key={coupon._id?.toString()} coupon={coupon} />
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value="deals">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                        {dealCoupons.map((coupon) => (
                            <CouponCard key={coupon._id?.toString()} coupon={coupon} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
