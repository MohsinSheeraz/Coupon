"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { updateCoupon } from "@/lib/action"
import type { Store, Deal } from "@/lib/models"
import { LinkIcon, Upload, ImageIcon, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EditDeal({ id }: { id: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [stores, setStores] = useState<Store[]>([])
    const [formData, setFormData] = useState<Partial<Deal & { logo?: string }>>({
        title: "",
        storeId: "",
        affiliateLink: "",
        expiryDate: "",
        logo: "",
    })
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string>("")
    const [logoTab, setLogoTab] = useState<string>("upload")

    useEffect(() => {
        // Fetch deal data and stores
        const fetchData = async () => {
            try {
                setLoadingData(true)

                // Fetch stores for the dropdown
                const storesResponse = await fetch("/api/stores")
                if (!storesResponse.ok) throw new Error("Failed to fetch stores")
                const storesData = await storesResponse.json()
                setStores(storesData)

                // Fetch the specific deal
                const dealResponse = await fetch(`/api/deals/${id}`)
                if (!dealResponse.ok) throw new Error("Failed to fetch deal")
                const dealData = await dealResponse.json()

                // Format the date to YYYY-MM-DD for the input
                const expiryDate = dealData.expiryDate ? new Date(dealData.expiryDate).toISOString().split("T")[0] : ""

                setFormData({
                    ...dealData,
                    expiryDate,
                    storeId: dealData.storeId?.toString() || dealData.store?.id,
                    logo: dealData.logo || dealData.store?.logo,
                })

                if (dealData.logo) {
                    setLogoPreview(dealData.logo)
                }
            } catch (error) {
                console.error("Error fetching data:", error)
                toast.error("Failed to load deal data. Please try again.")
            } finally {
                setLoadingData(false)
            }
        }

        fetchData()
    }, [id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setLogoFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setLogoPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Validate form
            if (!formData.title || !formData.storeId || !formData.expiryDate || !formData.affiliateLink) {
                throw new Error("Please fill in all required fields")
            }

            // For a real implementation, you would upload the logo file to a storage service
            // and get back a URL. For this example, we'll use the preview URL if available
            const logoUrl =
                logoTab === "upload" && logoPreview ? logoPreview : formData.logo || "/placeholder.svg?height=80&width=80"

            // Prepare the data for update
            const updateData = {
                title: formData.title,
                storeId: formData.storeId,
                affiliateLink: formData.affiliateLink,
                expiryDate: formData.expiryDate,
                logo: logoUrl,
                type: "deal" as const, // Ensure type is set
                code: null, // Ensure code is null for deals
            }

            // Update the deal (deals are stored as coupons with type="deal")
            const result = await updateCoupon(id, updateData)

            if (result.success) {
                toast.success("Deal updated successfully")
                router.push("/admin/deals")
                router.refresh()
            } else {
                throw new Error(result.error || "Failed to update deal")
            }
        } catch (error) {
            console.error("Error updating deal:", error)
            toast.error(error instanceof Error ? error.message : "Failed to update deal")
        } finally {
            setLoading(false)
        }
    }

    if (loadingData) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading deal data...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Edit Deal</h1>

            <Card className="max-w-3xl mx-auto">
                <CardHeader className="border-b">
                    <CardTitle className="text-teal-800 dark:text-white">Deal Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="title" className="text-base font-medium">
                                        Deal Title
                                    </Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g. 20% Off Your First Order"
                                        className="mt-1.5"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="store" className="text-base font-medium">
                                        Store
                                    </Label>
                                    <Select
                                        name="storeId"
                                        value={formData.storeId?.toString()}
                                        onValueChange={(value) => handleSelectChange("storeId", value)}
                                        required
                                    >
                                        <SelectTrigger className="mt-1.5">
                                            <SelectValue placeholder="Select a store" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {stores
                                                .filter((s) => s.id) // skip any malformed docs
                                                .map((store) => (
                                                    <SelectItem key={store.id!} value={store.id as string}>
                                                        {store.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="affiliateLink" className="text-base font-medium">
                                        Affiliate Link
                                    </Label>
                                    <div className="relative mt-1.5">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <LinkIcon className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <Input
                                            id="affiliateLink"
                                            name="affiliateLink"
                                            value={formData.affiliateLink}
                                            onChange={handleChange}
                                            placeholder="https://example.com/deal?ref=affiliate"
                                            className="pl-10"
                                            type="url"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="expiryDate" className="text-base font-medium">
                                        Expiry Date
                                    </Label>
                                    <Input
                                        id="expiryDate"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleChange}
                                        type="date"
                                        className="mt-1.5"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label className="text-base font-medium">Deal Logo</Label>
                                    <Tabs value={logoTab} onValueChange={setLogoTab} className="mt-1.5">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="upload">
                                                <Upload className="h-4 w-4 mr-2" />
                                                Upload
                                            </TabsTrigger>
                                            <TabsTrigger value="url">
                                                <LinkIcon className="h-4 w-4 mr-2" />
                                                URL
                                            </TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="upload" className="pt-4">
                                            <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                                {logoPreview ? (
                                                    <div className="flex flex-col items-center">
                                                        <img
                                                            src={logoPreview || "/placeholder.svg"}
                                                            alt="Logo preview"
                                                            className="max-w-[120px] max-h-[120px] object-contain mb-4"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setLogoFile(null)
                                                                setLogoPreview("")
                                                            }}
                                                        >
                                                            <X className="h-4 w-4 mr-2" />
                                                            Remove
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                                        <p className="text-sm text-gray-500 mb-2">Drag and drop or click to upload</p>
                                                        <Button type="button" variant="outline" size="sm" asChild>
                                                            <label>
                                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                                                Select File
                                                            </label>
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="url" className="pt-4">
                                            <div className="space-y-4">
                                                <Input
                                                    id="logo"
                                                    name="logo"
                                                    value={formData.logo || ""}
                                                    onChange={handleChange}
                                                    placeholder="e.g. https://example.com/logo.png"
                                                    type="url"
                                                />
                                                {formData.logo && (
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 border rounded-lg flex items-center justify-center overflow-hidden">
                                                            <img
                                                                src={formData.logo || "/placeholder.svg"}
                                                                alt="Logo preview"
                                                                className="max-w-full max-h-full object-contain"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm">Logo Preview</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={loading}>
                                {loading ? "Saving..." : "Update Deal"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
