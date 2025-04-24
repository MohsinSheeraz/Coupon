import type { ObjectId } from "mongodb"

export interface Store {
    _id?: ObjectId | string
    id?: string // Add this line
    name: string
    slug: string
    logo: string
    description: string
    couponCount: number
    website: string
    categories: string[]
    createdAt?: Date
    updatedAt?: Date
}

export interface Coupon {
    _id?: ObjectId | string
    id?: string // Add this line
    title: string
    code: string | null
    description: string
    expiryDate: string
    verifiedTime: string
    usedCount: number
    storeId: string | ObjectId
    store?: {
        id: string
        name: string
        slug: string
        logo: string
    }
    type: "code" | "deal"
    createdAt?: Date
    updatedAt?: Date
}

export interface SiteSettings {
    _id?: ObjectId | string
    siteName: string
    siteDescription: string
    contactEmail: string
    socialLinks: {
        facebook?: string
        twitter?: string
        instagram?: string
        pinterest?: string
    }
    metaTags: {
        title: string
        description: string
        keywords: string
    }
    updatedAt?: Date
}
