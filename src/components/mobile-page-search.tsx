"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function MobilePageSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="mb-6 flex items-center md:hidden">
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
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>
      <Button type="submit" className="ml-2 h-10 rounded-full bg-ink px-5 text-white hover:bg-grape">
        Search
      </Button>
    </form>
  )
}
