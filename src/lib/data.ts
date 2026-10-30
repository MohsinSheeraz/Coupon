"use server"
import clientPromise from "./mongodb"
import { isToday, isYesterday, format } from 'date-fns'
import { ObjectId } from "mongodb"
import { GridFSBucket } from "mongodb"
import type { Store, Coupon, SiteSettings, Deal, Category } from "@/lib/models"
import { debugLog } from "./debug"
import { categoryKey, cleanCategories } from "./categories"
import { CATEGORY_TILES } from "./images"

// ─┐ helpers
const toStr = (v: any) => (typeof v === "string" ? v : (v?.toString?.() ?? ""))

function serialiseDates<T extends Record<string, any>>(doc: T) {
    return Object.fromEntries(
        Object.entries({ ...doc }).map(([k, v]) => (v instanceof Date ? [k, v.toISOString()] : [k, v])),
    ) as T
}

function transformCoupon(c: any) {
    // compute “verifiedTime” from createdAt
    const createdAtDate = new Date(c.createdAt)
    let verifiedTime: string
    if (isToday(createdAtDate)) {
        verifiedTime = 'Today'
    } else if (isYesterday(createdAtDate)) {
        verifiedTime = 'Yesterday'
    } else {
        verifiedTime = format(createdAtDate, 'MMM d, yyyy')
    }
    return serialiseDates({
        ...c,
        verifiedTime,
        id: toStr(c._id),
        _id: undefined,
        storeId: toStr(c.storeId),
    })
}

function transformStore(s: any) {
    return serialiseDates({
        ...s,
        id: toStr(s._id),
        _id: undefined,
    })
}

async function getOfferCountsByStore() {
    const { coupons } = await getCollections()
    const countsByStore = new Map<string, { couponCount: number; dealCount: number }>()
    const offerCounts = await coupons.aggregate<{
        _id: ObjectId | string
        couponCount: number
        dealCount: number
    }>([
        {
            $group: {
                _id: "$storeId",
                couponCount: { $sum: { $cond: [{ $eq: ["$type", "deal"] }, 0, 1] } },
                dealCount: { $sum: { $cond: [{ $eq: ["$type", "deal"] }, 1, 0] } },
            },
        },
    ]).toArray()

    for (const counts of offerCounts) {
        const storeId = toStr(counts._id)
        const existing = countsByStore.get(storeId) ?? { couponCount: 0, dealCount: 0 }
        countsByStore.set(storeId, {
            couponCount: existing.couponCount + counts.couponCount,
            dealCount: existing.dealCount + counts.dealCount,
        })
    }

    return countsByStore
}

function transformStoresWithOfferCounts(
    storeDocs: Store[],
    countsByStore: Map<string, { couponCount: number; dealCount: number }>,
): Store[] {
    return storeDocs.map((store) => {
        const counts = countsByStore.get(toStr(store._id)) ?? { couponCount: 0, dealCount: 0 }
        return {
            ...transformStore(store),
            ...counts,
        }
    })
}
// ─┘

async function populateOffersWithStores<T extends Coupon>(offers: T[]) {
    const { stores } = await getCollections()
    const storeIds = Array.from(new Set(
        offers
            .map((offer) => toStr(offer.storeId))
            .filter((id) => ObjectId.isValid(id)),
    )).map((id) => new ObjectId(id))
    const storeDocs = storeIds.length
        ? await stores.find(
            { _id: { $in: storeIds } },
            { projection: { name: 1, slug: 1, logo: 1 } },
        ).toArray()
        : []
    const storesById = new Map(storeDocs.map((store) => [
        toStr(store._id),
        {
            id: toStr(store._id),
            name: store.name,
            slug: store.slug,
            logo: store.logo,
        },
    ]))

    return offers.map((offer) => ({
        ...offer,
        store: storesById.get(toStr(offer.storeId)),
    }))
}

// Get MongoDB collections
async function getCollections() {
    const client = await clientPromise
    const db = client.db("DealzyCoup")

    return {
        stores: db.collection<Store>("stores"),
        coupons: db.collection<Coupon>("coupons"),
        settings: db.collection<SiteSettings>("settings"),
        categories: db.collection<Category>("categories"),
    }
}

function transformCategory(category: Category, storeCount = 0): Category {
    return serialiseDates({
        ...category,
        id: toStr(category._id),
        _id: undefined,
        storeCount,
    }) as Category
}

export async function syncLegacyCategories(): Promise<void> {
    const { categories, stores } = await getCollections()
    await categories.createIndex({ key: 1 }, { unique: true })
    const storeDocs = await stores.find({}).toArray()
    const legacyNames = new Map<string, string>()

    for (const store of storeDocs) {
        const legacyCategory = (store as Store & { category?: string | string[] }).category
        const names = [
            ...(Array.isArray(store.categories) ? store.categories : []),
            ...(typeof legacyCategory === "string" ? [legacyCategory] : Array.isArray(legacyCategory) ? legacyCategory : []),
        ]
        for (const value of names) {
            if (typeof value !== "string") continue
            const name = value.trim()
            const key = categoryKey(name)
            if (key && !legacyNames.has(key)) legacyNames.set(key, name)
        }
    }

    for (const [key, name] of legacyNames) {
        const legacyImage = CATEGORY_TILES.find((tile) => categoryKey(tile.label) === key)?.image ?? ""
        try {
            await categories.updateOne(
                { key },
                {
                    $setOnInsert: {
                        name,
                        key,
                        image: legacyImage,
                        status: "active",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                },
                { upsert: true },
            )
        } catch (error) {
            if ((error as { code?: number }).code !== 11000) throw error
        }
    }

    for (const store of storeDocs) {
        const legacyCategory = (store as Store & { category?: string | string[] }).category
        if ((!Array.isArray(store.categories) || store.categories.length === 0) && legacyCategory) {
            const legacyValues = typeof legacyCategory === "string" ? [legacyCategory] : legacyCategory
            const migratedCategories = cleanCategories(legacyValues)
            if (migratedCategories.length) {
                await stores.updateOne(
                    { _id: store._id },
                    { $set: { categories: migratedCategories }, $unset: { category: "" } },
                )
            }
        }
    }
}

export async function getManagedCategories(includeArchived = false): Promise<Category[]> {
    const { categories, stores } = await getCollections()
    const storeDocs = await stores.find({}).toArray()

    const categoryFilter = includeArchived ? {} : { status: "active" as const }
    const categoryDocs = await categories.find(categoryFilter).sort({ name: 1 }).toArray()
    const counts = new Map<string, number>()

    for (const store of storeDocs) {
        const legacyCategory = (store as Store & { category?: string | string[] }).category
        const names = [
            ...(Array.isArray(store.categories) ? store.categories : []),
            ...(typeof legacyCategory === "string" ? [legacyCategory] : Array.isArray(legacyCategory) ? legacyCategory : []),
        ]
        const storeKeys = new Set(names.filter((name): name is string => typeof name === "string").map(categoryKey))
        for (const key of storeKeys) counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    return categoryDocs.map((category) => transformCategory(category, counts.get(category.key) ?? 0))
}

function validateCategoryImage(image: string) {
    if (image.startsWith("/api/category-images/")) return
    let parsed: URL
    try {
        parsed = new URL(image)
    } catch {
        throw new Error("Provide a valid image URL or upload an image")
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        throw new Error("Image URL must use HTTP or HTTPS")
    }
}

export async function createManagedCategory(name: string, image: string, storeIds: string[] = []): Promise<Category> {
    const trimmedName = name.trim()
    const key = categoryKey(trimmedName)
    if (!trimmedName || trimmedName.length > 60 || !key) throw new Error("Enter a valid category name")
    validateCategoryImage(image)

    await syncLegacyCategories()
    const { categories, stores } = await getCollections()
    if (await categories.findOne({ key })) throw new Error("A category with this name already exists")

    const selectedIds = Array.from(new Set(storeIds))
    if (selectedIds.some((id) => !ObjectId.isValid(id))) throw new Error("Invalid store selection")
    const selectedStores = selectedIds.length
        ? await stores.find({ _id: { $in: selectedIds.map((id) => new ObjectId(id)) } }).toArray()
        : []
    if (selectedStores.length !== selectedIds.length) throw new Error("One or more selected stores no longer exist")

    const now = new Date()
    const category: Omit<Category, "_id" | "id"> = {
        name: trimmedName,
        key,
        image,
        status: "active",
        createdAt: now,
        updatedAt: now,
    }
    let result
    try {
        result = await categories.insertOne(category as Category)
    } catch (error) {
        if ((error as { code?: number }).code === 11000) throw new Error("A category with this name already exists")
        throw error
    }
    await Promise.all(selectedStores.map((store) => stores.updateOne(
        { _id: store._id },
        {
            $set: { categories: cleanCategories([...(store.categories ?? []), trimmedName]), updatedAt: new Date() },
            $unset: { category: "" },
        },
    )))
    return transformCategory({ ...category, _id: result.insertedId } as Category, selectedStores.length)
}

async function removeStoredCategoryImage(image: string, exceptId?: ObjectId) {
    const match = image.match(/^\/api\/category-images\/([a-f\d]{24})$/i)
    if (!match) return
    const { categories } = await getCollections()
    if (await categories.findOne({ image, ...(exceptId ? { _id: { $ne: exceptId } } : {}) })) return
    const client = await clientPromise
    const bucket = new GridFSBucket(client.db("DealzyCoup"), { bucketName: "categoryImages" })
    try {
        await bucket.delete(new ObjectId(match[1]))
    } catch {
        // The category update remains valid if an old image was already removed.
    }
}

export async function updateManagedCategory(
    id: string,
    updates: { name?: string; image?: string; status?: "active" | "archived"; storeIds?: string[] },
): Promise<boolean> {
    if (!ObjectId.isValid(id)) throw new Error("Invalid category")
    const { categories, stores } = await getCollections()
    const category = await categories.findOne({ _id: new ObjectId(id) })
    if (!category) throw new Error("Category not found")

    const name = updates.name?.trim() ?? category.name
    const key = categoryKey(name)
    if (!name || name.length > 60 || !key) throw new Error("Enter a valid category name")
    if (key !== category.key && await categories.findOne({ key, _id: { $ne: category._id } })) {
        throw new Error("A category with this name already exists")
    }
    const image = updates.image ?? category.image
    validateCategoryImage(image)
    const selectedIds = updates.storeIds === undefined ? undefined : Array.from(new Set(updates.storeIds))
    if (selectedIds?.some((storeId) => !ObjectId.isValid(storeId))) throw new Error("Invalid store selection")
    const selectedStoreIds = selectedIds ? new Set(selectedIds) : undefined
    if (selectedIds) {
        const matchedStores = await stores.countDocuments({ _id: { $in: selectedIds.map((storeId) => new ObjectId(storeId)) } })
        if (matchedStores !== selectedIds.length) throw new Error("One or more selected stores no longer exist")
    }

    await categories.updateOne(
        { _id: category._id },
        { $set: { name, key, image, status: updates.status ?? category.status, updatedAt: new Date() } },
    )

    if (name !== category.name || selectedStoreIds) {
        const storeDocs = await stores.find({}).toArray()
        for (const store of storeDocs) {
            const legacyCategory = (store as Store & { category?: string | string[] }).category
            const currentCategories = Array.isArray(store.categories) && store.categories.length
                ? store.categories
                : typeof legacyCategory === "string"
                    ? [legacyCategory]
                    : Array.isArray(legacyCategory)
                        ? legacyCategory
                        : []
            const isSelected = selectedStoreIds?.has(toStr(store._id))
            let nextCategories = currentCategories.filter((value) => categoryKey(value) !== category.key)
            if (isSelected === true || (isSelected === undefined && currentCategories.some((value) => categoryKey(value) === category.key))) {
                nextCategories = cleanCategories([...nextCategories, name])
            } else {
                nextCategories = cleanCategories(nextCategories)
            }
            if (nextCategories.some((value, index) => value !== store.categories?.[index]) || nextCategories.length !== (store.categories?.length ?? 0)) {
                await stores.updateOne(
                    { _id: store._id },
                    { $set: { categories: nextCategories, updatedAt: new Date() }, $unset: { category: "" } },
                )
            }
        }
    }

    if (image !== category.image) await removeStoredCategoryImage(category.image, new ObjectId(id))
    return true
}

export async function deleteManagedCategory(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) throw new Error("Invalid category")
    const { categories } = await getCollections()
    const category = await categories.findOne({ _id: new ObjectId(id) })
    if (!category) throw new Error("Category not found")

    const allCategories = await getManagedCategories(true)
    if ((allCategories.find((item) => item.id === id)?.storeCount ?? 0) > 0) {
        throw new Error("This category is used by stores. Archive it instead of deleting it.")
    }

    const result = await categories.deleteOne({ _id: new ObjectId(id) })
    if (result.deletedCount && category.image) await removeStoredCategoryImage(category.image)
    return result.deletedCount > 0
}

// Store functions
export async function getAllStores(): Promise<Store[]> {
    const { stores } = await getCollections()
    const [allStores, countsByStore] = await Promise.all([
        stores.find({}).sort({ name: 1 }).toArray(),
        getOfferCountsByStore(),
    ])
    return transformStoresWithOfferCounts(allStores, countsByStore)
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
    const { stores } = await getCollections()
    const [store, countsByStore] = await Promise.all([
        stores.findOne({ slug }),
        getOfferCountsByStore(),
    ])
    return store ? transformStoresWithOfferCounts([store], countsByStore)[0] : null
}

export async function getStoreById(id: string): Promise<Store | null> {
    const { stores } = await getCollections()
    const [store, countsByStore] = await Promise.all([
        stores.findOne({ _id: new ObjectId(id) }),
        getOfferCountsByStore(),
    ])
    return store ? transformStoresWithOfferCounts([store], countsByStore)[0] : null
}

export async function getPopularStores(limit = 6): Promise<Store[]> {
    return (await getAllStores())
        .sort((a, b) => b.couponCount - a.couponCount)
        .slice(0, limit)
}

export async function createStore(store: Omit<Store, "_id" | "createdAt" | "updatedAt">): Promise<Store> {
    const { stores } = await getCollections()

    const newStore = {
        ...store,
        couponCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    }

    const result = await stores.insertOne(newStore as any)
    return { ...newStore, _id: result.insertedId }
}

export async function updateStore(id: string, store: Partial<Store>): Promise<boolean> {
    const { stores } = await getCollections()

    debugLog(`Updating store with ID: ${id}`, store)

    // Make sure we're working with the correct ID format
    const objectId = new ObjectId(id)

    // Prepare the update data, removing any fields that shouldn't be directly updated
    const updateData = { ...store }
    delete updateData._id
    delete updateData.id

    debugLog("Update data prepared:", updateData)

    const result = await stores.updateOne(
        { _id: objectId },
        {
            $set: {
                ...updateData,
                updatedAt: new Date(),
            },
        },
    )

    debugLog(`Update result for store ${id}:`, result)
    return result.modifiedCount > 0
}

export async function deleteStore(id: string): Promise<boolean> {
    const { stores, coupons } = await getCollections()

    // Delete all coupons associated with this store
    await coupons.deleteMany({ storeId: id })

    // Delete the store
    const result = await stores.deleteOne({ _id: new ObjectId(id) })

    return result.deletedCount > 0
}

// Coupon functions
export async function getAllCoupons(): Promise<Coupon[]> {
    const { coupons } = await getCollections()
    const allCoupons = await coupons.find({}).sort({ createdAt: -1 }).toArray()
    const populatedCoupons = await populateOffersWithStores(allCoupons)
    return populatedCoupons.map(transformCoupon)
}

export async function getOffersByType(type: "code" | "deal"): Promise<Coupon[]> {
    const { coupons } = await getCollections()
    const offers = await coupons.find({ type }).sort({ createdAt: -1 }).toArray()
    const populatedOffers = await populateOffersWithStores(offers)
    return populatedOffers.map(transformCoupon)
}

export async function getAdminDashboardStats() {
    const { coupons } = await getCollections()
    const offerStats = await coupons.aggregate<{
        _id: string | null
        itemCount: number
        usageCount: number
    }>([
        {
            $group: {
                _id: "$type",
                itemCount: { $sum: 1 },
                usageCount: { $sum: { $ifNull: ["$usedCount", 0] } },
            },
        },
    ]).toArray()

    return offerStats.reduce(
        (stats, group) => ({
            allItems: stats.allItems + group.itemCount,
            coupons: stats.coupons + (group._id === "code" ? group.itemCount : 0),
            deals: stats.deals + (group._id === "deal" ? group.itemCount : 0),
            usage: stats.usage + group.usageCount,
        }),
        { allItems: 0, coupons: 0, deals: 0, usage: 0 },
    )
}

export async function getRecentCoupons(limit = 5): Promise<Coupon[]> {
    const { coupons } = await getCollections()
    const recentCoupons = await coupons.find({ type: "code" })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray()
    const populatedCoupons = await populateOffersWithStores(recentCoupons)
    return populatedCoupons.map(transformCoupon)
}

async function getOfferById(id: string, type?: "deal"): Promise<Coupon | null> {
    if (!ObjectId.isValid(id)) return null

    const { coupons, stores } = await getCollections()
    const filter = type ? { _id: new ObjectId(id), type } : { _id: new ObjectId(id) }
    const coupon = await coupons.findOne(filter)
    if (!coupon) return null

    const store = await stores.findOne({ _id: new ObjectId(coupon.storeId.toString()) })
    return transformCoupon({
        ...coupon,
        store: store
            ? {
                id: store._id.toString(),
                name: store.name,
                slug: store.slug,
                logo: store.logo,
            }
            : undefined,
    })
}

export async function getCouponById(id: string): Promise<Coupon | null> {
    return getOfferById(id)
}

export async function getCouponsByStore(storeId: string): Promise<Coupon[]> {
    const { coupons, stores } = await getCollections()
    const [storeCoupons, store] = await Promise.all([
        coupons.find({ storeId: new ObjectId(storeId) }).toArray(),
        stores.findOne({ _id: new ObjectId(storeId) }),
    ])

    return storeCoupons.map((coupon) =>
        transformCoupon({
            ...coupon,
            store: store
                ? {
                    id: store._id.toString(),
                    name: store.name,
                    slug: store.slug,
                    logo: store.logo,
                }
                : undefined,
        }),
    )
}

export async function getTrendingCoupons(limit = 6): Promise<Coupon[]> {
    const { coupons } = await getCollections()
    const trendingCoupons = await coupons.find({}).sort({ usedCount: -1 }).limit(limit).toArray()
    const populated = await populateOffersWithStores(trendingCoupons)
    return populated.map(transformCoupon)
}

export async function createCoupon(coupon: Omit<Coupon, "_id" | "createdAt" | "updatedAt">): Promise<Coupon> {
    const { coupons, stores } = await getCollections()
    const now = new Date()
    const newCoupon = {
        ...coupon,
        storeId: new ObjectId(coupon.storeId.toString()),
        usedCount: 0,
        createdAt: now,
        updatedAt: now,
    }

    const result = await coupons.insertOne(newCoupon as any)

    // Increment the coupon count for the store
    await stores.updateOne({ _id: new ObjectId(coupon.storeId.toString()) }, { $inc: { couponCount: 1 } })

    return { ...newCoupon, _id: result.insertedId }
}

export async function updateCoupon(id: string, coupon: Partial<Coupon>): Promise<boolean> {
    const { coupons } = await getCollections()

    debugLog(`Updating coupon with ID: ${id}`, coupon)

    // Make sure we're working with the correct ID format
    const objectId = new ObjectId(id)

    // Prepare the update data, removing any fields that shouldn't be directly updated
    const updateData = { ...coupon }
    delete updateData._id
    delete updateData.id
    delete updateData.store

    // If storeId is a string, convert it to ObjectId
    if (typeof updateData.storeId === "string") {
        updateData.storeId = new ObjectId(updateData.storeId)
    }

    debugLog("Update data prepared:", updateData)

    const result = await coupons.updateOne(
        { _id: objectId },
        {
            $set: {
                ...updateData,
                updatedAt: new Date(),
            },
        },
    )

    debugLog(`Update result for coupon ${id}:`, result)
    return result.modifiedCount > 0
}

export async function deleteCoupon(id: string): Promise<boolean> {
    const { coupons } = await getCollections()

    const coupon = await coupons.findOne({ _id: new ObjectId(id) })
    if (!coupon) return false

    const result = await coupons.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount > 0) {
        // Decrement the coupon count for the store
        const { stores } = await getCollections()
        await stores.updateOne({ _id: new ObjectId(coupon.storeId.toString()) }, { $inc: { couponCount: -1 } })
        return true
    }

    return false
}

export async function incrementCouponUsage(id: string): Promise<boolean> {
    const { coupons } = await getCollections()

    const result = await coupons.updateOne({ _id: new ObjectId(id) }, { $inc: { usedCount: 1 } })

    return result.modifiedCount > 0
}

// Deal functions
export async function getAllDeals(): Promise<Deal[]> {
    return getOffersByType("deal")
}

export async function getDealById(id: string): Promise<Deal | null> {
    return getOfferById(id, "deal")
}

export async function createDeal(deal: {
    title: string
    storeId: string
    affiliateLink: string
    expiryDate: string
    logo?: string
}): Promise<Deal> {
    const { coupons, stores } = await getCollections()

    const newDeal = {
        ...deal,
        storeId: new ObjectId(deal.storeId.toString()),
        usedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        verifiedTime: "Today",
        type: "deal",
        code: null,
    }

    const result = await coupons.insertOne(newDeal as any)

    // Increment the coupon count for the store
    await stores.updateOne({ _id: new ObjectId(deal.storeId.toString()) }, { $inc: { couponCount: 1 } })

    return { ...newDeal, _id: result.insertedId }
}

// Add this function to the existing data.ts file
export async function deleteDeal(id: string): Promise<boolean> {
    // Deals are stored in the coupons collection with type="deal"
    return await deleteCoupon(id)
}

// Search function
export async function searchCouponsAndStores(query: string): Promise<{
    coupons: Coupon[]
    stores: Store[]
}> {
    const { coupons, stores } = await getCollections()
    const normalizedQuery = query.toLowerCase()

    const [matchedStores, matchedCoupons, countsByStore] = await Promise.all([
        stores.find({
            $or: [
                { name: { $regex: normalizedQuery, $options: "i" } },
                { description: { $regex: normalizedQuery, $options: "i" } },
                { categories: { $in: [new RegExp(normalizedQuery, "i")] } },
            ],
        })
        .toArray(),
        coupons.find({
            $or: [
                { title: { $regex: normalizedQuery, $options: "i" } },
                { description: { $regex: normalizedQuery, $options: "i" } },
                { code: { $regex: normalizedQuery, $options: "i" } },
            ],
        })
        .toArray(),
        getOfferCountsByStore(),
    ])
    const populatedCoupons = await populateOffersWithStores(matchedCoupons)

    return {
        coupons: populatedCoupons.map(transformCoupon),
        stores: transformStoresWithOfferCounts(matchedStores, countsByStore),
    }
}

// Settings functions
export async function getSettings(): Promise<SiteSettings> {
    const { settings } = await getCollections()

    const siteSettings = await settings.findOne({})

    if (!siteSettings) {
        // Create default settings if none exist
        const defaultSettings: SiteSettings = {
            siteName: "DealzyCoup",
            siteDescription: "Find the best deals and coupons",
            contactEmail: "contact@DealzyCoup.com",
            socialLinks: {
                facebook: "https://facebook.com/DealzyCoup",
                twitter: "https://twitter.com/DealzyCoup",
                instagram: "https://instagram.com/DealzyCoup",
            },
            metaTags: {
                title: "DealzyCoup - Find the Best Deals",
                description: "Discover the best coupons and deals from your favorite stores",
                keywords: "coupons, deals, promo codes, discounts, savings",
            },
            updatedAt: new Date(),
        }

        await settings.insertOne(defaultSettings as any)
        return defaultSettings
    }

    return siteSettings
}

export async function updateSettings(newSettings: Partial<SiteSettings>): Promise<boolean> {
    const { settings } = await getCollections()

    const currentSettings = await settings.findOne({})

    if (!currentSettings) {
        // Create settings if they don't exist
        const result = await settings.insertOne({
            ...newSettings,
            updatedAt: new Date(),
        } as any)

        return result.acknowledged
    }

    // Update existing settings
    const result = await settings.updateOne(
        { _id: currentSettings._id },
        {
            $set: {
                ...newSettings,
                updatedAt: new Date(),
            },
        },
    )

    return result.modifiedCount > 0
}
