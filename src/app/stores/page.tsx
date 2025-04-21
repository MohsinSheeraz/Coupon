import StoreCard from '@/components/StoreCard';
import { dbConnect } from '@/lib/mongodb';
import { Store } from '@/models/Store';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Stores | CouponHub' };

export default async function StoresPage() {
    await dbConnect();
    const raw = await Store.find().sort({ name: 1 }).lean();
    const stores = raw.map((s: any) => ({ ...s, _id: s._id.toString() }));

    return (
        <main className="max-w-7xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-semibold mb-6">All Stores</h1>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {stores.map(s => (
                    <StoreCard key={s._id} store={s} />
                ))}
            </div>
        </main>
    );
}
