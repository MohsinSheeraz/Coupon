import CouponCard from '@/components/CouponCard';
import { dbConnect } from '@/lib/mongodb';
import { Coupon as CouponModel } from '@/models/Coupon';
import { Coupon as CouponType } from '@/types/coupon';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Coupons | CouponHub' };

interface PageProps {
    searchParams: { q?: string; store?: string };
}

export default async function CouponsPage({ searchParams }: PageProps) {
    await dbConnect();

    const filter: Record<string, any> = { isActive: true };
    if (searchParams?.q)
        filter.title = { $regex: searchParams.q, $options: 'i' };
    if (searchParams?.store) filter.store = searchParams.store;

    const rawCoupons = await CouponModel.find(filter)
        .sort({ createdAt: -1 })
        .populate('store', 'name slug logoUrl')
        .lean();

    const coupons: CouponType[] = rawCoupons.map((c: any) => ({
        ...c,
        _id: c._id.toString(),
        store: { ...c.store, _id: c.store._id.toString() },
    }));

    return (
        <main className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold mb-6">
                {searchParams?.q
                    ? `Results for “${searchParams.q}”`
                    : 'Latest Coupons'}
            </h1>

            {!coupons.length && (
                <p className="text-muted">No coupons found – try another search.</p>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {coupons.map(coupon => (
                    <CouponCard key={coupon._id} coupon={coupon} />
                ))}
            </div>
        </main>
    );
}
