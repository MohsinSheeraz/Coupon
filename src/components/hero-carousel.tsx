"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { HERO_IMAGES, withFallback } from "@/lib/images"
import { cn } from "@/lib/utils"

const slides = [
  { eyebrow: "THE GOOD STUFF, FOR LESS", title: "A better way to find your next great deal.", description: "Fresh finds, verified codes, and the stores you love. Your next little win starts here.", cta: "Explore coupons", href: "/coupons", image: HERO_IMAGES[0] },
  { eyebrow: "MORE STYLE. LESS SPEND.", title: "The things you love. At prices you’ll love more.", description: "Make room for the good stuff with offers worth opening.", cta: "Shop the deals", href: "/deals", image: HERO_IMAGES[1] },
  { eyebrow: "YOUR FAVORITES, ALL HERE", title: "Good stores. Great finds. Better prices.", description: "Browse the brands on your list and discover a few new favorites along the way.", cta: "Discover stores", href: "/stores", image: HERO_IMAGES[2] },
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const go = useCallback((direction: number) => setCurrent((value) => (value + direction + slides.length) % slides.length), [])

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    if (paused || reducedMotion) return
    const timer = window.setInterval(() => go(1), 6500)
    return () => window.clearInterval(timer)
  }, [paused, reducedMotion, go])

  return <section className="hero-stage" aria-label="Featured offers" aria-roledescription="carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false) }}>
    <div className="hero-stage-inner">
      {slides.map((slide, index) => {
        const active = current === index
        return <div key={slide.eyebrow} className={cn("hero-slide", active && "is-active")} aria-hidden={!active} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`}>
          <div className="hero-photo" style={{ backgroundImage: withFallback(slide.image, "linear-gradient(135deg,#7b776d,#282b25)") }} />
          <div className="hero-photo-shade" />
          <div className="hero-copy">
            <span className="eyebrow"><Sparkles size={15} /> {slide.eyebrow}</span>
            {index === 0 ? <h1>{slide.title}</h1> : <h2>{slide.title}</h2>}
            <p>{slide.description}</p>
            <Link href={slide.href} className="button-lime" tabIndex={active ? 0 : -1}>{slide.cta}<ArrowUpRight size={18} /></Link>
          </div>
        </div>
      })}
      <div className="hero-bottom"><div className="hero-count"><span>0{current + 1}</span><i />0{slides.length}</div><div className="hero-dots" aria-label="Choose a featured offer">{slides.map((slide, index) => <button key={slide.eyebrow} aria-label={`Show slide ${index + 1}`} aria-current={index === current ? "true" : undefined} onClick={() => setCurrent(index)} className={cn(index === current && "active")} />)}</div><div className="hero-arrows"><button onClick={() => go(-1)} aria-label="Previous slide"><ChevronLeft size={19} /></button><button onClick={() => go(1)} aria-label="Next slide"><ChevronRight size={19} /></button></div></div>
    </div>
  </section>
}
