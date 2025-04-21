import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Store } from '@/models/Store';

export async function GET() {
    await dbConnect();
    const stores = await Store.find().sort({ name: 1 }).lean();
    return NextResponse.json(stores);
}

export async function POST(req: NextRequest) {
    const data = await req.json();
    await dbConnect();
    const created = await Store.create(data);
    return NextResponse.json(created, { status: 201 });
}
