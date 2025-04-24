import type React from "react"
import type { Metadata } from "next/types"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CouponHub - Find the Best Deals",
  description: "Discover the best coupons and deals from your favorite stores",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"

      suppressHydrationWarning
    >
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="bg-gray-50 border-t py-8">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="font-bold text-lg mb-4">CouponHub</h3>
                    <p className="text-gray-600">Your destination for the best deals and discounts online.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                      <li>
                        <a href="/coupons" className="text-gray-600 hover:text-gray-900">
                          Coupons
                        </a>
                      </li>
                      <li>

                        <Link href="/stores" className="text-gray-600 hover:text-gray-900">Stores</Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-4">Categories</h3>
                    <ul className="space-y-2">
                      <li>
                        <a href="#" className="text-gray-600 hover:text-gray-900">
                          Electronics
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-gray-600 hover:text-gray-900">
                          Fashion
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-gray-600 hover:text-gray-900">
                          Home & Garden
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-gray-600 hover:text-gray-900">
                          Travel
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-4">Contact</h3>
                    <ul className="space-y-2">
                      <li className="text-gray-600">support@couponhub.com</li>
                      <li className="text-gray-600">1-800-COUPONS</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t text-center text-gray-600">
                  <p>© {new Date().getFullYear()} CouponHub. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
