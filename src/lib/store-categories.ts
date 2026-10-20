import clientPromise from "./mongodb"
import { categoryKey } from "./categories"

export async function getStoreCategories(): Promise<string[]> {
  const client = await clientPromise
  const docs = await client
    .db("DealzyCoup")
    .collection("stores")
    .find({}, { projection: { categories: 1 } })
    .toArray()

  const byKey = new Map<string, { label: string; stores: number }>()
  for (const doc of docs) {
    if (!Array.isArray(doc.categories)) continue
    const seen = new Set<string>()
    for (const item of doc.categories) {
      if (typeof item !== "string") continue
      const label = item.trim()
      const key = categoryKey(label)
      if (!key || seen.has(key)) continue
      seen.add(key)
      const entry = byKey.get(key)
      if (entry) entry.stores += 1
      else byKey.set(key, { label, stores: 1 })
    }
  }
  return Array.from(byKey.values())
    .sort((a, b) => b.stores - a.stores || a.label.localeCompare(b.label))
    .map((e) => e.label)
}