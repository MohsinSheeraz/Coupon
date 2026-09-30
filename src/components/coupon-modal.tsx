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

interface CouponModalProps {
    isOpen: boolean
    onClose: () => void
    coupon: any
}

const RING = 100.53 // circumference of the countdown ring (r = 16)

export function CouponModal({ isOpen, onClose, coupon }: CouponModalProps) {
    const [copied, setCopied] = useState(false)
    const [countdown, setCountdown] = useState(5)

    useEffect(() => {
        let timer: NodeJS.Timeout

        if (isOpen && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000)
        } else if (isOpen && countdown === 0) {
            timer = setTimeout(onClose, 1000)
        }

        return () => clearTimeout(timer)
    }, [isOpen, countdown, onClose])

    useEffect(() => {
        if (isOpen) {
            setCountdown(5)
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

    const copyToClipboard = () => {
        if (coupon?.code) {
            navigator.clipboard.writeText(coupon.code)
            setCopied(true)
            toast.success("Coupon code copied to clipboard!")
            setTimeout(() => setCopied(false), 3000)
        }
    }


    const handleContinue = () => {
        window.open(coupon.affiliateLink || coupon.store?.website, "_blank")
        onClose()
    }

    if (!coupon) return null

    const countdownNote = (
        <div className="mt-5 flex items-center justify-center gap-3 text-sm text-ink/55">
            <svg className="size-9 -rotate-90" viewBox="0 0 36 36" aria-hidden>
                <circle cx="18" cy="18" r="16" fill="none" strokeWidth="3" className="stroke-ink/10" />
                <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="stroke-grape"
                    style={{
                        strokeDasharray: RING,
                        strokeDashoffset: RING * (1 - countdown / 5),
                        transition: "stroke-dashoffset 1s linear",
                    }}
                />
            </svg>
            <p>
                This window will close in{" "}
                <span className="font-semibold text-ink">{countdown}</span>{" "}
                seconds.
            </p>
        </div>
    )

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="gap-0 overflow-hidden rounded-3xl border-0 bg-white p-0 text-ink shadow-2xl data-[state=open]:duration-300 sm:max-w-md">
                <DialogClose asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-3 top-3 z-10 cursor-pointer rounded-full text-white/80 hover:bg-white/15 hover:text-white"
                    >
                        <X />
                    </Button>
                </DialogClose>

                {/* Header band — the store's own logo colours tint the backdrop */}
                <div className="relative overflow-hidden bg-ink px-6 pb-7 pt-6 text-white">
                    <div
                        aria-hidden
                        className="absolute inset-0 scale-150 bg-cover bg-center opacity-40 blur-3xl"
                        style={{ backgroundImage: `url("${coupon.store?.logo || "/placeholder.svg"}")` }}
                    />
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <div className="grid size-14 place-items-center rounded-2xl bg-white shadow-lg">
                                <img
                                    src={coupon.store?.logo || "/placeholder.svg"}
                                    alt={coupon.store?.name}
                                    className="size-9 object-contain"
                                />
                            </div>
                            <span className="font-display text-lg font-medium">{coupon.store?.name}</span>
                        </div>

                        <DialogHeader className="mt-5 text-left">
                            {/* Always show the deal title here */}
                            <DialogTitle className="font-display text-2xl font-semibold leading-tight text-white">
                                {coupon.title}
                            </DialogTitle>
                            {/* Only show the "copy" description for code coupons */}
                            {coupon.type === "code" && (
                                <DialogDescription className="text-white/70">
                                    Copy this code and use it at checkout
                                </DialogDescription>
                            )}
                        </DialogHeader>
                    </div>
                </div>

                {/* Tear line */}
                <div aria-hidden className="border-t-2 border-dashed border-ink/15" />

                <div className="flex flex-col px-6 pb-6 pt-6">
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

                            <p className="mt-5 px-2 text-center text-sm leading-relaxed text-ink/60">
                                {coupon.description}
                            </p>

                            {countdownNote}
                        </>
                    ) : (
                        <>
                            {/* Continue button */}
                            <Button
                                className="h-12 w-full cursor-pointer rounded-full bg-citrus text-base font-semibold text-ink shadow-[0_10px_24px_-10px_rgb(255_210_63/0.9)] hover:bg-citrus/80"
                                onClick={handleContinue}
                            >
                                Continue to {coupon.store?.name}
                                <ExternalLink className="ml-1 h-5 w-5" />
                            </Button>

                            {countdownNote}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
