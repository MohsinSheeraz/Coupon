"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"
import type { Category } from "@/lib/models"
import { categoriesMatch } from "@/lib/categories"
import { createManagedCategory } from "@/lib/action"
import { CategoryImageField } from "@/components/admin/category-image-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CategoryPicker({
    selected,
    onChange,
    variant = "default",
}: {
    selected: string[]
    onChange: (categories: string[]) => void
    variant?: "default" | "new-store"
}) {
    const [available, setAvailable] = useState<Category[]>([])
    const [name, setName] = useState("")
    const [image, setImage] = useState("")
    const [creating, setCreating] = useState(false)
    const existingMatch = name.trim()
        ? available.find((category) => categoriesMatch(category.name, name.trim()))
        : undefined
    const existingAlreadySelected = existingMatch
        ? selected.some((category) => categoriesMatch(category, existingMatch.name))
        : false

    useEffect(() => {
        fetch("/api/admin/categories", { cache: "no-store" })
            .then((response) => response.ok ? response.json() : [])
            .then((categories: Category[]) => setAvailable(Array.isArray(categories) ? categories : []))
            .catch(() => toast.error("Could not load categories"))
    }, [])

    const toggleCategory = (category: Category, checked: boolean) => {
        if (checked) {
            if (!selected.some((value) => categoriesMatch(value, category.name))) onChange([...selected, category.name])
        } else {
            onChange(selected.filter((value) => !categoriesMatch(value, category.name)))
        }
    }

    const addCategory = async () => {
        if (!name.trim()) return toast.error("Enter a category name")
        if (existingMatch) {
            if (!existingAlreadySelected) onChange([...selected, existingMatch.name])
            setName("")
            setImage("")
            toast.success(existingAlreadySelected
                ? "Category is already added to this store"
                : "Existing category added to this store")
            return
        }
        if (!image.trim()) return toast.error("Add an image URL or upload an image")
        setCreating(true)
        try {
            const result = await createManagedCategory(name, image)
            if (!result.success || !result.category) throw new Error(result.error || "Could not create category")
            const createdCategory = result.category
            setAvailable((current) => [...current, createdCategory].sort((a, b) => a.name.localeCompare(b.name)))
            onChange([...selected, createdCategory.name])
            setName("")
            setImage("")
            toast.success("Category created and added to this store")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create category")
        } finally {
            setCreating(false)
        }
    }

    return (
        <section className="space-y-3" aria-labelledby="store-categories-title">
            <div className="flex items-center justify-between gap-3">
                <h2 id="store-categories-title" className="text-base font-medium">Categories</h2>
                {variant !== "new-store" && (
                    <Link href="/admin/categories" className="text-sm text-teal-700 underline underline-offset-4">
                        Manage categories
                    </Link>
                )}
            </div>
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selected.map((category) => (
                        <span key={category} className="inline-flex items-center gap-1 rounded-md border bg-secondary px-2 py-1 text-sm">
                            {category}
                            <button
                                type="button"
                                aria-label={`Remove ${category}`}
                                onClick={() => onChange(selected.filter((value) => value !== category))}
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
            {variant !== "new-store" && (
                <div className="grid gap-2 sm:grid-cols-2">
                    {available.map((category) => (
                        <label key={category.id} className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm">
                            <input
                                type="checkbox"
                                checked={selected.some((value) => categoriesMatch(value, category.name))}
                                onChange={(event) => toggleCategory(category, event.target.checked)}
                            />
                            <span className="truncate">{category.name}</span>
                        </label>
                    ))}
                    {available.length === 0 && <p className="text-sm text-muted-foreground">No active categories yet.</p>}
                </div>
            )}
            <details className="rounded-md border p-3">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium">
                    <Plus className="h-4 w-4" />
                    {variant === "new-store" ? "Category Text" : "Create a category with its image"}
                </summary>
                <div className={variant === "new-store" ? "mt-4 max-w-md space-y-4" : "mt-4 grid gap-4 sm:grid-cols-2"}>
                    <div className="space-y-2">
                        <label htmlFor="new-store-category" className="text-sm font-medium">Category name</label>
                        <Input
                            id="new-store-category"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            maxLength={60}
                            placeholder="e.g. Footwear"
                        />
                        {existingMatch ? (
                            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900" role="status">
                                <p>
                                    <span className="font-semibold">{existingMatch.name}</span> already exists.
                                    {" "}Add this store under the existing category{existingAlreadySelected ? " (already selected)." : "."}
                                </p>
                                <Button
                                    type="button"
                                    className="mt-2"
                                    onClick={addCategory}
                                    disabled={creating || existingAlreadySelected}
                                >
                                    {existingAlreadySelected ? "Already added" : "Add existing category"}
                                </Button>
                            </div>
                        ) : (
                            <Button type="button" onClick={addCategory} disabled={creating || !name.trim() || !image.trim()}>
                                {creating ? "Creating..." : "Create and select"}
                            </Button>
                        )}
                    </div>
                    {!existingMatch && (
                        <CategoryImageField image={image} onChange={setImage} id="store-category-image" />
                    )}
                </div>
            </details>
        </section>
    )
}