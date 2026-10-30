import Link from "next/link"
import { getAllStores } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, ExternalLink } from "lucide-react"
import { deleteStore } from "@/lib/action"
import { DeleteItemButton } from "@/components/DeleteButton"
import { ExpandableText } from "@/components/admin/expandable-text"


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

            <div className="admin-table-panel bg-white rounded-lg shadow-card border border-dark-700">
                <Table containerClassName="admin-table-viewport" className="min-w-[760px] table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[23%] admin-table-title">Store</TableHead>
                            <TableHead className="w-[23%]">Store URL</TableHead>
                            <TableHead className="w-[22%]">Categories</TableHead>
                            <TableHead className="w-[8%]">Coupons</TableHead>
                            <TableHead className="w-[8%]">Deals</TableHead>
                            <TableHead className="w-[16%] text-right admin-table-actions">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stores.map((store) => (
                            <TableRow key={store.id} className="hover:bg-dark-700 transition-colors">
                                <TableCell className="admin-table-title">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 shrink-0 rounded-full bg-dark-700 flex items-center justify-center mr-3 border border-dark-600">
                                            <img src={store.logo || "/placeholder.svg"} alt={store.name} className="h-6 w-6 object-contain" />
                                        </div>
                                        <ExpandableText
                                            text={store.name}
                                            maxLength={20}
                                            className="min-w-0 flex-1 font-medium text-gray-800"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <a
                                        href={`/stores/${store.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex max-w-full items-center text-teal-400 hover:text-teal-500"
                                        title={store.slug.replace(/^https?:\/\//, "")}
                                    >
                                        <span className="truncate">{store.slug.replace(/^https?:\/\//, "")}</span>
                                        <ExternalLink className="ml-1 h-3 w-3 shrink-0" />
                                    </a>
                                    <ExpandableText
                                        text={store.slug.replace(/^https?:\/\//, "")}
                                        maxLength={30}
                                        showPreview={false}
                                        triggerLabel="View full URL"
                                    />
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
                                            <ExpandableText
                                                text={store.categories.join(", ")}
                                                maxLength={0}
                                                showPreview={false}
                                                triggerLabel={`View all ${store.categories.length} categories`}
                                            />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-800 ">
                                    {store.couponCount}
                                </TableCell>
                                <TableCell className="text-gray-800 ">
                                    {store.dealCount}
                                </TableCell>
                                <TableCell className="admin-table-actions text-right">
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
