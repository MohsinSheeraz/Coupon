import Link from 'next/link'
import React from 'react'
import { Ticket } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { CATEGORY_TILES  } from '@/lib/images'
// import { NEWSLETTER_IMAGE } from '@/lib/images'

export default function Footer() {
    return (
        <>
            {/* Newsletter */}
            {/* <section
                className="relative isolate overflow-hidden bg-cover bg-center py-20 text-white"
                style={{
                    backgroundImage: `linear-gradient(90deg, rgb(23 19 46 / 0.94) 0%, rgb(23 19 46 / 0.6) 100%), url("${NEWSLETTER_IMAGE}"), linear-gradient(135deg, #5b3df5, #17132e)`,
                }}
            >
                <div className="container mx-auto px-4">
                    <div className="max-w-xl">
                        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
                            Get new coupons in your inbox
                        </h2>
                        <p className="mt-3 text-lg text-white/75">
                            Subscribe and we&apos;ll send you the latest coupons and deals.
                        </p>
                        <form className="mt-8 flex flex-col gap-2 sm:flex-row">
                            <Input
                                type="email"
                                placeholder="Your email address"
                                className="h-12 rounded-full border-0 !bg-white px-5 text-ink placeholder:text-ink/40"
                            />
                            <Button className="h-12 cursor-pointer rounded-full bg-citrus px-7 font-semibold text-ink hover:bg-white">
                                Subscribe
                            </Button>
                        </form>
                    </div>
                </div>
            </section> */}

            <footer className="bg-ink py-14 text-white/65">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
                        <div>
                            <Link href="/" className="group inline-flex items-center gap-2.5">
                                <span className="grid size-9 place-items-center rounded-xl bg-grape text-white transition-transform duration-300 group-hover:-rotate-12">
                                    <Ticket className="size-5" />
                                </span>
                                <span className="font-display text-xl font-semibold text-white">DealzyCoup</span>
                            </Link>
                            <p className="mt-4 max-w-xs leading-relaxed">
                                Your destination for the best deals and discounts online.
                            </p>
                        </div>
                        <div>
                            <h3 className="mb-4 font-display text-base font-semibold text-white">Quick Links</h3>
                            <ul className="space-y-2.5">
                                <li>
                                    <Link href="/coupons" className="transition-colors hover:text-citrus">
                                        Coupons
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/stores" className="transition-colors hover:text-citrus">
                                        Stores
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 font-display text-base font-semibold text-white">Categories</h3>
                            <ul className="space-y-2.5">
                                {CATEGORY_TILES.map((c) => (
                                    <li key={c.label}>
                                        <Link
                                            href={`/stores?category=${encodeURIComponent(c.query)}`}
                                            className="transition-colors hover:text-citrus"
                                        >
                                            {c.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 font-display text-base font-semibold text-white">Contact</h3>
                            <ul className="space-y-2.5">
                            <li><a href="mailto:support@dealzycoup.com">support@dealzycoup.com</a></li>
                            <li><a href="tel:+923121069685">+92 312 1069685</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 border-t border-white/10 pt-6 text-sm">
                        <p>© {new Date().getFullYear()} DealzyCoup. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </>
    )
}
