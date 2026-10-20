import Link from "next/link"
import { CATEGORY_TILES, FALLBACK_GRADIENT, withFallback } from "@/lib/images"
import { categoryKey } from "@/lib/categories"

type Tile = { label: string; image?: string }

function CategoryCards({ tiles, hidden = false }: { tiles: Tile[]; hidden?: boolean }) {
  return tiles.map((tile, index) => (
    <Link
      key={tile.label}
      href={`/stores?category=${encodeURIComponent(tile.label)}`}
      tabIndex={hidden ? -1 : undefined}
      className="category-tile"
    >
      <div
        aria-hidden="true"
        className="category-image"
        style={{ backgroundImage: tile.image ? withFallback(tile.image) : FALLBACK_GRADIENT }}
      />
      <div className="category-shade" />
      <span className="category-number">
        {String(index + 1).padStart(2, "0")} / {String(tiles.length).padStart(2, "0")}
      </span>
      <span className="category-label">
        <span>{tile.label}</span>
      </span>
    </Link>
  ))
}


export default function CategorySlider({ categories }: { categories: string[] }) {
  const labels = categories.length
    ? categories
    : CATEGORY_TILES.map((tile) => tile.label)
  const tiles: Tile[] = labels.map((label) => ({
    label,
    image: CATEGORY_TILES.find((t) => categoryKey(t.label) === categoryKey(label))?.image,
  }))

  return (
    <div className="category-slider">
      <div className="category-track">
        <div className="category-group">
          <CategoryCards tiles={tiles} />
        </div>
        <div className="category-group" aria-hidden="true">
          <CategoryCards tiles={tiles} hidden />
        </div>
      </div>
    </div>
  )
}