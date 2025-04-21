import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Coupon } from '@/models/Coupon';

export async function GET(req: NextRequest) {
    await dbConnect();
    const params = req.nextUrl.searchParams;
    const filter: any = {};
    if (params.get('store')) filter.store = params.get('store');
    if (params.get('q'))
        filter.title = { $regex: params.get('q'), $options: 'i' };

    const coupons = await Coupon.find(filter)
        .populate('store', 'name slug logoUrl')
        .sort({ createdAt: -1 })
        .lean();

    return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
    const data = await req.json();
    await dbConnect();
    const created = await Coupon.create(data);
    return NextResponse.json(created, { status: 201 });
}
