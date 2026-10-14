import Link from "next/link"
import { ArrowLeft, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="not-found-shell">
      <div className="not-found-card">
        <div className="not-found-code">404</div>

        <h1>Page not found</h1>
        <p>
          The page you were looking for may have moved, been removed, or never existed.
        </p>

        <div className="not-found-actions">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#222720] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#35492b]"
          >
            <Home className="h-4 w-4" />
            Back home
          </Link>

          <Link
            href="/stores"
            className="inline-flex items-center gap-2 border border-[#526a3c]/30 bg-white px-5 py-3 text-sm font-semibold text-[#222720] hover:border-[#526a3c] hover:text-[#35492b]"
          >
            <ArrowLeft className="h-4 w-4" />
            Explore stores
          </Link>
        </div>
      </div>
    </div>
  )
}
