import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllCoupons, getAllStores } from "@/lib/data"
import { Tag, Store, TrendingUp, Users, ArrowUp, ArrowDown } from "lucide-react"
import Link from "next/link"

export const revalidate = 30   // seconds
export default async function AdminDashboard() {
    const coupons = await getAllCoupons()
    const stores = await getAllStores()

    // Calculate some stats
    const totalCoupons = coupons.length
    const totalStores = stores.length
    const activeCoupons = coupons.filter((coupon) => new Date(coupon.expiryDate) > new Date()).length
    const totalUsage = coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0)

    // Calculate percentage of active coupons
    const activePercentage = totalCoupons > 0 ? Math.round((activeCoupons / totalCoupons) * 100) : 0
    const isActiveIncreasing = activePercentage > 50

    // Calculate average usage
    const avgUsage = totalCoupons > 0 ? Math.round(totalUsage / totalCoupons) : 0
    const isUsageIncreasing = avgUsage > 5 // Arbitrary threshold for demo purposes

    return (
        <div className="animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h1 className="text-3xl font-bold mb-4 md:mb-0 gradient-text">Dashboard</h1>
                <div className="text-sm text-gray-900 ">
                    Last updated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="border-dark-700 bg-dark-800/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900 ">Total Coupons</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-white border flex items-center justify-center">
                            <Tag className="h-4 w-4 text-teal-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 ">{totalCoupons}</div>
                        <div className="flex items-center mt-1">
                            <p className="text-xs text-teal-600">
                                <span className="inline-flex items-center">
                                    {activeCoupons} active
                                    <span className="ml-1 text-xs flex items-center">
                                        {isActiveIncreasing ? (
                                            <ArrowUp className="h-3 w-3 text-green-500" />
                                        ) : (
                                            <ArrowDown className="h-3 w-3 text-red-500" />
                                        )}
                                        <span className={isActiveIncreasing ? "text-green-500" : "text-red-500"}>{activePercentage}%</span>
                                    </span>
                                </span>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-dark-700 bg-dark-800/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900 ">Total Stores</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-white border flex items-center justify-center">
                            <Store className="h-4 w-4 text-teal-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 ">{totalStores}</div>
                        <div className="h-1 w-full bg-dark-600 rounded-full mt-2">
                            <div
                                className="h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"
                                style={{ width: `${Math.min(100, (totalStores / 20) * 100)}%` }}
                            ></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-dark-700 bg-dark-800/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900 ">Total Usage</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-white border flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-teal-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 ">{totalUsage}</div>
                        <p className="text-xs text-gray-900  mt-1">Coupon redemptions</p>
                    </CardContent>
                </Card>

                <Card className="border-dark-700 bg-dark-800/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900 ">Avg. Usage</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-white border flex items-center justify-center">
                            <Users className="h-4 w-4 text-teal-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 ">{avgUsage}</div>
                        <div className="flex items-center mt-1">
                            <p className="text-xs text-gray-900 ">
                                Per coupon
                                <span className="ml-1 text-xs flex items-center">
                                    {isUsageIncreasing ? (
                                        <ArrowUp className="h-3 w-3 text-green-500" />
                                    ) : (
                                        <ArrowDown className="h-3 w-3 text-red-500" />
                                    )}
                                    <span className={isUsageIncreasing ? "text-green-500" : "text-red-500"}>
                                        {isUsageIncreasing ? "+12%" : "-5%"}
                                    </span>
                                </span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-dark-700 bg-dark-800/50">
                    <CardHeader>
                        <CardTitle className="text-gray-900 ">Recent Coupons</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {coupons.slice(0, 5).map((coupon) => (
                                <Link
                                    key={coupon.id}
                                    href={`/admin/coupons/edit/${coupon.id}`}
                                    className="block hover:bg-dark-700 rounded-md transition-colors"
                                >
                                    <div className="flex items-center p-2">
                                        <div className="h-10 w-10 rounded-full bg-dark-700 flex items-center justify-center mr-3 border border-dark-600">
                                            <img
                                                src={coupon.store?.logo || "/placeholder.svg"}
                                                alt={coupon.store?.name}
                                                className="h-6 w-6 object-contain"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 ">{coupon.title}</p>
                                            <p className="text-sm text-gray-900 ">{coupon.store?.name}</p>
                                        </div>
                                        <div className="text-sm text-gray-900 ">{coupon.usedCount} uses</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-dark-700 bg-dark-800/50">
                    <CardHeader>
                        <CardTitle className="text-gray-900 ">Top Stores</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stores
                                .sort((a, b) => b.couponCount - a.couponCount)
                                .slice(0, 5)
                                .map((store) => (
                                    <Link
                                        key={store.id}
                                        href={`/admin/stores/edit/${store.id}`}
                                        className="block hover:bg-dark-700 rounded-md transition-colors"
                                    >
                                        <div className="flex items-center p-2">
                                            <div className="h-10 w-10 rounded-full bg-dark-700 flex items-center justify-center mr-3 border border-dark-600">
                                                <img
                                                    src={store.logo || "/placeholder.svg"}
                                                    alt={store.name}
                                                    className="h-6 w-6 object-contain"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 ">{store.name}</p>
                                                <p className="text-sm text-gray-900 ">{store.categories[0]}</p>
                                            </div>
                                            <div className="text-sm text-gray-900 ">{store.couponCount} coupons</div>
                                        </div>
                                    </Link>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}