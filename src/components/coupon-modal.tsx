"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Copy, ExternalLink, X } from "lucide-react"
import { toast } from "sonner"
import { getExpiry, getOfferImage } from "@/lib/offer"

interface CouponModalProps {
    isOpen: boolean
    onClose: () => void
    coupon: any
}

export function CouponModal({ isOpen, onClose, coupon }: CouponModalProps) {
    const [copied, setCopied] = useState(false)
    const image = getOfferImage(coupon)
    const expiry = getExpiry(coupon?.expiryDate)

    useEffect(() => {
        if (isOpen) {
            setCopied(false)
            if (coupon?._id) {
                fetch("/api/coupons/increment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: coupon._id }),
                }).catch(() => toast.error("Failed to record coupon usage"))
            }
        }
    }, [isOpen, coupon])

    const affiliateLink = coupon?.affiliateLink || coupon?.store?.website

    const copyToClipboard = () => {
        if (coupon?.code) {
            navigator.clipboard.writeText(coupon.code)
            setCopied(true)
            toast.success("Coupon code copied to clipboard!")
            setTimeout(() => setCopied(false), 3000)
        }
    }

    if (!coupon) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto overflow-x-hidden rounded-3xl border-0 bg-white p-0 text-ink shadow-2xl data-[state=open]:duration-300 sm:max-w-md">
                <DialogClose asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Close"
                        className="absolute right-3 top-3 z-10 cursor-pointer rounded-full text-ink/60 hover:bg-ink/5 hover:text-ink"
                    >
                        <X />
                    </Button>
                </DialogClose>

                {/* Product header */}
                <div className="relative overflow-hidden bg-paper px-5 pb-5 pt-8 text-center sm:px-6 sm:pb-6">
                    <div
                        aria-hidden
                        className="absolute inset-0 scale-150 bg-cover bg-center opacity-30 blur-3xl"
                        style={{ backgroundImage: `url("${image}")` }}
                    />
                    <div className="relative flex flex-col items-center">
                        <div className="grid size-36 place-items-center overflow-hidden rounded-2xl bg-white ring-1 ring-ink/10 sm:size-52">
                            <img src={image} alt={coupon.title} className="size-full object-contain p-2" />
                        </div>

                        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white py-1 pl-1 pr-3 text-xs font-medium ring-1 ring-ink/10">
                            <span className="grid size-5 place-items-center overflow-hidden rounded-full bg-paper">
                                <img
                                    src={coupon.store?.logo || "/placeholder.svg"}
                                    alt=""
                                    className="size-4 object-contain"
                                />
                            </span>
                            {coupon.store?.name}
                        </span>

                        <DialogHeader className="mt-3 items-center text-center sm:text-center">
                            <DialogTitle className="font-display text-xl font-semibold leading-snug text-ink">
                                {coupon.title}
                            </DialogTitle>
                            <DialogDescription className="text-ink/60">
                                {[expiry?.label, coupon.verifiedTime && `Verified ${coupon.verifiedTime}`]
                                    .filter(Boolean)
                                    .join(" · ")}
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                </div>

                {/* Tear line */}
                <div aria-hidden className="border-t-2 border-dashed border-ink/15" />

                <div className="flex flex-col px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
                    {coupon.type === "code" ? (
                        <>
                            {/* Code box with copy icon */}
                            <div className="mb-3 flex items-center justify-between rounded-2xl border-2 border-dashed border-grape/40 bg-grape/5 p-4">
                                <span className="select-all break-all font-mono text-2xl font-bold tracking-wider text-grape">
                                    {coupon.code}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={copyToClipboard}
                                    aria-label="Copy code"
                                    className="ml-2 size-11 shrink-0 cursor-pointer rounded-full text-grape hover:bg-grape/10 hover:text-grape"
                                >
                                    {copied ? (
                                        <Check key="check" className="anim-pop size-6 text-mint" />
                                    ) : (
                                        <Copy key="copy" className="size-6" />
                                    )}
                                </Button>
                            </div>

                            {/* Full-width "Copy Code" button */}
                            <Button
                                onClick={copyToClipboard}
                                className={
                                    "h-12 w-full cursor-pointer rounded-full text-base font-semibold text-white transition-colors " +
                                    (copied ? "bg-mint hover:bg-mint" : "bg-grape hover:bg-grape-deep")
                                }
                            >
                                {copied ? "Copied!" : "Copy Code"}
                            </Button>

                            {coupon.description && (
                                <p className="mt-5 px-2 text-center text-sm leading-relaxed text-ink/60">
                                    {coupon.description}
                                </p>
                            )}

                        </>
                    ) : (
                        <p className="mt-4 text-center text-sm text-ink/55">
                            {coupon.usedCount} {coupon.usedCount === 1 ? "person has" : "people have"} used this deal
                        </p>
                    )}

                    {affiliateLink && (
                        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-grape/15 bg-paper/70 p-3.5">
                            <div className="min-w-0">
                                {/* <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-grape">
                                    Affiliate link
                                </p> */}
                                <p className="mt-0.5 truncate text-sm text-ink/65">
                                    Visit {coupon.store?.name || "the store"}
                                </p>
                            </div>
                            <Button
                                asChild
                                className="h-10 shrink-0 cursor-pointer rounded-full bg-grape px-4 text-sm font-semibold text-white hover:bg-grape-deep"
                            >
                                <a
                                    href={affiliateLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={onClose}
                                >
                                    Visit store
                                    <ExternalLink className="size-4" />
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}