import Link from "next/link"
import { getAllDeals } from "@/lib/data"
import { deleteDeal } from "@/lib/action"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, ExternalLink } from "lucide-react"
import { DeleteItemButton } from "@/components/DeleteButton"

export const revalidate = 30   // seconds
export default async function AdminDealsPage() {
    const deals = await getAllDeals()

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold gradient-text">Deals</h1>
                <Link href="/admin/deals/new">
                    <Button className="bg-teal-500 hover:bg-teal-600 cursor-pointer">
                        <Plus className="h-4 w-4 mr-2" /> Add Deal
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-card overflow-hidden border border-dark-700">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Store</TableHead>
                            <TableHead>Affiliate Link</TableHead>
                            <TableHead>Expiry Date</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {deals.map((deal) => (
                            <TableRow key={deal.id} className="hover:bg-dark-700 transition-colors">
                                <TableCell className="font-medium text-gray-600 ">{deal.title}</TableCell>
                                <TableCell className="text-gray-600 ">{deal.store?.name}</TableCell>
                                <TableCell>
                                    <a
                                        href={deal.affiliateLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-teal-400 hover:text-teal-500"
                                    >
                                        {(deal.affiliateLink ?? '').substring(0, 30)}...
                                        <ExternalLink className="ml-1 h-3 w-3" />
                                    </a>
                                </TableCell>
                                <TableCell className="text-gray-600 ">{new Date(deal.expiryDate).toLocaleDateString()}</TableCell>
                                <TableCell className="text-gray-600 ">{deal.usedCount}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/admin/deals/edit/${deal.id}`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-dark-600 hover:bg-dark-700 hover:text-teal-400 cursor-pointer"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <DeleteItemButton
                                            itemId={deal.id!}
                                            deleteAction={deleteDeal}
                                            itemName="deal"
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
