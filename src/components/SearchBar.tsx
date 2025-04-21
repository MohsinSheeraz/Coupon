"use client"

import { useState, type FormEvent } from "react"
import { Search } from "lucide-react"

interface SearchBarProps {
    placeholder?: string
    onSearch?: (query: string) => void
    className?: string
}

export default function SearchBar({ placeholder = "Search...", onSearch, className = "" }: SearchBarProps) {
    const [query, setQuery] = useState("")

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (onSearch) {
            onSearch(query)
        }
    }

    return (
        <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2 pr-10 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400 transition-all"
                aria-label="Search"
            />
            <button
                type="submit"
                className="absolute right-3 text-gray-400 hover:text-teal-600 transition-colors"
                aria-label="Submit search"
            >
                <Search size={18} />
            </button>
        </form>
    )
}
