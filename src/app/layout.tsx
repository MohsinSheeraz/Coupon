import type React from "react"
import type { Metadata } from "next/types"
import { Bricolage_Grotesque, DM_Sans } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import Footer from "@/components/footer"
import { Toaster } from "sonner"

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display-src",
  display: "swap",
})
const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body-src",
  display: "swap",
})

export const metadata: Metadata = {
  title: "DealzyCoupon - Find the Best Deals",
  description: "Discover the best coupons and deals from your favorite stores",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col bg-paper">
            <Navbar />
            <main className="flex-1">
              {children}
              <Toaster />
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
