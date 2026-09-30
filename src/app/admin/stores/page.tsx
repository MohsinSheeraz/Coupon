import Link from "next/link"
import { getAllStores } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, ExternalLink } from "lucide-react"
import { deleteStore } from "@/lib/action"
import { DeleteItemButton } from "@/components/DeleteButton"


export const revalidate = 30   // seconds
export default async function AdminStoresPage() {
    const stores = await getAllStores()

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold gradient-text">Stores</h1>
                <Link href="/admin/stores/new">
                    <Button className="bg-teal-500 hover:bg-teal-600 cursor-pointer">
                        <Plus className="h-4 w-4 mr-2" /> Add Store
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-card overflow-hidden border border-dark-700">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Store</TableHead>
                            <TableHead>Store URL</TableHead>
                            <TableHead>Categories</TableHead>
                            <TableHead>Coupons</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stores.map((store) => (
                            <TableRow key={store.id} className="hover:bg-dark-700 transition-colors">
                                <TableCell>
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-dark-700 flex items-center justify-center mr-3 border border-dark-600">
                                            <img src={store.logo || "/placeholder.svg"} alt={store.name} className="h-6 w-6 object-contain" />
                                        </div>
                                        <span className="font-medium text-gray-800 ">{store.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <a
                                        href={`/stores/${store.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-teal-400 hover:text-teal-500"
                                    >
                                        {store.slug.replace(/^https?:\/\//, "")}
                                        <ExternalLink className="ml-1 h-3 w-3" />
                                    </a>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {store.categories.slice(0, 2).map((category, index) => (
                                            <span
                                                key={index}
                                                className="bg-dark-700 text-teal-400 px-2 py-0.5 rounded-full text-xs border border-dark-600"
                                            >
                                                {category}
                                            </span>
                                        ))}
                                        {store.categories.length > 2 && (
                                            <span className="text-xs text-gray-500 ">+{store.categories.length - 2} more</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-800 ">{store.couponCount}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/admin/stores/edit/${store.id}`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-dark-600 hover:bg-dark-700 hover:text-teal-400 cursor-pointer"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <DeleteItemButton
                                            itemId={store.id!}
                                            deleteAction={deleteStore}
                                            itemName="store"
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
