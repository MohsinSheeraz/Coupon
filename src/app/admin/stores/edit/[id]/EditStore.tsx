"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { X, Upload, LinkIcon, ImageIcon } from "lucide-react"
import { updateStore } from "@/lib/action"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Store } from "@/lib/models"

export default function EditStore({ id }: { id: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [categoryInput, setCategoryInput] = useState("")
    const [categories, setCategories] = useState<string[]>([])
    const [formData, setFormData] = useState<Partial<Store>>({
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

    useEffect(() => {
        // Fetch store data
        const fetchData = async () => {
            try {
                setLoadingData(true)

                // Fetch the specific store
                const storeResponse = await fetch(`/api/stores/${id}`)
                if (!storeResponse.ok) throw new Error("Failed to fetch store")
                const storeData = await storeResponse.json()

                setFormData({
                    name: storeData.name,
                    slug: storeData.slug,
                    website: storeData.website,
                    logo: storeData.logo,
                    affiliateLink: storeData.affiliateLink,
                })

                setCategories(storeData.categories || [])

                if (storeData.logo) {
                    setLogoPreview(storeData.logo)
                }
            } catch (error) {
                console.error("Error fetching data:", error)
                toast.error("Failed to load store data. Please try again.")
            } finally {
                setLoadingData(false)
            }
        }

        fetchData()
    }, [id])

    const handleAddCategory = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && categoryInput.trim()) {
            e.preventDefault()
            if (!categories.includes(categoryInput.trim())) {
                setCategories([...categories, categoryInput.trim()])
            }
            setCategoryInput("")
        }
    }

    const handleRemoveCategory = (category: string) => {
        setCategories(categories.filter((c) => c !== category))
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target

        // Auto-generate slug from name if slug is empty or if name is being changed
        if (
            name === "name" &&
            (!formData.slug ||
                formData.slug ===
                formData.name
                    ?.toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, ""))
        ) {
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
            // Validate form (only name & affiliateLink are required)
            if (!formData.name || !formData.affiliateLink) {
                throw new Error("Please fill in Store Name and Affiliate Link")
            }

            // For a real implementation, you would upload the logo file to a storage service
            // and get back a URL. For this example, we'll use the preview URL if available
            const logoUrl =
                logoTab === "upload" && logoPreview ? logoPreview : formData.logo || "/placeholder.svg?height=80&width=80"

            // Prepare the data for update
            const updateData = {
                name: formData.name,
                slug: formData.slug,
                website: formData.website,
                logo: logoUrl,
                affiliateLink: formData.affiliateLink,
                categories,
            }

            // Update the store
            const result = await updateStore(id, updateData)

            if (result.success) {
                toast.success("Store updated successfully")
                router.push("/admin/stores")
                router.refresh()
            } else {
                throw new Error(result.error || "Failed to update store")
            }
        } catch (error) {
            console.error("Error updating store:", error)
            toast.error(error instanceof Error ? error.message : "Failed to update store")
        } finally {
            setLoading(false)
        }
    }

    if (loadingData) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-white">Loading store data...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Edit Store</h1>

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
                                    <p className="text-xs text-gray-500 dark:text-white mt-1">
                                        This will be used in the URL: /stores/{formData.slug || "store-name"}
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="categories" className="text-base font-medium">
                                        Categories <span className="text-gray-500 text-sm">(optional)</span>
                                    </Label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {categories.map((category) => (
                                            <Badge key={category} variant="secondary" className="flex items-center gap-1">
                                                {category}
                                                <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveCategory(category)} />
                                            </Badge>
                                        ))}
                                    </div>
                                    <Input
                                        id="categories"
                                        placeholder="Type a category and press Enter"
                                        value={categoryInput}
                                        onChange={(e) => setCategoryInput(e.target.value)}
                                        onKeyDown={handleAddCategory}
                                        className="mt-1.5"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-white mt-1">Press Enter to add multiple categories</p>
                                </div>
                                {/* 
                                <div>
                                    <Label htmlFor="website" className="text-base font-medium">
                                        Website URL (optional)
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
                                            <LinkIcon className="h-4 w-4 text-gray-400 dark:text-white" />
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
                                                        <ImageIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-white mb-2" />
                                                        <p className="text-sm text-gray-500 dark:text-white mb-2">Drag and drop or click to upload</p>
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
                            <Button className="cursor-pointer" type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 cursor-pointer" disabled={loading}>
                                {loading ? "Saving..." : "Update Store"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
