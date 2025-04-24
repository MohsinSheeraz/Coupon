import clientPromise from "./mongodb"
import { ObjectId } from "mongodb"
import type { Store, Coupon, SiteSettings } from "@/lib/models"

// Get MongoDB collections
async function getCollections() {
    const client = await clientPromise
    const db = client.db("couponhub")

    return {
        stores: db.collection<Store>("stores"),
        coupons: db.collection<Coupon>("coupons"),
        settings: db.collection<SiteSettings>("settings"),
    }
}

// Store functions
export async function getAllStores(): Promise<Store[]> {
    const { stores } = await getCollections()
    return await stores.find({}).sort({ name: 1 }).toArray()
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
    const { stores } = await getCollections()
    return await stores.findOne({ slug })
}

export async function getStoreById(id: string): Promise<Store | null> {
    const { stores } = await getCollections()
    return await stores.findOne({ _id: new ObjectId(id) })
}

export async function getPopularStores(limit = 6): Promise<Store[]> {
    const { stores } = await getCollections()
    return await stores.find({}).sort({ couponCount: -1 }).limit(limit).toArray()
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

    const result = await stores.updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                ...store,
                updatedAt: new Date(),
            },
        },
    )

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

    return populatedCoupons
}

export async function getCouponsByStore(storeId: string): Promise<Coupon[]> {
    const { coupons, stores } = await getCollections()
    const storeCoupons = await coupons.find({ storeId: new ObjectId(storeId) }).toArray()

    const store = await stores.findOne({ _id: new ObjectId(storeId) })

    return storeCoupons.map((coupon) => ({
        ...coupon,
        store: store
            ? {
                id: store._id.toString(),
                name: store.name,
                slug: store.slug,
                logo: store.logo,
            }
            : undefined,
    }))
}

export async function getTrendingCoupons(limit = 6): Promise<Coupon[]> {
    const { coupons, stores } = await getCollections()
    const trendingCoupons = await coupons.find({}).sort({ usedCount: -1 }).limit(limit).toArray()

    // Populate store information
    const populatedCoupons = await Promise.all(
        trendingCoupons.map(async (coupon) => {
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

    return populatedCoupons
}

export async function createCoupon(coupon: Omit<Coupon, "_id" | "createdAt" | "updatedAt">): Promise<Coupon> {
    const { coupons, stores } = await getCollections()

    const newCoupon = {
        ...coupon,
        storeId: new ObjectId(coupon.storeId.toString()),
        usedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        verifiedTime: "Today",
    }

    const result = await coupons.insertOne(newCoupon as any)

    // Increment the coupon count for the store
    await stores.updateOne({ _id: new ObjectId(coupon.storeId.toString()) }, { $inc: { couponCount: 1 } })

    return { ...newCoupon, _id: result.insertedId }
}

export async function updateCoupon(id: string, coupon: Partial<Coupon>): Promise<boolean> {
    const { coupons } = await getCollections()

    const result = await coupons.updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                ...coupon,
                updatedAt: new Date(),
            },
        },
    )

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
        coupons: populatedCoupons,
        stores: matchedStores,
    }
}

// Settings functions
export async function getSettings(): Promise<SiteSettings> {
    const { settings } = await getCollections()

    const siteSettings = await settings.findOne({})

    if (!siteSettings) {
        // Create default settings if none exist
        const defaultSettings: SiteSettings = {
            siteName: "CouponHub",
            siteDescription: "Find the best deals and coupons",
            contactEmail: "contact@couponhub.com",
            socialLinks: {
                facebook: "https://facebook.com/couponhub",
                twitter: "https://twitter.com/couponhub",
                instagram: "https://instagram.com/couponhub",
            },
            metaTags: {
                title: "CouponHub - Find the Best Deals",
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
