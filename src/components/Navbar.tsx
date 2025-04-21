"use client"

import Link from "next/link"
import { ShoppingBag, Tag } from "lucide-react"
import SearchBar from "./SearchBar"

export default function Navbar() {
    return (
        <section className="w-full h-20 flex justify-center items-center shadow bg-white sticky top-0 z-50">
            <div className="w-full max-w-6xl mx-auto flex items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <img src="/next.svg" alt="Logo" width={100} height={40} className="object-contain" />
                    {/* <span className="font-bold text-teal-600 text-xl hidden sm:inline-block">CouponHub</span> */}
                </Link>

                {/* Nav */}
                <div className="flex-1 max-w-xl ml-6">
                    <ul className="flex gap-x-6 items-center justify-end">
                        <li className="hidden md:flex">
                            <Link
                                href="/stores"
                                className="flex items-center gap-1.5 font-medium text-gray-700 hover:text-teal-600 transition-colors"
                            >
                                <ShoppingBag size={18} />
                                <span>Stores</span>
                            </Link>
                        </li>
                        <li className="hidden md:flex">
                            <Link
                                href="/coupons"
                                className="flex items-center gap-1.5 font-medium text-gray-700 hover:text-teal-600 transition-colors"
                            >
                                <Tag size={18} />
                                <span>Coupons</span>
                            </Link>
                        </li>
                        <li className="flex-1">
                            <SearchBar placeholder="Search for coupons..." className="w-full" />
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    )
}
