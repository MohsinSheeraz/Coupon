import type React from "react"
import Link from "next/link"
import { getTrendingCoupons } from "@/lib/data"
import { CouponCard } from "@/components/coupon-card"
import HeroCarousel from "@/components/hero-carousel"
import CarouselSize from "@/components/Store-Carousel"
import { CATEGORY_TILES, withFallback } from "@/lib/images"

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <h2 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">{title}</h2>
      <Link href={href} className="group relative shrink-0 pb-1 text-sm font-semibold text-grape">
        View all
        <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 rounded-full bg-grape transition-transform duration-300 group-hover:scale-x-100" />
      </Link>
    </div>
  )
}

export const revalidate = 30   // seconds
export default async function Home() {
  const trendingCoupons = await getTrendingCoupons()

  return (
    <div>
      {/* Hero Section */}
      <HeroCarousel />

      {/* Categories */}
      <section className="pt-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Shop by category
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {CATEGORY_TILES.map((tile) => (
              <Link
                key={tile.label}
                href={`/search?q=${encodeURIComponent(tile.query)}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-3xl bg-ink shadow-[0_14px_30px_-18px_rgb(23_19_46/0.5)] transition-shadow duration-500 hover:shadow-[0_24px_44px_-20px_rgb(91_61_245/0.55)]"
              >
                <div
                  aria-hidden
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
                  style={{ backgroundImage: withFallback(tile.image) }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent transition-opacity duration-500 group-hover:from-grape-deep/85" />
                <span className="absolute inset-x-5 bottom-5 font-display text-xl font-semibold text-white transition-transform duration-500 ease-out group-hover:-translate-y-1 md:text-2xl">
                  {tile.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Stores */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <SectionHeader title="Popular stores" href="/stores" />
          <CarouselSize />
        </div>
      </section>

      {/* Trending Coupons */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <SectionHeader title="Trending now" href="/coupons" />
          <div className="stagger grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trendingCoupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
