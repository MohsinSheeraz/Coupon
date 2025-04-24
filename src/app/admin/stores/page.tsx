import Link from "next/link"
import { getAllStores } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash, ExternalLink } from "lucide-react"

export default async function AdminStoresPage() {
    const stores = await getAllStores()

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Stores</h1>
                <Link href="/admin/stores/new">
                    <Button className="bg-teal-600 hover:bg-teal-700">
                        <Plus className="h-4 w-4 mr-2" /> Add Store
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Store</TableHead>
                            <TableHead>Website</TableHead>
                            <TableHead>Categories</TableHead>
                            <TableHead>Coupons</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stores.map((store) => (
                            <TableRow key={store.id}>
                                <TableCell>
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                            <img src={store.logo || "/placeholder.svg"} alt={store.name} className="h-6 w-6 object-contain" />
                                        </div>
                                        <span className="font-medium">{store.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <a
                                        href={store.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-teal-600 hover:text-teal-700"
                                    >
                                        {store.website.replace(/^https?:\/\//, "")}
                                        <ExternalLink className="ml-1 h-3 w-3" />
                                    </a>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {store.categories.slice(0, 2).map((category, index) => (
                                            <span key={index} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                                                {category}
                                            </span>
                                        ))}
                                        {store.categories.length > 2 && (
                                            <span className="text-xs text-gray-500">+{store.categories.length - 2} more</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>{store.couponCount}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                                            <Trash className="h-4 w-4" />
                                        </Button>
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
