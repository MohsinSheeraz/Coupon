import { BadgePercent, Sparkles, Store, Tag, Ticket } from "lucide-react"

interface ListingIntroProps {
    kind: "coupons" | "deals" | "stores"
    title?: string
    description?: string
}

export function ListingIntro({ kind, title, description }: ListingIntroProps) {
    const isCouponPage = kind === "coupons"
    const isStorePage = kind === "stores"

    return (
        <section className={`listing-intro listing-intro-${kind} mb-6`}>
            <div className="listing-intro-copy">
                <p className="listing-intro-eyebrow">
                    <Sparkles size={14} aria-hidden="true" />
                    {isCouponPage ? "Your next savings start here" : isStorePage ? "Find stores you love" : "Deals worth discovering"}
                </p>
                <h1 className="font-display">
                    {title ?? <>All <span>{isCouponPage ? "Coupons" : isStorePage ? "Stores" : "Deals"}</span></>}
                </h1>
                <p className="listing-intro-description">
                    {description ?? (isCouponPage
                        ? "Browse our collection of verified coupons."
                        : isStorePage
                            ? "Explore trusted stores and find the offers you are looking for."
                            : "Browse our collection of verified deals from top stores")}
                </p>
            </div>

            <div className="listing-hero-art" aria-hidden="true">
                <div className="listing-hero-glow" />
                <div className="listing-hero-icon listing-hero-icon-main">
                    {isCouponPage
                        ? <Ticket size={42} strokeWidth={1.7} />
                        : isStorePage
                            ? <Store size={42} strokeWidth={1.7} />
                            : <BadgePercent size={42} strokeWidth={1.7} />}
                </div>
                <div className="listing-hero-icon listing-hero-icon-tag">
                    <Tag size={24} strokeWidth={1.8} />
                </div>
                <div className="listing-hero-sparkle">
                    <Sparkles size={23} strokeWidth={1.8} />
                </div>
            </div>
        </section>
    )
}
