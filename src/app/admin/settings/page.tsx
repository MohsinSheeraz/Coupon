"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { updateSettings } from "@/lib/action"
import type { SiteSettings } from "@/lib/models"

export default function SettingsPage() {
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState<SiteSettings>({
        siteName: "",
        siteDescription: "",
        contactEmail: "",
        socialLinks: {
            facebook: "",
            twitter: "",
            instagram: "",
            pinterest: "",
        },
        metaTags: {
            title: "",
            description: "",
            keywords: "",
        },
    })

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch("/api/admin/settings")
                if (!response.ok) throw new Error("Failed to fetch settings")
                const data = await response.json()
                setSettings(data)
            } catch (error) {
                console.error("Error fetching settings:", error)
                toast.error("Failed to load settings. Please try again.")
            }
        }

        fetchSettings()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target

        // Handle nested properties
        if (name.includes(".")) {
            const [parent, child] = name.split(".")
            setSettings((prev) => ({
                ...prev,
                [parent]: {
                    ...(prev[parent as keyof SiteSettings] as Record<string, unknown>),
                    [child]: value,
                },
            }))
        } else {
            setSettings((prev) => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await updateSettings(settings)
            toast.success("Settings updated successfully")
        } catch (error) {
            console.error("Error updating settings:", error)
            toast.error("Failed to update settings")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            <form onSubmit={handleSubmit}>
                <Tabs defaultValue="general" className="mb-8">
                    <TabsList className="grid w-full grid-cols-3 max-w-md">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="social">Social Media</TabsTrigger>
                        <TabsTrigger value="seo">SEO</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="siteName">Site Name</Label>
                                    <Input
                                        id="siteName"
                                        name="siteName"
                                        value={settings.siteName}
                                        onChange={handleChange}
                                        placeholder="e.g. DealzyCoup"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="siteDescription">Site Description</Label>
                                    <Textarea
                                        id="siteDescription"
                                        name="siteDescription"
                                        value={settings.siteDescription}
                                        onChange={handleChange}
                                        placeholder="Brief description of your site"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="contactEmail">Contact Email</Label>
                                    <Input
                                        id="contactEmail"
                                        name="contactEmail"
                                        value={settings.contactEmail}
                                        onChange={handleChange}
                                        type="email"
                                        placeholder="e.g. contact@DealzyCoup.com"
                                        required
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="social">
                        <Card>
                            <CardHeader>
                                <CardTitle>Social Media Links</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="facebook">Facebook</Label>
                                    <Input
                                        id="facebook"
                                        name="socialLinks.facebook"
                                        value={settings.socialLinks.facebook || ""}
                                        onChange={handleChange}
                                        placeholder="e.g. https://facebook.com/DealzyCoup"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="twitter">Twitter</Label>
                                    <Input
                                        id="twitter"
                                        name="socialLinks.twitter"
                                        value={settings.socialLinks.twitter || ""}
                                        onChange={handleChange}
                                        placeholder="e.g. https://twitter.com/DealzyCoup"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="instagram">Instagram</Label>
                                    <Input
                                        id="instagram"
                                        name="socialLinks.instagram"
                                        value={settings.socialLinks.instagram || ""}
                                        onChange={handleChange}
                                        placeholder="e.g. https://instagram.com/DealzyCoup"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="pinterest">Pinterest</Label>
                                    <Input
                                        id="pinterest"
                                        name="socialLinks.pinterest"
                                        value={settings.socialLinks.pinterest || ""}
                                        onChange={handleChange}
                                        placeholder="e.g. https://pinterest.com/DealzyCoup"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="seo">
                        <Card>
                            <CardHeader>
                                <CardTitle>SEO Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="metaTitle">Meta Title</Label>
                                    <Input
                                        id="metaTitle"
                                        name="metaTags.title"
                                        value={settings.metaTags.title}
                                        onChange={handleChange}
                                        placeholder="e.g. DealzyCoup - Find the Best Deals"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="metaDescription">Meta Description</Label>
                                    <Textarea
                                        id="metaDescription"
                                        name="metaTags.description"
                                        value={settings.metaTags.description}
                                        onChange={handleChange}
                                        placeholder="Brief description for search engines"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="metaKeywords">Meta Keywords</Label>
                                    <Input
                                        id="metaKeywords"
                                        name="metaTags.keywords"
                                        value={settings.metaTags.keywords}
                                        onChange={handleChange}
                                        placeholder="e.g. coupons, deals, promo codes, discounts"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end">
                    <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={loading}>
                        {loading ? "Saving..." : "Save Settings"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
