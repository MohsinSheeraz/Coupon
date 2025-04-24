import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllCoupons, getAllStores } from "@/lib/data"
import { Tag, Store, TrendingUp, Users } from "lucide-react"

export default async function AdminDashboard() {
    const coupons = await getAllCoupons()
    const stores = await getAllStores()

    // Calculate some stats
    const totalCoupons = coupons.length
    const totalStores = stores.length
    const activeCoupons = coupons.filter((coupon) => new Date(coupon.expiryDate) > new Date()).length
    const totalUsage = coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0)

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
                        <Tag className="h-4 w-4 text-teal-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCoupons}</div>
                        <p className="text-xs text-gray-500 mt-1">{activeCoupons} active</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
                        <Store className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStores}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsage}</div>
                        <p className="text-xs text-gray-500 mt-1">Coupon redemptions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Usage</CardTitle>
                        <Users className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(totalUsage / totalCoupons)}</div>
                        <p className="text-xs text-gray-500 mt-1">Per coupon</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Coupons</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {coupons.slice(0, 5).map((coupon) => (
                                <div key={coupon.id} className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                        <img
                                            src={coupon.store?.logo || "/placeholder.svg"}
                                            alt={coupon.store?.name}
                                            className="h-6 w-6 object-contain"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{coupon.title}</p>
                                        <p className="text-sm text-gray-500">{coupon.store?.name}</p>
                                    </div>
                                    <div className="text-sm text-gray-500">{coupon.usedCount} uses</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Stores</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stores
                                .sort((a, b) => b.couponCount - a.couponCount)
                                .slice(0, 5)
                                .map((store) => (
                                    <div key={store.id} className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                            <img src={store.logo || "/placeholder.svg"} alt={store.name} className="h-6 w-6 object-contain" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{store.name}</p>
                                            <p className="text-sm text-gray-500">{store.categories[0]}</p>
                                        </div>
                                        <div className="text-sm text-gray-500">{store.couponCount} coupons</div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
