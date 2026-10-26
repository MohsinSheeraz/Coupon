"use client"

import { useState } from "react"
import { Archive, Check, ChevronDown, ChevronUp, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import type { Category } from "@/lib/models"
import { createManagedCategory, deleteManagedCategory, updateManagedCategory } from "@/lib/action"
import { CategoryImageField } from "@/components/admin/category-image-field"
import { Button } from "@/components/ui/button"
import { categoriesMatch, categoryKey, cleanCategories } from "@/lib/categories"
import { Input } from "@/components/ui/input"

type StoreOption = { id: string; name: string; categories: string[] }

function StoreDropdown({
    id,
    stores,
    selectedIds,
    onChange,
}: {
    id: string
    stores: StoreOption[]
    selectedIds: string[]
    onChange: (ids: string[]) => void
}) {
    const [query, setQuery] = useState("")
    const visibleStores = stores.filter((store) => store.name.toLowerCase().includes(query.toLowerCase()))

    return (
        <details className="relative">
            <summary className="cursor-pointer rounded-md border px-3 py-2 text-sm">
                Choose stores ({selectedIds.length} selected)
            </summary>
            <div className="absolute z-20 mt-1 max-h-64 w-full min-w-64 space-y-2 overflow-auto rounded-md border bg-white p-3 shadow-lg">
                <Input
                    id={`${id}-search`}
                    aria-label="Search stores"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search stores"
                />
                {visibleStores.length ? visibleStores.map((store) => (
                    <label key={store.id} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
                        <input
                            type="checkbox"
                            checked={selectedIds.includes(store.id)}
                            onChange={(event) => onChange(event.target.checked
                                ? [...selectedIds, store.id]
                                : selectedIds.filter((storeId) => storeId !== store.id))}
                        />
                        <span className="truncate">{store.name}</span>
                    </label>
                )) : <p className="py-2 text-sm text-muted-foreground">No stores found.</p>}
            </div>
        </details>
    )
}

function categoryStoreIds(stores: StoreOption[], name: string) {
    return stores.filter((store) => store.categories.some((category) => categoriesMatch(category, name))).map((store) => store.id)
}

function applyCategoryToStores(stores: StoreOption[], selectedIds: string[], oldName: string, newName: string) {
    const selected = new Set(selectedIds)
    return stores.map((store) => {
        const categories = store.categories.filter((category) => !categoriesMatch(category, oldName))
        if (selected.has(store.id)) categories.push(newName)
        return { ...store, categories: cleanCategories(categories) }
    })
}

export default function CategoryManager({
    initialCategories,
    initialStores,
}: {
    initialCategories: Category[]
    initialStores: StoreOption[]
}) {
    const [categories, setCategories] = useState(initialCategories)
    const [name, setName] = useState("")
    const [stores, setStores] = useState(initialStores)
    const [image, setImage] = useState("")
    const [editingId, setEditingId] = useState<string | null>(null)
    const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([])
    const [editName, setEditName] = useState("")
    const [editImage, setEditImage] = useState("")
    const [busy, setBusy] = useState(false)
    const [editStoreIds, setEditStoreIds] = useState<string[]>([])
    const [showAllCategories, setShowAllCategories] = useState(false)
    const visibleCategories = showAllCategories ? categories : categories.slice(0, 4)

    const create = async () => {
        if (!name.trim() || !image.trim()) return toast.error("Category name and image are required")
        setBusy(true)
        try {
            const result = await createManagedCategory(name, image, selectedStoreIds)
            if (!result.success || !result.category) throw new Error(result.error || "Could not create category")
            const createdCategory = result.category
            setCategories((current) => [...current, createdCategory].sort((a, b) => a.name.localeCompare(b.name)))
            setStores((current) => applyCategoryToStores(current, selectedStoreIds, name, name))
            setName("")
            setImage("")
            setSelectedStoreIds([])
            toast.success("Category created")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not create category")
        } finally {
            setBusy(false)
        }
    }

    const startEditing = (category: Category) => {
        setEditingId(category.id ?? null)
        setEditName(category.name)
        setEditStoreIds(categoryStoreIds(stores, category.name))
        setEditImage(category.image)
    }

    const saveEdit = async (category: Category) => {
        if (!category.id || !editName.trim() || !editImage.trim()) return toast.error("Category name and image are required")
        setBusy(true)
        try {
            const result = await updateManagedCategory(category.id, {
                name: editName,
                image: editImage,
                storeIds: editStoreIds,
            })
            if (!result.success) throw new Error(result.error)
            setStores((current) => applyCategoryToStores(current, editStoreIds, category.name, editName.trim()))
            setCategories((current) => current
                .map((item) => item.id === category.id
                    ? {
                        ...item,
                        name: editName.trim(),
                        key: categoryKey(editName.trim()),
                        image: editImage,
                        storeCount: editStoreIds.length,
                    }
                    : item)
                .sort((a, b) => a.name.localeCompare(b.name)))
            setEditingId(null)
            toast.success("Category updated")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not update category")
        } finally {
            setBusy(false)
        }
    }

    const setStatus = async (category: Category, status: "active" | "archived") => {
        if (!category.id) return
        setBusy(true)
        try {
            const result = await updateManagedCategory(category.id, { status })
            if (!result.success) throw new Error(result.error)
            setCategories((current) => current.map((item) => item.id === category.id ? { ...item, status } : item))
            toast.success(status === "active" ? "Category restored" : "Category archived")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not update category")
        } finally {
            setBusy(false)
        }
    }

    const remove = async (category: Category) => {
        if (!category.id || !window.confirm(`Delete ${category.name}? This cannot be undone.`)) return
        setBusy(true)
        try {
            const result = await deleteManagedCategory(category.id)
            if (!result.success) throw new Error(result.error)
            setCategories((current) => current.filter((item) => item.id !== category.id))
            toast.success("Category deleted")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not delete category")
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="space-y-8">
            <header className="border-b pb-5">
                <p className="text-sm font-semibold uppercase text-teal-700">Catalog</p>
                <h1 className="mt-1 text-3xl font-bold">Categories</h1>
                <p className="mt-2 text-sm text-muted-foreground">Manage names and images used by store search and the homepage slider.</p>
            </header>

            <section className="grid gap-6 border-b pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(250px,0.7fr)]">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold">New category</h2>
                        <p className="text-sm text-muted-foreground">Every category needs an image before it can be used.</p>
                    </div>
                    <label htmlFor="category-name" className="text-sm font-medium">Name</label>
                    <Input id="category-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={60} placeholder="e.g. Footwear" />
                    <Button type="button" disabled={busy || !name.trim() || !image.trim()} onClick={create}>
                        <Plus className="mr-2 h-4 w-4" /> Create category
                    </Button>
                </div>
                <CategoryImageField image={image} onChange={setImage} id="new-category-image" />
                <div className="space-y-2 lg:col-span-2">
                    <p className="text-sm font-medium">Assign stores</p>
                    <StoreDropdown id="new-category-stores" stores={stores} selectedIds={selectedStoreIds} onChange={setSelectedStoreIds} />
                </div>
            </section>

            <section aria-label="Category list">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">All categories</h2>
                    <span className="text-sm text-muted-foreground">{categories.length} total</span>
                </div>
                <div className="divide-y border-y">
                    {visibleCategories.map((category) => {
                        const editing = editingId === category.id
                        return (
                            <article key={category.id} className="grid gap-4 py-5 md:grid-cols-[96px_minmax(0,1fr)_auto] md:items-center">
                                <div className="aspect-3/4 w-24 overflow-hidden rounded-md border bg-linear-to-br from-amber-100 to-emerald-100">
                                    {category.image && <img src={category.image} alt={`${category.name} category`} className="h-full w-full object-cover" />}
                                </div>
                                <div className="min-w-0 space-y-3">
                                    {editing ? (
                                        <>
                                            <Input aria-label="Category name" value={editName} onChange={(event) => setEditName(event.target.value)} maxLength={60} />
                                            <CategoryImageField image={editImage} onChange={setEditImage} id={`edit-category-${category.id}`} />
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium">Assign stores</p>
                                                <StoreDropdown id={`edit-stores-${category.id}`} stores={stores} selectedIds={editStoreIds} onChange={setEditStoreIds} />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold">{category.name}</h3>
                                                <span className={`rounded-full px-2 py-0.5 text-xs ${category.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"}`}>
                                                    {category.status}
                                                </span>
                                                {!category.image && <span className="text-xs font-medium text-amber-800">Image needed</span>}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{category.storeCount ?? 0} stores</p>
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 md:justify-end">
                                    {editing ? (
                                        <>
                                            <Button type="button" size="sm" disabled={busy} onClick={() => saveEdit(category)}>
                                                <Check className="mr-1 h-4 w-4" /> Save
                                            </Button>
                                            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => setEditingId(null)}>
                                                <X className="mr-1 h-4 w-4" /> Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => startEditing(category)}>
                                                <Pencil className="mr-1 h-4 w-4" /> Edit
                                            </Button>
                                            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => setStatus(category, category.status === "active" ? "archived" : "active")}>
                                                {category.status === "active" ? <Archive className="mr-1 h-4 w-4" /> : <RotateCcw className="mr-1 h-4 w-4" />}
                                                {category.status === "active" ? "Archive" : "Restore"}
                                            </Button>
                                            {category.storeCount === 0 && (
                                                <Button type="button" size="icon" variant="ghost" aria-label={`Delete ${category.name}`} disabled={busy} onClick={() => remove(category)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </article>
                        )
                    })}
                    {categories.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No categories yet.</p>}
                </div>
                {categories.length > 4 && (
                    <button
                        type="button"
                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-900"
                        onClick={() => setShowAllCategories((current) => !current)}
                    >
                        {showAllCategories ? "Show less" : `Show more (${categories.length - 4})`}
                        {showAllCategories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                )}
            </section>
        </div>
    )
}