"use client"

import { useEffect } from "react"

export function PublicPresenceTracker() {
    useEffect(() => {
        const heartbeat = async () => {
            if (document.visibilityState !== "visible") return
            try {
                const response = await fetch("/api/presence", {
                    method: "POST",
                    cache: "no-store",
                })
                if (!response.ok) throw new Error(`Presence request failed (${response.status})`)
            } catch (error) {
                console.error("Could not update visitor presence:", error)
            }
        }

        void heartbeat()
        const interval = window.setInterval(heartbeat, 60_000)
        document.addEventListener("visibilitychange", heartbeat)
        return () => {
            window.clearInterval(interval)
            document.removeEventListener("visibilitychange", heartbeat)
        }
    }, [])

    return null
}
