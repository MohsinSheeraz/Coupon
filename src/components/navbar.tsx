"use client"

import type React from "react"

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import LOGO from "./../../public/LogoMain.png";


const links = [
    { href: "/", label: "Home" },
    { href: "/coupons", label: "Coupons" },
    { href: "/deals", label: "Deals" },
    { href: "/stores", label: "Stores" },
] as const

export default function Navbar() {
    const [searchQuery, setSearchQuery] = useState("")
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true)
            } else {
                setIsScrolled(false)
            }
        }

        handleScroll()
        window.addEventListener("scroll", handleScroll, { passive: true })
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
            setMobileMenuOpen(false)
        }
    }

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href)

    return (
        <header
            className={cn(
                "sticky top-0 z-50 transition-all duration-300",
                isScrolled
                    ? "bg-white/80 shadow-[0_1px_0_rgb(23_19_46/0.06),0_14px_30px_-16px_rgb(23_19_46/0.25)] backdrop-blur-xl"
                    : "bg-paper/90 backdrop-blur-sm",
            )}
        >
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="group flex items-center gap-2.5">
                        {/* <span className="grid size-9 place-items-center rounded-xl bg-grape text-white shadow-[0_6px_16px_-6px_rgb(91_61_245/0.7)] transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-105">
                            <Ticket className="size-5" />
                        </span> */}
                        <Image src={LOGO} height={200} width={200} alt="" />
                    </Link>

                    <form onSubmit={handleSearch} className="mx-8 hidden max-w-md flex-1 items-center md:flex">
                        <div className="relative w-full">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <Search className="h-4 w-4 text-ink/40" />
                            </div>
                            <Input
                                type="search"
                                placeholder="Search for stores or coupons..."
                                className="h-10 w-full rounded-full border-ink/10 bg-white! text-black pl-10 shadow-none transition-all duration-300 focus-visible:border-grape focus-visible:ring-grape/25"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="ml-2 h-10 rounded-full bg-ink px-5 hover:cursor-pointer hover:bg-grape text-white">
                            Search
                        </Button>
                    </form>

                    <nav className="hidden items-center gap-1 md:flex">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "group relative px-3 py-2 text-sm font-medium transition-colors",
                                    isActive(link.href) ? "text-grape" : "text-ink/70 hover:text-ink",
                                )}
                            >
                                {link.label}
                                <span
                                    className={cn(
                                        "absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-grape transition-transform duration-300",
                                        isActive(link.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                                    )}
                                />
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="grid size-10 place-items-center rounded-full text-ink transition-colors hover:bg-mist"
                            aria-label="Toggle menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSearch} className="flex items-center pb-3 md:hidden">
                    <div className="relative w-full">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <Search className="h-4 w-4 text-ink/40" />
                        </div>
                        <Input
                            type="search"
                            placeholder="Search for stores or coupons..."
                            aria-label="Search for stores or coupons"
                            className="h-10 w-full rounded-full border-ink/10 bg-white pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="ml-2 h-10 rounded-full bg-ink px-5 hover:bg-grape text-white">
                        Search
                    </Button>
                </form>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="anim-menu py-4 md:hidden">
                        <div className="flex flex-col gap-1">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "rounded-xl px-4 py-3 font-medium transition-colors",
                                        isActive(link.href) ? "bg-grape/10 text-grape" : "text-ink/80 hover:bg-mist",
                                    )}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
