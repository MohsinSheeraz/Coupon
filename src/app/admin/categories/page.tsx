import { getAllStores, getManagedCategories, syncLegacyCategories } from "@/lib/data"
import CategoryManager from "./CategoryManager"

export default async function AdminCategoriesPage() {
    await syncLegacyCategories()
    const [categories, stores] = await Promise.all([getManagedCategories(true), getAllStores()])
    const storeOptions = stores.flatMap((store) => store.id
        ? [{ id: store.id, name: store.name, categories: store.categories ?? [] }]
        : [])
    return <CategoryManager initialCategories={categories} initialStores={storeOptions} />
}