import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Tag,
  TrendingUp,
} from "lucide-react";
import { getManagedCategories, getTrendingCoupons } from "@/lib/data";
import { CouponCard } from "@/components/coupon-card";
import HeroCarousel from "@/components/hero-carousel";
import CarouselSize from "@/components/Store-Carousel";
import CategorySlider from "@/components/category-slider";

function SectionHeader({
  kicker,
  title,
  href,
  link,
}: {
  kicker: string;
  title: string;
  href: Route;
  link: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow text-olive">{kicker}</span>
        <h2>{title}</h2>
      </div>
      <Link className="text-link" href={href}>
        {link}
        <ArrowUpRight size={18} />
      </Link>
    </div>
  );
}

export const revalidate = 30; // seconds
export default async function Home() {
  const [trendingCoupons, categories] = await Promise.all([
    getTrendingCoupons(),
    getManagedCategories(),
  ]);
  return (
    <div className="homepage">
      {/* Hero Section */}
      <HeroCarousel />

      <div className="container mx-auto px-4">
        <div className="trust-strip">
          <span>
            <BadgeCheck size={18} /> Offers worth checking out
          </span>
          <span>
            <Tag size={18} /> Deals from your favorite stores
          </span>
          <span>
            <TrendingUp size={18} /> Fresh ways to save
          </span>
        </div>
      </div>
      {/* Categories */}
      <section className="home-section category-section">
        <div className="container mx-auto px-4">
          <SectionHeader
            kicker="A LITTLE SOMETHING FOR EVERYONE"
            title="Explore your kind of find."
            href="/stores"
            link="All stores"
          />
          <h3 className="mobile-category-heading">Categories</h3>
          <CategorySlider categories={categories} />
        </div>
      </section>

      {/* Popular Stores */}
      <section className="home-section stores-section">
        <div className="container mx-auto px-4">
          <SectionHeader
            kicker="GOOD COMPANY"
            title="Stores you’ll come back to."
            href="/stores"
            link="Browse stores"
          />
          <CarouselSize />
        </div>
      </section>

      {/* Trending Coupons */}
      <section className="home-section trending-section">
        <div className="container mx-auto px-4">
          <SectionHeader
            kicker="RIGHT NOW"
            title="The offers worth a look."
            href="/coupons"
            link="All coupons"
          />
          <div className="stagger grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
            {trendingCoupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 pb-20">
        <section className="discover-banner">
          <div>
            <span className="eyebrow">THE SEARCH STARTS HERE</span>
            <h2>
              Something in mind?
              <br />
              <em>There’s a deal for that.</em>
            </h2>
          </div>
          {/* <Link href="/stores" className="button-dark">
            Find a store <Search size={18} />
          </Link> */}
          <ArrowRight
            className="discover-decoration"
            aria-hidden
            size={180}
            strokeWidth={0.5}
          />
        </section>
      </div>
    </div>
  );
}
