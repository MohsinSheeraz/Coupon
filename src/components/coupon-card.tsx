// File: src/components/coupon-card.tsx

"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BadgeCheck, Tag, Percent } from "lucide-react"
import { cn } from "@/lib/utils"
import { CouponModal } from "./coupon-modal"

export function CouponCard({ coupon }: { coupon: any }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const isCode = coupon.type === "code"

    return (
        <>
            <div className="ticket-shell h-full">
                <article className="ticket relative flex h-full flex-col">
                    {/* Stub: store info */}
                    <header className="flex h-[92px] shrink-0 items-center gap-3 px-5">
                        <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-paper ring-1 ring-ink/5">
                            <img
                                src={coupon.store?.logo || "/placeholder.svg"}
                                alt={coupon.store?.name}
                                className="size-8 object-contain"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="truncate font-display text-base font-semibold text-ink">
                                {coupon.store?.name}
                            </h3>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-ink/55">
                                <BadgeCheck className="size-3.5 shrink-0 text-mint" />
                                <span className="truncate">Verified {coupon.verifiedTime}</span>
                            </p>
                        </div>
                        <span
                            className={cn(
                                "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                                isCode ? "bg-grape/10 text-grape" : "bg-citrus text-ink",
                            )}
                        >
                            {isCode ? <Tag className="size-3" /> : <Percent className="size-3" />}
                            {isCode ? "Code" : "Deal"}
                        </span>
                    </header>

                    {/* Tear line */}
                    <div aria-hidden className="ticket-perf" />

                    {/* Body */}
                    <div className="flex flex-1 flex-col px-5 pb-5 pt-6">
                        <p className="font-display text-lg font-semibold leading-snug text-ink">{coupon.title}</p>

                        <p className="mb-5 mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink/60">
                            {coupon.description}
                        </p>

                        <div className="mt-auto flex items-center justify-between gap-3">
                            <span className="text-xs text-ink/50">Used {coupon.usedCount} times</span>
                            <div className="flex items-center gap-2">
                                {coupon.affiliateLink && (
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="rounded-full border-ink/15 bg-white px-4 text-ink hover:border-grape hover:bg-white hover:text-grape"
                                    >
                                        <Link
                                            href={coupon.affiliateLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Visit
                                        </Link>
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    className={cn(
                                        "cursor-pointer rounded-full px-4 font-semibold",
                                        isCode
                                            ? "bg-grape text-white shadow-[0_8px_18px_-8px_rgb(91_61_245/0.8)] hover:bg-grape-deep"
                                            : "bg-citrus text-ink shadow-[0_8px_18px_-8px_rgb(255_210_63/0.9)] hover:bg-citrus/80",
                                    )}
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    {isCode ? "Get Code" : "Get Deal"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </article>
            </div>

            <CouponModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} coupon={coupon} />
        </>
    )
}
