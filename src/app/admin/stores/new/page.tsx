"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { X, Upload, LinkIcon, ImageIcon } from "lucide-react"
import { createStore } from "@/lib/action"
import { CategoryPicker } from "@/components/admin/category-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NewStorePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<string[]>([])
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        website: "",
        logo: "",
        affiliateLink: "",
    })
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string>("")
    const [logoTab, setLogoTab] = useState<string>("upload")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target

        // Auto-generate slug from name
        if (name === "name") {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "")
            setFormData((prev) => ({ ...prev, name: value, slug }))
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }))
        }
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
            // Validate form: only the store name is required
            if (!formData.name.trim()) {
                throw new Error("Please enter a Store Name")
            }

            // For a real implementation, you would upload the logo file to a storage service
            // and get back a URL. For this example, we'll use the preview URL if available
            const logoUrl =
                logoTab === "upload" && logoPreview ? logoPreview : formData.logo || "/placeholder.svg?height=80&width=80"
            // Create the store
            const result = await createStore({
    name: formData.name,
    slug: formData.slug,
    website: formData.website,
    logo: logoUrl,
    affiliateLink: formData.affiliateLink,
    categories,
    dealCount: 0,
})
if (!result.success) throw new Error(result.error || "Failed to create store")

            toast.success("Store created successfully")
            router.push("/admin/stores")
        } catch (error) {
            console.error("Error creating store:", error)
            toast.error(error instanceof Error ? error.message : "Failed to create store")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Add New Store</h1>

            <Card className="max-w-3xl mx-auto">
                <CardHeader className="border-b">
                    <CardTitle className="text-teal-800">Store Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name" className="text-base font-medium">
                                        Store Name
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Amazon"
                                        className="mt-1.5"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="slug" className="text-base font-medium">
                                        URL Slug
                                    </Label>
                                    <Input
                                        id="slug"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        placeholder="e.g. amazon"
                                        className="mt-1.5"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        This will be used in the URL: /stores/{formData.slug || "store-name"}
                                    </p>
                                </div>
                                <CategoryPicker selected={categories} onChange={setCategories} />

                                {/* <div>
                                    <Label htmlFor="website" className="text-base font-medium">
                                        Website URL <span className="text-sm text-gray-400">(optional)</span>
                                    </Label>
                                    <Input
                                        id="website"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="e.g. https://amazon.com"
                                        type="url"
                                        className="mt-1.5"
                                    />
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
                                            placeholder="https://example.com/store?ref=affiliate"
                                            className="pl-10"
                                            type="url"
                                            required
                                        />
                                    </div>
                                </div> */}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label className="text-base font-medium">Store Logo</Label>
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
                                                    value={formData.logo}
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
                                {loading ? "Saving..." : "Save Store"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
