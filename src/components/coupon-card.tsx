// File: src/components/coupon-card.tsx

"use client"

import { useState } from "react"
import Link from "next/link"
import { BadgeCheck, Clock, ExternalLink, Percent, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getExpiry, getOfferImage, maskCode } from "@/lib/offer"
import { CouponModal } from "./coupon-modal"

const EXPIRY_TONES = {
    ok: "bg-white/90 text-ink/70 ring-1 ring-ink/10",
    soon: "bg-amber-100 text-amber-800",
    expired: "bg-red-100 text-red-700",
} as const

export function CouponCard({ coupon }: { coupon: any }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const isCode = coupon.type === "code"
    const image = getOfferImage(coupon)
    const expiry = getExpiry(coupon.expiryDate)
    const open = () => setIsModalOpen(true)

    return (
        <>
            <div className="ticket-shell h-full">
                {/* Whole card opens the modal for mouse users; keyboard users get the real button below */}
                <article
                    onClick={open}
                    className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white transition-colors duration-300 hover:border-grape/40"
                >
                    {/* Product image */}
                    <div className="relative aspect-[4/3] max-h-72 w-full overflow-hidden bg-paper">
                        <div
                            aria-hidden
                            className="absolute inset-0 scale-150 bg-cover bg-center opacity-30 blur-2xl"
                            style={{ backgroundImage: `url("${image}")` }}
                        />
                        <img
                            src={image}
                            alt={coupon.title}
                            loading="lazy"
                            className="relative size-full object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-105"
                        />

                        <span
                            className={cn(
                                "absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                                isCode ? "bg-grape text-white" : "bg-citrus text-ink",
                            )}
                        >
                            {isCode ? <Tag className="size-3" /> : <Percent className="size-3" />}
                            {isCode ? "Code" : "Deal"}
                        </span>

                        {expiry && (
                            <span
                                className={cn(
                                    "absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                                    EXPIRY_TONES[expiry.tone],
                                )}
                            >
                                <Clock className="size-3" />
                                {expiry.label}
                            </span>
                        )}

                        {/* Store chip */}
                        <span className="absolute bottom-3 left-3 inline-flex max-w-[70%] items-center gap-1.5 rounded-full bg-white py-1 pl-1 pr-3 text-xs font-medium text-ink ring-1 ring-ink/10">
                            <span className="grid size-5 shrink-0 place-items-center overflow-hidden rounded-full bg-paper">
                                <img
                                    src={coupon.store?.logo || "/placeholder.svg"}
                                    alt=""
                                    className="size-4 object-contain"
                                />
                            </span>
                            <span className="truncate">{coupon.store?.name}</span>
                        </span>
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3.5">
                        <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-ink">
                            {coupon.title}
                        </h3>

                        {coupon.description && (
                            <p className="line-clamp-2 text-sm leading-relaxed text-ink/60">{coupon.description}</p>
                        )}

                        <p className="flex items-center gap-1 text-xs text-ink/55">
                            <BadgeCheck className="size-3.5 shrink-0 text-mint" />
                            <span className="truncate">
                                Verified {coupon.verifiedTime} · Used {coupon.usedCount} times
                            </span>
                        </p>

                        <div className="mt-auto flex items-center gap-2 pt-2">
                            {coupon.affiliateLink && (
                                <Link
                                    href={coupon.affiliateLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Visit ${coupon.store?.name ?? "store"}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="grid size-10 shrink-0 place-items-center rounded-full border border-ink/15 text-ink transition-colors hover:border-grape hover:text-grape"
                                >
                                    <ExternalLink className="size-4" />
                                </Link>
                            )}

                            {isCode ? (
                                <Button
                                    className="h-10 flex-1 cursor-pointer justify-between rounded-full bg-grape pl-4 pr-4 font-semibold text-white hover:bg-grape-deep"
                                >
                                    <span className="font-mono text-sm tracking-widest text-white/80">
                                        {maskCode(coupon.code)}
                                    </span>
                                    <span>Get code</span>
                                </Button>
                            ) : (
                                <Button className="h-10 flex-1 cursor-pointer rounded-full bg-citrus font-semibold text-ink hover:bg-citrus/80">
                                    Get deal
                                </Button>
                            )}
                        </div>
                    </div>
                </article>
            </div>

            <CouponModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} coupon={coupon} />
        </>
    )
}