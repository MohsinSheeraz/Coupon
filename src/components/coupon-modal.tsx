"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Copy, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface CouponModalProps {
    isOpen: boolean
    onClose: () => void
    coupon: any
}

export function CouponModal({ isOpen, onClose, coupon }: CouponModalProps) {
    const [copied, setCopied] = useState(false)
    const [countdown, setCountdown] = useState(5)

    useEffect(() => {
        let timer: NodeJS.Timeout

        if (isOpen && countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000)
        }

        return () => {
            clearTimeout(timer)
        }
    }, [isOpen, countdown])

    useEffect(() => {
        if (isOpen) {
            setCountdown(5)
            setCopied(false)

            // Increment usage count when modal is opened
            if (coupon?._id) {
                fetch("/api/coupons/increment", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id: coupon._id }),
                }).catch((error) => {
                    console.error("Error incrementing coupon usage:", error)
                    toast.error("Failed to record coupon usage")
                })
            }
        }
    }, [isOpen, coupon])

    const copyToClipboard = () => {
        if (coupon?.code) {
            navigator.clipboard.writeText(coupon.code)
            setCopied(true)
            toast.success("Coupon code copied to clipboard!")

            // Reset copied state after 3 seconds
            setTimeout(() => {
                setCopied(false)
            }, 3000)
        }
    }

    if (!coupon) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center">{coupon.title}</DialogTitle>
                    <DialogDescription className="text-center">
                        {coupon.type === "code" ? "Copy this code and use it at checkout" : "Click to activate this deal"}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center py-6">
                    {coupon.store && (
                        <div className="flex items-center mb-4">
                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                <img
                                    src={coupon.store.logo || "/placeholder.svg"}
                                    alt={coupon.store.name}
                                    className="h-8 w-8 object-contain"
                                />
                            </div>
                            <span className="font-medium">{coupon.store.name}</span>
                        </div>
                    )}

                    {coupon.type === "code" ? (
                        <div className="w-full">
                            <div className="bg-gray-100 border border-dashed border-gray-300 rounded-md p-3 flex justify-between items-center mb-4">
                                <span className="font-mono font-bold text-lg">{coupon.code}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={copyToClipboard}
                                    className="text-teal-600 hover:text-teal-700"
                                >
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>

                            <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={copyToClipboard}>
                                {copied ? "Copied!" : "Copy Code"}
                            </Button>
                        </div>
                    ) : (
                        <Button
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            onClick={() => window.open(coupon.store?.website, "_blank")}
                        >
                            Activate Deal <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                    )}

                    <p className="mt-4 text-sm text-gray-500">{coupon.description}</p>

                    {coupon.type === "code" && (
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500 mb-2">This window will close in {countdown} seconds</p>
                            <a
                                href={coupon.store?.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-teal-600 hover:text-teal-700 flex items-center justify-center"
                            >
                                Continue to {coupon.store?.name} <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
