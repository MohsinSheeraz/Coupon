"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { LoaderCircle } from "lucide-react"

type NavigationStartEvent = CustomEvent<{ href: string }>

export function NavigationFeedback() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const locationKey = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
    const [navigating, setNavigating] = useState(false)
    const sourceRef = useRef<string | null>(null)
    const timeoutRef = useRef<number | null>(null)

    useEffect(() => {
        const clearNavigation = () => {
            sourceRef.current = null
            if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
            timeoutRef.current = null
            setNavigating(false)
        }

        if (sourceRef.current && sourceRef.current !== locationKey) clearNavigation()

        const startNavigation = (href: string) => {
            const destination = new URL(href, window.location.href)
            if (destination.origin !== window.location.origin) return

            const destinationKey = `${destination.pathname}${destination.search}`
            if (destinationKey === locationKey) return

            sourceRef.current = locationKey
            setNavigating(true)
            if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
            timeoutRef.current = window.setTimeout(clearNavigation, 15_000)
        }

        const handleClick = (event: MouseEvent) => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
            const target = event.target
            if (!(target instanceof Element)) return

            const anchor = target.closest("a")
            if (!anchor || anchor.hasAttribute("download")) return
            if (anchor.target && anchor.target !== "_self") return
            startNavigation(anchor.href)
        }

        const handleNavigationStart = (event: Event) => {
            const { href } = (event as NavigationStartEvent).detail
            startNavigation(href)
        }

        document.addEventListener("click", handleClick, true)
        window.addEventListener("app:navigation-start", handleNavigationStart)

        return () => {
            document.removeEventListener("click", handleClick, true)
            window.removeEventListener("app:navigation-start", handleNavigationStart)
            if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
        }
    }, [locationKey])

    if (!navigating) return null

    return (
        <>
            <div className="navigation-progress" role="progressbar" aria-label="Loading page">
                <span />
            </div>
            <div className="navigation-feedback" role="status" aria-live="polite">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span>Visiting page...</span>
            </div>
        </>
    )
}
