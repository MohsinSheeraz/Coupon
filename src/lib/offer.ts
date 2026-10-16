// NEW FILE: src/lib/offer.ts
// Small helpers shared by coupon-card.tsx and coupon-modal.tsx.
// Not a server action file, so it is safe to import from client components.

export type Expiry = { label: string; tone: "ok" | "soon" | "expired" }

/** The product picture. Admin-uploaded logo first, store logo as fallback. */
export function getOfferImage(offer: any): string {
    return offer?.logo || offer?.store?.logo || "/placeholder.svg"
}

/** "5 days left" / "Ends today" / "Expired". Returns null if the date is missing or invalid. */
export function getExpiry(expiryDate?: string | null): Expiry | null {
    if (!expiryDate) return null
    const end = new Date(expiryDate)
    if (Number.isNaN(end.getTime())) return null

    // Date-only strings (YYYY-MM-DD) mean "valid through the end of that day"
    end.setUTCHours(23, 59, 59, 999)

    const msLeft = end.getTime() - Date.now()
    const DAY = 24 * 60 * 60 * 1000

    if (msLeft < 0) return { label: "Expired", tone: "expired" }
    if (msLeft <= DAY) return { label: "Ends today", tone: "soon" }

    const days = Math.ceil(msLeft / DAY)
    return { label: `${days} days left`, tone: days <= 3 ? "soon" : "ok" }
}

/** "WELCOME20" -> "WE•••••" so the card teases the code but the click still reveals it. */
export function maskCode(code?: string | null): string {
    if (!code) return "••••••"
    const hidden = Math.max(3, Math.min(6, code.length - 2))
    return `${code.slice(0, 2)}${"•".repeat(hidden)}`
}