'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ClipboardCopy, Check } from 'lucide-react';
import clsx from 'clsx';
import { Coupon } from '@/types/coupon';

export default function CouponCard({ coupon }: { coupon: Coupon }) {
    const [copied, setCopied] = useState(false);
    const label =
        coupon.discountType === 'percent'
            ? `${coupon.discountValue}% OFF`
            : coupon.discountType === 'fixed'
                ? `₹${coupon.discountValue} OFF`
                : 'Free Shipping';

    const copy = () => {
        navigator.clipboard.writeText(coupon.code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        });
    };

    return (
        <article className="card group">
            <div className="p-4 flex items-center gap-3 border-b">
                <img
                    src={coupon.store.logoUrl}
                    alt={coupon.store.name}
                    className="rounded object-contain"
                />
                <div className="text-sm font-medium text-primary">{label}</div>
            </div>

            <div className="flex-1 p-4">
                <h3 className="font-semibold mb-1 group-hover:text-primary">
                    {coupon.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                    {coupon.description}
                </p>
            </div>

            <div className="p-4 border-t flex items-center justify-between">
                <button
                    onClick={copy}
                    className={clsx(
                        'btn px-3 py-1.5 text-sm',
                        copied && 'bg-teal-600 hover:bg-teal-600'
                    )}
                >
                    {copied ? <Check size={16} /> : <ClipboardCopy size={16} />}
                    {copied ? 'Copied' : coupon.code}
                </button>

                {coupon.url && (
                    <Link
                        href={coupon.url}
                        target="_blank"
                        className="text-sm font-medium text-primary hover:underline"
                    >
                        Get Deal →
                    </Link>
                )}
            </div>
        </article>
    );
}
