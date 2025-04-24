"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { createCoupon } from "@/lib/action"
import type { Store } from "@/lib/models"

export default function NewCouponPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [couponType, setCouponType] = useState("code")
    const [stores, setStores] = useState<Store[]>([])
    const [formData, setFormData] = useState({
        title: "",
        storeId: "",
        code: "",
        description: "",
        expiryDate: "",
        type: "code",
    })

    useEffect(() => {
        // Fetch stores for the dropdown
        const fetchStores = async () => {
            try {
                const response = await fetch("/api/stores")
                if (!response.ok) throw new Error("Failed to fetch stores")
                const data = await response.json()
                setStores(data)
            } catch (error) {
                console.error("Error fetching stores:", error)
                toast.error("Failed to load stores. Please try again.")
            }
        }

        fetchStores()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Validate form
            if (!formData.title || !formData.storeId || !formData.description || !formData.expiryDate) {
                throw new Error("Please fill in all required fields")
            }

            if (formData.type === "code" && !formData.code) {
                throw new Error("Please enter a coupon code")
            }

            // Create the coupon
            await createCoupon({
                title: formData.title,
                storeId: formData.storeId,
                code: formData.type === "code" ? formData.code : null,
                description: formData.description,
                expiryDate: formData.expiryDate,
                type: formData.type as "code" | "deal",
            })

            toast.success("Coupon created successfully")
            router.push("/admin/coupons")
        } catch (error) {
            console.error("Error creating coupon:", error)
            toast.error(error instanceof Error ? error.message : "Failed to create coupon")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Add New Coupon</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Coupon Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g. 20% Off Your First Order"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="store">Store</Label>
                                    <Select
                                        name="storeId"
                                        value={formData.storeId}
                                        onValueChange={(value) => handleSelectChange("storeId", value)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a store" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {stores.map((store) => (
                                                <SelectItem key={store._id?.toString()} value={store._id?.toString() || ""}>
                                                    {store.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Coupon Type</Label>
                                    <RadioGroup
                                        defaultValue="code"
                                        className="flex gap-4 mt-2"
                                        value={formData.type}
                                        onValueChange={(value) => {
                                            setCouponType(value)
                                            handleSelectChange("type", value)
                                        }}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="code" id="type-code" />
                                            <Label htmlFor="type-code">Code</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="deal" id="type-deal" />
                                            <Label htmlFor="type-deal">Deal</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {couponType === "code" && (
                                    <div>
                                        <Label htmlFor="code">Coupon Code</Label>
                                        <Input
                                            id="code"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleChange}
                                            placeholder="e.g. WELCOME20"
                                            required={couponType === "code"}
                                        />
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="expiryDate">Expiry Date</Label>
                                    <Input
                                        id="expiryDate"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleChange}
                                        type="date"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Describe the coupon details and any terms..."
                                        className="h-32"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={loading}>
                                {loading ? "Saving..." : "Save Coupon"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
