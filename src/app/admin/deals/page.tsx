import Link from "next/link"
import { getAllDeals } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash, ExternalLink } from 'lucide-react'
import { deleteDeal } from "@/lib/action"

export default async function AdminDealsPage() {
    const deals = await getAllDeals()

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Deals</h1>
                <Link href="/admin/deals/new">
                    <Button className="bg-teal-600 hover:bg-teal-700">
                        <Plus className="h-4 w-4 mr-2" /> Add Deal
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
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
                            <TableRow key={deal.id}>
                                <TableCell className="font-medium">{deal.title}</TableCell>
                                <TableCell>{deal.store?.name}</TableCell>
                                <TableCell>
                                    <a
                                        href={deal.affiliateLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-teal-600 hover:text-teal-700"
                                    >
                                        {(deal.affiliateLink ?? '').substring(0, 30)}...
                                        <ExternalLink className="ml-1 h-3 w-3" />
                                    </a>
                                </TableCell>
                                <TableCell>
                                    {deal.expiryDate
                                        ? new Date(deal.expiryDate).toLocaleDateString()
                                        : "—"}
                                </TableCell>
                                <TableCell>{deal.usedCount}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/admin/deals/edit/${deal.id}`}>
                                            <Button variant="outline" size="sm">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <form action={async () => {
                                            'use server'
                                            await deleteDeal(deal.id!)
                                        }}>
                                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700" type="submit">
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </form>
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
