export const normalizeCategory = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, "")
export const categoryKey = (v: string) => normalizeCategory(v).replace(/s$/, "")

export const categoriesMatch = (a: string, b: string) => {
  const k = categoryKey(a)
  return k !== "" && k === categoryKey(b)
}

export function withPendingCategory(categories: string[], pending: string) {
  const value = pending.trim()
  if (!value || categories.some((c) => categoriesMatch(c, value))) return categories
  return [...categories, value]
}

export function cleanCategories(list: unknown): string[] {
  if (!Array.isArray(list)) return []
  return list.reduce<string[]>(
    (acc, i) => (typeof i === "string" ? withPendingCategory(acc, i) : acc),
    [],
  )
}