// All remote imagery lives here so it is easy to swap.
// Every image is painted on top of a gradient fallback (see `withFallback`),
// so a dead link never leaves an empty hole in the layout.

const unsplash = (id: string, w = 1600, q = 70) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`

export const FALLBACK_GRADIENT = "linear-gradient(135deg, #4326d4 0%, #17132e 100%)"

/** CSS `background-image` value: photo on top, gradient underneath. */
export const withFallback = (url: string, fallback = FALLBACK_GRADIENT) =>
  `url("${url}"), ${fallback}`

export const HERO_IMAGES = [
  unsplash("photo-1607082348824-0a96f2a4b9da", 1920), // shopping bags
  unsplash("photo-1483985988355-763728e1935b", 1920), // fashion shopping
  unsplash("photo-1441986300917-64674bd600d8", 1920), // storefront interior
]

export const CATEGORY_TILES = [
  {
    label: "Electronics",
    query: "Electronics",
    image: unsplash("photo-1498049794561-7780e7231661", 800),
  },
  {
    label: "Fashion",
    query: "Fashion",
    image: unsplash("photo-1441984904996-e0b6ba687e04", 800),
  },
  {
    label: "Home & Garden",
    query: "Home & Garden",
    image: unsplash("photo-1586023492125-27b2c045efd7", 800),
  },
  {
    label: "Travel",
    query: "Travel",
    image: unsplash("photo-1476514525535-07fb3b4ae5f1", 800),
  },
]

export const NEWSLETTER_IMAGE = unsplash("photo-1556742049-0cfed4f6a45d", 1920)
