"use client"

import { useEffect, useState } from "react"
import { Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ActiveUsersMetric({ initialCount }: { initialCount: number }) {
    const [count, setCount] = useState(initialCount)

    useEffect(() => {
        let cancelled = false
        const refreshCount = async () => {
            try {
                const response = await fetch("/api/admin/presence", { cache: "no-store" })
                if (!response.ok) throw new Error(`Active users request failed (${response.status})`)
                const result: { count: number } = await response.json()
                if (!cancelled) setCount(result.count)
            } catch (error) {
                console.error("Could not refresh active user count:", error)
            }
        }

        const interval = window.setInterval(refreshCount, 30_000)
        return () => {
            cancelled = true
            window.clearInterval(interval)
        }
    }, [])

    return (
        <Card className="admin-metric-card admin-metric-card--rose">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Active Users</CardTitle>
                <span className="admin-metric-icon">
                    <Users className="h-5 w-5" />
                </span>
            </CardHeader>
            <CardContent>
                <div className="admin-metric-value">{count}</div>
                <p className="admin-metric-caption">Active in the last 3 minutes</p>
            </CardContent>
        </Card>
    )
}
