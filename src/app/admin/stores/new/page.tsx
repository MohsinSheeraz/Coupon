"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { X } from "lucide-react"
import { createStore } from "@/lib/action"

export default function NewStorePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [categoryInput, setCategoryInput] = useState("")
    const [categories, setCategories] = useState<string[]>([])
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        website: "",
        logo: "",
        description: "",
    })

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Validate form
            if (!formData.name || !formData.website || !formData.description) {
                throw new Error("Please fill in all required fields")
            }

            if (categories.length === 0) {
                throw new Error("Please add at least one category")
            }

            // Create the store
            await createStore({
                name: formData.name,
                slug: formData.slug,
                website: formData.website,
                logo: formData.logo || "/placeholder.svg?height=80&width=80", // Default logo if not provided
                description: formData.description,
                categories,
                id: undefined
            })

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

            <Card>
                <CardHeader>
                    <CardTitle>Store Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Store Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Amazon"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="slug">URL Slug</Label>
                                    <Input
                                        id="slug"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        placeholder="e.g. amazon"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        This will be used in the URL: /stores/{formData.slug || "store-name"}
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="website">Website URL</Label>
                                    <Input
                                        id="website"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="e.g. https://amazon.com"
                                        type="url"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="logo">Logo URL</Label>
                                    <Input
                                        id="logo"
                                        name="logo"
                                        value={formData.logo}
                                        onChange={handleChange}
                                        placeholder="e.g. https://example.com/logo.png"
                                        type="url"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Leave empty to use a placeholder</p>
                                </div>

                                <div>
                                    <Label htmlFor="categories">Categories</Label>
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
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Press Enter to add multiple categories</p>
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
                                        placeholder="Describe the store..."
                                        className="h-32"
                                        required
                                    />
                                </div>

                                {formData.logo && (
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-24 border rounded-lg flex items-center justify-center overflow-hidden">
                                            <img
                                                src={formData.logo || "/placeholder.svg"}
                                                alt="Logo preview"
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm">Logo Preview</p>
                                            <p className="text-xs text-gray-500">Recommended size: 200x200px</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
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
