"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Navbar() {
    const [searchQuery, setSearchQuery] = useState("")
    const router = useRouter()

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    return (
        <header className="bg-white border-b sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                            <span className="text-2xl font-bold text-teal-600">CouponHub</span>
                        </Link>
                    </div>

                    <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                                type="search"
                                placeholder="Search for stores or coupons..."
                                className="pl-10 w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="ml-2 bg-teal-600 hover:bg-teal-700">
                            Search
                        </Button>
                    </form>

                    <nav className="flex items-center space-x-6">
                        <Link href="/coupons" className="text-gray-700 hover:text-teal-600 font-medium">
                            Coupons
                        </Link>
                        <Link href="/stores" className="text-gray-700 hover:text-teal-600 font-medium">
                            Stores
                        </Link>
                    </nav>
                </div>

                <div className="md:hidden py-3">
                    <form onSubmit={handleSearch} className="flex items-center">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                                type="search"
                                placeholder="Search for stores or coupons..."
                                className="pl-10 w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="ml-2 bg-teal-600 hover:bg-teal-700">
                            Search
                        </Button>
                    </form>
                </div>
            </div>
        </header>
    )
}
