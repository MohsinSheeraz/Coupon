import Link from 'next/link';
import { dbConnect } from '@/lib/mongodb';
import { Coupon } from '@/models/Coupon';
import { Store } from '@/models/Store';
import CouponCard from '@/components/CouponCard';
import StoreCard from '@/components/StoreCard';
import CarouselSpacing from '@/components/Carousel';

export const revalidate = 60; // ISR every 1 min

export default async function Home() {
  await dbConnect();
  const [coupons, stores] = await Promise.all([
    Coupon.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('store', 'name slug logoUrl')
      .lean(),
    Store.find().sort({ createdAt: -1 }).limit(6).lean(),
  ]);

  const map = (c: any) => ({
    ...c,
    _id: c._id.toString(),
    store: { ...c.store, _id: c.store._id.toString() },
  });
  const couponsSafe = coupons.map(map);
  const storesSafe = stores.map((s: any) => ({
    ...s,
    _id: s._id.toString(),
  }));

  return (
    <>
      {/* hero */}
      <section className="bg-gradient-to-br from-primary to-teal-600 text-white">
        <CarouselSpacing />
      </section>

      {/* trending coupons */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-semibold mb-6">Trending Coupons</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {couponsSafe.map(c => (
            <CouponCard key={c._id} coupon={c} />
          ))}
        </div>
      </section>

      {/* top stores */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-semibold mb-6">Popular Stores</h2>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {storesSafe.map(s => (
            <StoreCard key={s._id} store={s} />
          ))}
        </div>
      </section>
    </>
  );
}
