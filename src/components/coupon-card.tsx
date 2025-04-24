"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tag, Percent } from "lucide-react"
import { CouponModal } from "./coupon-modal"

export function CouponCard({ coupon }: { coupon: any }) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <>
            <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                            <img
                                src={coupon.store?.logo || "/placeholder.svg"}
                                alt={coupon.store?.name}
                                className="h-8 w-8 object-contain"
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold">{coupon.store?.name}</h3>
                            <p className="text-sm text-gray-500">Verified {coupon.verifiedTime}</p>
                        </div>
                    </div>

                    <div className="flex items-start mb-3">
                        {coupon.type === "code" ? (
                            <Tag className="h-5 w-5 text-teal-600 mr-2 flex-shrink-0 mt-0.5" />
                        ) : (
                            <Percent className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        <p className="font-medium">{coupon.title}</p>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 flex-grow">{coupon.description}</p>

                    <div className="flex justify-between items-center mt-auto">
                        <span className="text-sm text-gray-500">Used {coupon.usedCount} times</span>
                        <Button
                            className={coupon.type === "code" ? "bg-teal-600 hover:bg-teal-700" : "bg-purple-600 hover:bg-purple-700"}
                            onClick={() => setIsModalOpen(true)}
                        >
                            {coupon.type === "code" ? "Get Code" : "Get Deal"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <CouponModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} coupon={coupon} />
        </>
    )
}
