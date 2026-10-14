"use server"

import { revalidatePath } from "next/cache"
import {
    createStore as dbCreateStore,
    updateStore as dbUpdateStore,
    deleteStore as dbDeleteStore,
    createCoupon as dbCreateCoupon,
    updateCoupon as dbUpdateCoupon,
    deleteCoupon as dbDeleteCoupon,
    incrementCouponUsage as dbIncrementCouponUsage,
    updateSettings as dbUpdateSettings,
    createDeal as dbCreateDeal,
} from "@/lib/data"
import type { Store, Coupon, SiteSettings } from "./models"

// Store actions
export async function createStore(store: Omit<Store, "_id" | "createdAt" | "updatedAt" | "couponCount">) {
    try {
        await dbCreateStore({
            ...store,
            couponCount: 0,
        })
        revalidatePath("/admin/stores")
        revalidatePath("/stores")
        return { success: true }
    } catch (error) {
        console.error("Error creating store:", error)
        return { success: false, error: "Failed to create store" }
    }
}

export async function updateStore(id: string, store: Partial<Store>) {
    try {
        await dbUpdateStore(id, store)
        revalidatePath("/admin/stores")
        revalidatePath(`/stores/${store.slug}`)
        revalidatePath("/stores")
        return { success: true }
    } catch (error) {
        console.error("Error updating store:", error)
        return { success: false, error: "Failed to update store" }
    }
}

export async function deleteStore(id: string) {
    try {
        await dbDeleteStore(id)
        revalidatePath("/admin/stores")
        revalidatePath("/stores")
        return { success: true }
    } catch (error) {
        console.error("Error deleting store:", error)
        return { success: false, error: "Failed to delete store" }
    }
}

// Coupon actions
export async function createCoupon(
    coupon: Omit<Coupon, "_id" | "createdAt" | "updatedAt" | "usedCount" | "verifiedTime" | "store">,
) {
    try {
        await dbCreateCoupon({
            ...coupon,
            usedCount: 0,
            verifiedTime: "Today",
        })
        revalidatePath("/admin/coupons")
        revalidatePath("/coupons")
        revalidatePath("/stores")
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Error creating coupon:", error)
        return { success: false, error: "Failed to create coupon" }
    }
}

export async function updateCoupon(id: string, coupon: Partial<Coupon>) {
    try {
        await dbUpdateCoupon(id, coupon)
        revalidatePath("/admin/coupons")
        revalidatePath("/admin/deals") // Add this line to revalidate deals too
        revalidatePath("/coupons")
        revalidatePath("/deals") // Add this line to revalidate deals too
        revalidatePath("/stores")
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Error updating coupon:", error)
        return { success: false, error: "Failed to update coupon" }
    }
}

export async function deleteCoupon(id: string) {
    try {
        await dbDeleteCoupon(id)
        revalidatePath("/admin/coupons")
        revalidatePath("/coupons")
        revalidatePath("/stores")
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Error deleting coupon:", error)
        return { success: false, error: "Failed to delete coupon" }
    }
}

export async function incrementCouponUsage(id: string) {
    try {
        await dbIncrementCouponUsage(id)
        return { success: true }
    } catch (error) {
        console.error("Error incrementing coupon usage:", error)
        return { success: false, error: "Failed to increment coupon usage" }
    }
}

// Deal actions
export async function createDeal(deal: {
    title: string
    storeId: string
    affiliateLink: string
    expiryDate: string
    logo?: string
}) {
    try {
        await dbCreateDeal({
            title: deal.title,
            storeId: deal.storeId,
            affiliateLink: deal.affiliateLink,
            expiryDate: deal.expiryDate,
            ...(deal.logo ? { logo: deal.logo } : {}),
        })
        revalidatePath("/admin/deals")
        revalidatePath("/deals")
        revalidatePath("/stores")
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Error creating deal:", error)
        return { success: false, error: "Failed to create deal" }
    }
}

export async function deleteDeal(id: string) {
    try {
        await dbDeleteCoupon(id) // Deals are stored in the coupons collection
        revalidatePath("/admin/deals")
        revalidatePath("/deals")
        revalidatePath("/stores")
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Error deleting deal:", error)
        return { success: false, error: "Failed to delete deal" }
    }
}

// Settings actions
export async function updateSettings(settings: Partial<SiteSettings>) {
    try {
        await dbUpdateSettings(settings)
        revalidatePath("/admin/settings")
        return { success: true }
    } catch (error) {
        console.error("Error updating settings:", error)
        return { success: false, error: "Failed to update settings" }
    }
}
