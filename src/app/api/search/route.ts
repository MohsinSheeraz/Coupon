import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Store } from '@/models/Store';
import { Coupon } from '@/models/Coupon';

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get('q') ?? '';
    await dbConnect();

    const [stores, coupons] = await Promise.all([
        Store.find({ name: { $regex: q, $options: 'i' } })
            .select('name slug logoUrl')
            .limit(6)
            .lean(),
        Coupon.find({ title: { $regex: q, $options: 'i' } })
            .populate('store', 'name slug logoUrl')
            .limit(10)
            .lean(),
    ]);

    return NextResponse.json({ stores, coupons });
}
