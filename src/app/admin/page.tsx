import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminDashboardStats, getRecentCoupons, getAllStores } from "@/lib/data"
import { countActiveVisitors } from "@/lib/presence"
import { ActiveUsersMetric } from "@/components/admin/active-users-metric"
import { Layers, Store, TicketPercent, Percent, TrendingUp } from "lucide-react"
import Link from "next/link"

export const revalidate = 30   // seconds
export default async function AdminDashboard() {
    const [stats, coupons, stores, activeUsers] = await Promise.all([
        getAdminDashboardStats(),
        getRecentCoupons(5),
        getAllStores(),
        countActiveVisitors(3),
    ])
    const metrics = [
        { title: "All Items", value: stats.allItems, icon: <Layers className="h-5 w-5" />, color: "violet" },
        { title: "Stores", value: stores.length, icon: <Store className="h-5 w-5" />, color: "teal", caption: "Numbers are in Total" },
        { title: "Coupons", value: stats.coupons, icon: <TicketPercent className="h-5 w-5" />, color: "amber", caption: "Numbers are in Total" },
        { title: "Deals", value: stats.deals, icon: <Percent className="h-5 w-5" />, color: "blue", caption: "Numbers are in Total" },
        { title: "Usage", value: stats.usage, icon: <TrendingUp className="h-5 w-5" />, color: "green", caption: "Coupon and deal redemptions" },
    ] as const

    return (
        <div className="animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h1 className="text-3xl font-bold mb-4 md:mb-0 gradient-text">Dashboard</h1>
                <div className="text-sm text-gray-900 ">
                    Last updated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                {metrics.map((metric) => (
                    <Card key={metric.title} className={`admin-metric-card admin-metric-card--${metric.color}`}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle>{metric.title}</CardTitle>
                            <span className="admin-metric-icon">{metric.icon}</span>
                        </CardHeader>
                        <CardContent>
                            <div className="admin-metric-value">{metric.value.toLocaleString()}</div>
                            <p className="admin-metric-caption">{"caption" in metric ? metric.caption : "\u00a0"}</p>
                        </CardContent>
                    </Card>
                ))}
                <ActiveUsersMetric initialCount={activeUsers} />
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