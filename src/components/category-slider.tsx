import { CATEGORY_TILES, withFallback } from "@/lib/images"

function CategoryCards() {
  return CATEGORY_TILES.map((tile, index) => (
    <div key={tile.label} className="category-tile">
      <div
        aria-hidden="true"
        className="category-image"
        style={{ backgroundImage: withFallback(tile.image) }}
      />
      <div className="category-shade" />
      <span className="category-number">
        {String(index + 1).padStart(2, "0")} / {String(CATEGORY_TILES.length).padStart(2, "0")}
      </span>
      <span className="category-label">
        <span>{tile.label}</span>
      </span>
    </div>
  ))
}

export default function CategorySlider() {
  return (
    <div className="category-slider">
      <div className="category-track">
        <div className="category-group">
          <CategoryCards />
        </div>
        <div className="category-group" aria-hidden="true">
          <CategoryCards />
        </div>
      </div>
    </div>
  )
}
