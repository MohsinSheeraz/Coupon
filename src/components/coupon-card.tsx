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
                    className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white transition-colors duration-300 hover:border-grape/40 sm:rounded-3xl"
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
                            className="relative size-full object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-105 sm:p-3"
                        />

                        <span
                            className={cn(
                                "absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold sm:left-3 sm:top-3 sm:px-2.5 sm:text-xs",
                                isCode ? "bg-grape text-white" : "bg-citrus text-ink",
                            )}
                        >
                            {isCode ? <Tag className="size-3" /> : <Percent className="size-3" />}
                            {isCode ? "Code" : "Deal"}
                        </span>

                        {expiry && (
                            <span
                                className={cn(
                                    "absolute right-2 top-2 inline-flex max-w-[58%] items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium sm:right-3 sm:top-3 sm:max-w-none sm:px-2.5 sm:text-xs",
                                    EXPIRY_TONES[expiry.tone],
                                )}
                            >
                                <Clock className="size-3" />
                                <span className="truncate">{expiry.label}</span>
                            </span>
                        )}

                        {/* Store chip */}
                        <span className="absolute bottom-2 left-2 inline-flex max-w-[85%] items-center gap-1 rounded-full bg-white py-1 pl-1 pr-2 text-[10px] font-medium text-ink ring-1 ring-ink/10 sm:bottom-3 sm:left-3 sm:max-w-[70%] sm:gap-1.5 sm:pr-3 sm:text-xs">
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
                    <div className="flex flex-1 flex-col gap-1.5 px-2.5 pb-3 pt-2.5 sm:gap-2 sm:px-4 sm:pb-4 sm:pt-3.5">
                        <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-ink sm:text-base">
                            {coupon.title}
                        </h3>

                        {coupon.description && (
                            <p className="line-clamp-2 text-xs leading-relaxed text-ink/60 sm:text-sm">{coupon.description}</p>
                        )}

                        <p className="flex items-center gap-1 text-[10px] text-ink/55 sm:text-xs">
                            <BadgeCheck className="size-3 shrink-0 text-mint sm:size-3.5" />
                            <span className="truncate">
                                Verified {coupon.verifiedTime} · Used {coupon.usedCount} times
                            </span>
                        </p>

                        <div className="mt-auto flex items-center gap-1.5 pt-1.5 sm:gap-2 sm:pt-2">
                            {coupon.affiliateLink && (
                                <Link
                                    href={coupon.affiliateLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Visit ${coupon.store?.name ?? "store"}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="hidden size-10 shrink-0 place-items-center rounded-full border border-ink/15 text-ink transition-colors hover:border-grape hover:text-grape sm:grid"
                                >
                                    <ExternalLink className="size-4" />
                                </Link>
                            )}

                            {isCode ? (
                                <Button
                                    className="h-9 flex-1 cursor-pointer justify-between rounded-full bg-grape px-2.5 text-[10px] font-semibold text-white hover:bg-grape-deep sm:h-10 sm:px-4 sm:text-sm"
                                >
                                    <span className="font-mono text-[10px] tracking-tight text-white/80 sm:text-sm sm:tracking-widest">
                                        {maskCode(coupon.code)}
                                    </span>
                                    <span>Get code</span>
                                </Button>
                            ) : (
                                <Button className="h-9 flex-1 cursor-pointer rounded-full bg-citrus px-2.5 text-xs font-semibold text-ink hover:bg-citrus/80 sm:h-10 sm:px-4 sm:text-sm">
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