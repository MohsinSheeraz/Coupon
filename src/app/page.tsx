import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getTrendingCoupons, getPopularStores } from "@/lib/data"
import { ArrowRight, Tag, Store, Percent } from "lucide-react"
import { CouponCard } from "@/components/coupon-card"

export default async function Home() {
  const trendingCoupons = await getTrendingCoupons()
  const popularStores = await getPopularStores()

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Save Money with the Best Coupons & Deals</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Discover thousands of promo codes and discounts from your favorite stores
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
              <Link href="/coupons">Browse Coupons</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/stores">Explore Stores</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                name: "Electronics",
                icon: <Percent className="h-8 w-8 mb-3" />,
                color: "bg-purple-100 text-purple-600",
              },
              { name: "Fashion", icon: <Tag className="h-8 w-8 mb-3" />, color: "bg-pink-100 text-pink-600" },
              { name: "Home & Garden", icon: <Store className="h-8 w-8 mb-3" />, color: "bg-amber-100 text-amber-600" },
              { name: "Travel", icon: <Percent className="h-8 w-8 mb-3" />, color: "bg-sky-100 text-sky-600" },
            ].map((category, index) => (
              <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className={`flex flex-col items-center justify-center p-6 ${category.color} rounded-lg`}>
                  {category.icon}
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Coupons */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Trending Coupons</h2>
            <Link href="/coupons" className="text-teal-600 hover:text-teal-700 flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingCoupons.map((coupon) => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Stores */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Popular Stores</h2>
            <Link href="/stores" className="text-teal-600 hover:text-teal-700 flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {popularStores.map((store) => (
              <Link key={store.id} href={`/stores/${store.slug}`}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                    <div className="h-16 w-16 rounded-full bg-white border flex items-center justify-center mb-4">
                      <img
                        src={store.logo || "/placeholder.svg"}
                        alt={store.name}
                        className="h-10 w-10 object-contain"
                      />
                    </div>
                    <h3 className="font-medium">{store.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{store.couponCount} Coupons</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Never Miss a Deal</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get the latest coupons delivered to your inbox
          </p>
          <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <Input type="email" placeholder="Your email address" className="bg-white text-gray-900 border-0" />
            <Button className="bg-gray-900 hover:bg-gray-800">Subscribe</Button>
          </form>
        </div>
      </section>
    </div>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`px-4 py-2 rounded-md w-full ${props.className || ""}`} />
}
