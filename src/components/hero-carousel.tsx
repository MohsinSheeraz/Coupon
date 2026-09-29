"use client"
import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { HERO_IMAGES, withFallback } from "@/lib/images"

type CarouselSlide = {
    title: string
    description: string
    primaryCta: {
        text: string
        href: string
    }
    image: string
    fallback: string
}

const SLIDE_MS = 5000

const slides: CarouselSlide[] = [
    {
        title: "Save money with the best coupons and deals",
        description: "Discover thousands of promo codes and discounts from your favorite stores",
        primaryCta: {
            text: "Browse Coupons",
            href: "/coupons",
        },
        image: HERO_IMAGES[0],
        fallback: "linear-gradient(135deg, #5b3df5 0%, #17132e 100%)",
    },
    {
        title: "Exclusive savings for every occasion",
        description: "Find amazing deals on your favorite products all year round",
        primaryCta: {
            text: "Browse Deals",
            href: "/deals",
        },
        image: HERO_IMAGES[1],
        fallback: "linear-gradient(135deg, #c2255c 0%, #17132e 100%)",
    },
    {
        title: "Explore the best stores for your needs",
        description: "Shop at the top stores for a wide range of products at great prices",
        primaryCta: {
            text: "Explore Stores",
            href: "/stores",
        },
        image: HERO_IMAGES[2],
        fallback: "linear-gradient(135deg, #1c7ed6 0%, #17132e 100%)",
    },
]

export default function HeroCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [autoplay, setAutoplay] = useState(true)
    const [reducedMotion, setReducedMotion] = useState(false)

    useEffect(() => {
        setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    }, [])

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, [])

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
    }, [])

    const goToSlide = useCallback((index: number) => {
        setCurrentSlide(index)
    }, [])

    const running = autoplay && !reducedMotion

    useEffect(() => {
        let interval: NodeJS.Timeout

        if (running) {
            interval = setInterval(() => {
                nextSlide()
            }, SLIDE_MS)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [running, nextSlide])

    const handleMouseEnter = () => setAutoplay(false)
    const handleMouseLeave = () => setAutoplay(true)

    return (
        <section
            className="relative isolate overflow-hidden bg-ink"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-roledescription="carousel"
            aria-label="Featured offers"
        >
            <div className="relative h-[540px] w-full md:h-[640px]">
                {slides.map((slide, index) => {
                    const active = index === currentSlide
                    const Title = (index === 0 ? "h1" : "h2") as "h1"
                    return (
                        <div
                            key={index}
                            role="group"
                            aria-roledescription="slide"
                            aria-hidden={!active}
                            className={cn(
                                "absolute inset-0 transition-opacity duration-[900ms] ease-out",
                                active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
                            )}
                        >
                            {/* photo, with a slow settle-in zoom on the active slide */}
                            <div
                                className={cn("absolute inset-0 bg-cover bg-center", active && "hero-zoom")}
                                style={{ backgroundImage: withFallback(slide.image, slide.fallback) }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/55 to-ink/5" />
                            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/60 to-transparent" />

                            <div className="container relative mx-auto flex h-full items-center px-4">
                                <div className="max-w-2xl pb-16">
                                    <Title
                                        className={cn(
                                            "font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl",
                                            active && "anim-rise",
                                        )}
                                    >
                                        {slide.title}
                                    </Title>
                                    <p
                                        className={cn(
                                            "mt-5 max-w-xl text-lg text-white/80 md:text-xl",
                                            active && "anim-rise",
                                        )}
                                        style={{ "--d": "140ms" } as React.CSSProperties}
                                    >
                                        {slide.description}
                                    </p>
                                    <div
                                        className={cn("mt-8", active && "anim-rise")}
                                        style={{ "--d": "280ms" } as React.CSSProperties}
                                    >
                                        <Button
                                            asChild
                                            size="lg"
                                            className="h-12 rounded-full bg-citrus px-8 text-base font-semibold text-ink shadow-[0_10px_30px_-10px_rgb(255_210_63/0.8)] hover:bg-white"
                                        >
                                            <Link href={slide.primaryCta.href} tabIndex={active ? 0 : -1}>
                                                {slide.primaryCta.text}
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Controls */}
            <div className="absolute inset-x-0 bottom-8 z-20">
                <div className="container mx-auto flex items-center justify-between px-4">
                    <div className="flex items-center gap-1">
                        {slides.map((_, index) => {
                            const active = currentSlide === index
                            return (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className="group flex h-8 cursor-pointer items-center px-1"
                                    aria-label={`Go to slide ${index + 1}`}
                                    aria-current={active}
                                >
                                    <span
                                        className={cn(
                                            "relative block h-1 overflow-hidden rounded-full bg-white/30 transition-all duration-500 group-hover:bg-white/50",
                                            active ? "w-14" : "w-8",
                                        )}
                                    >
                                        {active && (
                                            <span
                                                key={currentSlide}
                                                className={cn(
                                                    "absolute inset-0 origin-left rounded-full bg-citrus",
                                                    running && "hero-bar",
                                                )}
                                            />
                                        )}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={prevSlide}
                            className="grid size-11 cursor-pointer place-items-center rounded-full bg-white/15 text-white backdrop-blur-md transition-all hover:bg-white hover:text-ink active:scale-95"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="grid size-11 cursor-pointer place-items-center rounded-full bg-white/15 text-white backdrop-blur-md transition-all hover:bg-white hover:text-ink active:scale-95"
                            aria-label="Next slide"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
