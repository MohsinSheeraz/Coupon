"use server"
import clientPromise from "./mongodb"
import { isToday, isYesterday, format } from 'date-fns'
import { ObjectId } from "mongodb"
import type { Store, Coupon, SiteSettings, Deal } from "@/lib/models"
import { debugLog } from "./debug"

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
// ─┘

// Get MongoDB collections
async function getCollections() {
    const client = await clientPromise
    const db = client.db("DealzyCoupon")

    return {
        stores: db.collection<Store>("stores"),
        coupons: db.collection<Coupon>("coupons"),
        settings: db.collection<SiteSettings>("settings"),
    }
}

// Store functions
export async function getAllStores(): Promise<Store[]> {
    const { stores } = await getCollections()
    return (await stores.find({}).sort({ name: 1 }).toArray()).map(transformStore)
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
    const { stores } = await getCollections()
    const store = await stores.findOne({ slug })
    return store ? transformStore(store) : null
}

export async function getStoreById(id: string): Promise<Store | null> {
    const { stores } = await getCollections()
    const store = await stores.findOne({ _id: new ObjectId(id) })
    return store ? transformStore(store) : null
}

export async function getPopularStores(limit = 6): Promise<Store[]> {
    const { stores } = await getCollections()

    // 1) fetch raw store docs and map to your Store type (with couponCount)
    const raw = await stores.find({}).sort({ couponCount: -1 }).limit(limit).toArray()
    const baseStores = raw.map(transformStore)

    const allDeals = await getAllDeals()     // your existing helper
    const dealCountMap: Record<string, number> = {}
    allDeals.forEach((d) => {
        const sid = d.store?.id
        if (sid) dealCountMap[sid] = (dealCountMap[sid] || 0) + 1
    })
    // 3) merge dealCount into each Store
    return baseStores.map((st) => ({
        ...st,
        dealCount: dealCountMap[st.id] || 0,
    }))
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
    const { coupons, stores } = await getCollections()
    const allCoupons = await coupons.find({}).sort({ createdAt: -1 }).toArray()

    // Populate store information
    const populatedCoupons = await Promise.all(
        allCoupons.map(async (coupon) => {
            const store = await stores.findOne({ _id: new ObjectId(coupon.storeId.toString()) })
            return {
                ...coupon,
                store: store
                    ? {
                        id: store._id.toString(),
                        name: store.name,
                        slug: store.slug,
                        logo: store.logo,
                    }
                    : undefined,
            }
        }),
    )

    return populatedCoupons.map(transformCoupon)
}

export async function getCouponsByStore(storeId: string): Promise<Coupon[]> {
    const { coupons, stores } = await getCollections()
    const storeCoupons = await coupons.find({ storeId: new ObjectId(storeId) }).toArray()

    const store = await stores.findOne({ _id: new ObjectId(storeId) })

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
    const { coupons, stores } = await getCollections()

    const trendingCoupons = await coupons.find({}).sort({ usedCount: -1 }).limit(limit).toArray()

    const populated = await Promise.all(
        trendingCoupons.map(async (c) => {
            const store = await stores.findOne({ _id: new ObjectId(c.storeId.toString()) })
            return {
                ...c,
                store: store
                    ? {
                        id: store._id.toString(),
                        name: store.name,
                        slug: store.slug,
                        logo: store.logo,
                    }
                    : undefined,
            }
        }),
    )

    return populated.map(transformCoupon) // <-- now 100 % plain
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
    const { coupons, stores } = await getCollections()
    const allDeals = await coupons.find({ type: "deal" }).sort({ createdAt: -1 }).toArray()

    // Populate store information
    const populatedDeals = await Promise.all(
        allDeals.map(async (deal) => {
            const store = await stores.findOne({ _id: new ObjectId(deal.storeId.toString()) })
            return {
                ...deal,
                store: store
                    ? {
                        id: store._id.toString(),
                        name: store.name,
                        slug: store.slug,
                        logo: store.logo,
                    }
                    : undefined,
            }
        }),
    )

    return populatedDeals.map(transformCoupon)
}

export async function createDeal(deal: {
    title: string
    storeId: string
    affiliateLink: string
    expiryDate: string
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

    // Search for stores
    const matchedStores = await stores
        .find({
            $or: [
                { name: { $regex: normalizedQuery, $options: "i" } },
                { description: { $regex: normalizedQuery, $options: "i" } },
                { categories: { $in: [new RegExp(normalizedQuery, "i")] } },
            ],
        })
        .toArray()

    // Search for coupons
    const matchedCoupons = await coupons
        .find({
            $or: [
                { title: { $regex: normalizedQuery, $options: "i" } },
                { description: { $regex: normalizedQuery, $options: "i" } },
                { code: { $regex: normalizedQuery, $options: "i" } },
            ],
        })
        .toArray()

    // Populate store information for coupons
    const populatedCoupons = await Promise.all(
        matchedCoupons.map(async (coupon) => {
            const store = await stores.findOne({ _id: new ObjectId(coupon.storeId.toString()) })
            return {
                ...coupon,
                store: store
                    ? {
                        id: store._id.toString(),
                        name: store.name,
                        slug: store.slug,
                        logo: store.logo,
                    }
                    : undefined,
            }
        }),
    )

    return {
        coupons: populatedCoupons.map(transformCoupon),
        stores: matchedStores.map(transformStore),
    }
}

// Settings functions
export async function getSettings(): Promise<SiteSettings> {
    const { settings } = await getCollections()

    const siteSettings = await settings.findOne({})

    if (!siteSettings) {
        // Create default settings if none exist
        const defaultSettings: SiteSettings = {
            siteName: "DealzyCoupon",
            siteDescription: "Find the best deals and coupons",
            contactEmail: "contact@DealzyCoupon.com",
            socialLinks: {
                facebook: "https://facebook.com/DealzyCoupon",
                twitter: "https://twitter.com/DealzyCoupon",
                instagram: "https://instagram.com/DealzyCoupon",
            },
            metaTags: {
                title: "DealzyCoupon - Find the Best Deals",
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
