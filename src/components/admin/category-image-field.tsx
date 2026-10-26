"use client"

import { useState } from "react"
import { ImagePlus, LoaderCircle } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CategoryImageField({
    image,
    onChange,
    id = "category-image",
}: {
    image: string
    onChange: (image: string) => void
    id?: string
}) {
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ""
        if (!file) return
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be smaller than 5 MB")
            return
        }

        setUploading(true)
        try {
            const body = new FormData()
            body.set("file", file)
            const response = await fetch("/api/admin/categories/images", { method: "POST", body })
            const result = await response.json()
            if (!response.ok) throw new Error(result.error || "Failed to upload image")
            onChange(result.url)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to upload image")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-2">
            <Label htmlFor={`${id}-url`}>Image URL or device upload</Label>
            <Input
                id={`${id}-url`}
                value={image}
                onChange={(event) => onChange(event.target.value)}
                placeholder="https://example.com/category.jpg"
                inputMode="url"
            />
            <label className="flex w-fit cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                {uploading ? "Uploading image..." : "Choose image"}
                <input
                    id={id}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={uploading}
                    onChange={handleUpload}
                />
            </label>
            <p className="text-xs font-medium text-amber-800">
                Homepage preview: portrait 3:4, ideally 900 x 1200 px. The slider crops with cover, so keep the subject centered.
            </p>
            {image ? (
                <div className="w-32 overflow-hidden rounded-md border bg-muted aspect-3/4">
                    <img src={image} alt="Category image preview" className="h-full w-full object-cover" />
                </div>
            ) : (
                <div className="flex aspect-3/4 w-32 items-center justify-center rounded-md border bg-linear-to-br from-amber-100 to-emerald-100 text-center text-xs text-muted-foreground">
                    Image preview
                </div>
            )}
        </div>
    )
}