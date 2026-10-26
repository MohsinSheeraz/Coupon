import type { ObjectId } from "mongodb"

export interface Store {
    _id?: ObjectId | string
    id?: string // Add this line
    name: string
    slug: string
    logo: string
    website: string
    affiliateLink: string
    categories: string[]
    couponCount: number
    dealCount: number
    createdAt?: Date
    updatedAt?: Date
}

export interface Category {
    _id?: ObjectId | string
    id?: string
    name: string
    key: string
    image: string
    status: "active" | "archived"
    storeCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
}

export interface Coupon {
    _id?: ObjectId | string
    id?: string // Add this line
    title: string
    code: string | null
    affiliateLink: string
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
    logo?: string
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

// Add a new Deal interface
export interface Deal {
    _id?: ObjectId | string
    id?: string
    title: string
    logo?: string
    affiliateLink: string
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
    createdAt?: Date
    updatedAt?: Date
}
