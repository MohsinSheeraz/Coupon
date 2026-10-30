import type React from "react"
import type { Metadata } from "next/types"
import { Bricolage_Grotesque, DM_Sans } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import Footer from "@/components/footer"
import { PublicChrome } from "@/components/public-chrome"
import { PublicPresenceTracker } from "@/components/public-presence-tracker"
import { NavigationFeedback } from "@/components/navigation-feedback"
import { Toaster } from "sonner"
import { Suspense } from "react"

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
  title: "DealzyCoup - Find the Best Deals",
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
          <Suspense fallback={null}>
            <NavigationFeedback />
          </Suspense>
          <div className="flex min-h-screen flex-col bg-paper">
            <PublicChrome>
              <Navbar />
            </PublicChrome>
            <PublicChrome>
              <PublicPresenceTracker />
            </PublicChrome>
            <main className="flex-1">
              {children}
              <Toaster />
            </main>
            <PublicChrome>
              <Footer />
            </PublicChrome>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
