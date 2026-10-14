// src/app/stores/[slug]/page.tsx
import { getStoreBySlug, getCouponsByStore } from "@/lib/data"
import { CouponCard } from "@/components/coupon-card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export const dynamic = "force-dynamic"   // keep this route fully dynamic

export default async function StoreDetailPage({
    params,
}: {
    /**  <- params itself is a Promise  */
    params: Promise<{ slug: string }>
}) {
    /* await the promise before using slug */
    const { slug } = await params

    const store = await getStoreBySlug(slug)
    if (!store) return <p className="text-center py-20">Store not found.</p>

    const items = await getCouponsByStore(store.id!)
    const coupons = items.filter(i => i.type === "code")
    const deals = items.filter(i => i.type === "deal")

    return (
        <div className="container mx-auto px-4 py-12">
            {/* ── store header ───────────────────────── */}
            <div className="relative mb-10 overflow-hidden rounded-3xl bg-ink p-6 text-white md:p-8">
                <div
                    aria-hidden
                    className="absolute inset-0 scale-150 bg-cover bg-center opacity-40 blur-3xl"
                    style={{ backgroundImage: `url("${store.logo}")` }}
                />
                <div className="relative flex items-center gap-6">
                    <div className="grid size-24 shrink-0 place-items-center rounded-3xl bg-white shadow-lg">
                        <img src={store.logo} alt={store.name} className="h-16 w-16 object-contain" />
                    </div>
                    <div>
                        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">{store.name}</h1>
                        <p className="mt-1 text-white/70">
                            {store.couponCount + store.dealCount} Coupons&nbsp;&amp;&nbsp;Deals
                        </p>
                    </div>
                </div>
            </div>

            {/* ── coupons / deals tabs ───────────────── */}
            <Tabs defaultValue="coupons" className="space-y-6">
                <TabsList className="grid h-auto grid-cols-2 rounded-full bg-mist p-1">
                    <TabsTrigger value="coupons" className="rounded-full py-2 text-base font-medium cursor-pointer data-[state=active]:bg-white data-[state=active]:text-grape">
                        Coupons
                    </TabsTrigger>
                    <TabsTrigger value="deals" className="rounded-full py-2 text-base font-medium cursor-pointer data-[state=active]:bg-white data-[state=active]:text-grape">
                        Deals
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="coupons">
                    {coupons.length ? (
                        <div className="stagger flex flex-col gap-4 pb-6">
                            {coupons.map(c => (
                                <CouponCard key={c.id} coupon={c} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No coupons available.</p>
                    )}
                </TabsContent>

                <TabsContent value="deals">
                    {deals.length ? (
                        <div className="stagger flex flex-col gap-4 pb-6">
                            {deals.map(d => (
                                <CouponCard key={d.id} coupon={d} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No deals available.</p>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
