'use client';

import Link from 'next/link';
import { ShoppingBag, Tag } from 'lucide-react';
import SearchBar from './SearchBar';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function Navbar() {
    const pathname = usePathname();
    const active = (p: string) =>
        clsx(
            'flex items-center gap-1.5 border-b-2 pb-0.5',
            pathname.startsWith(p)
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-primary'
        );

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur shadow-sm">
            <div className="max-w-7xl mx-auto h-16 px-4 flex items-center gap-8">
                <Link href="/" className="text-xl font-semibold text-primary">
                    CouponHub
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/stores" className={active('/stores')}>
                        <ShoppingBag size={18} />
                        Stores
                    </Link>
                    <Link href="/coupons" className={active('/coupons')}>
                        <Tag size={18} />
                        Coupons
                    </Link>
                </nav>

                <div className="flex-1">
                    <SearchBar placeholder="Search coupons or stores…" />
                </div>
            </div>
        </header>
    );
}
