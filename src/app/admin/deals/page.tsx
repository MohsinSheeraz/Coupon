import Link from "next/link"
import { getDealsPage } from "@/lib/data"
import { deleteDeal } from "@/lib/action"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, ExternalLink } from "lucide-react"
import { DeleteItemButton } from "@/components/DeleteButton"
import { ExpandableText } from "@/components/admin/expandable-text"

export const dynamic = "force-dynamic"
export default async function AdminDealsPage({searchParams}: { searchParams: Promise<{ page?: string }> }) {
    const page = Math.max(1, Number((await searchParams).page) || 1)
    const { deals, pages } = await getDealsPage(page)

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

            <div className="admin-table-panel bg-white rounded-lg shadow-card border border-dark-700">
                <Table containerClassName="admin-table-viewport" className="min-w-[800px] table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[28%] admin-table-title">Title</TableHead>
                            <TableHead className="w-[14%]">Store</TableHead>
                            <TableHead className="w-[23%]">Affiliate Link</TableHead>
                            <TableHead className="w-[15%]">Expiry Date</TableHead>
                            <TableHead className="w-[8%]">Usage</TableHead>
                            <TableHead className="w-[12%] text-right admin-table-actions">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {deals.map((deal) => (
                            <TableRow key={deal.id} className="hover:bg-dark-700 transition-colors">
                                <TableCell className="admin-table-title font-medium text-gray-600">
                                    <ExpandableText text={deal.title} maxLength={32} />
                                </TableCell>
                                <TableCell className="text-gray-600">
                                    {deal.store?.name && <ExpandableText text={deal.store.name} maxLength={20} />}
                                </TableCell>
                                <TableCell>
                                    <a
                                        href={deal.affiliateLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex max-w-full items-center overflow-hidden text-teal-400 hover:text-teal-500"
                                        title={deal.affiliateLink}
                                    >
                                        <span className="truncate">{(deal.affiliateLink ?? '').substring(0, 30)}...</span>
                                        <ExternalLink className="ml-1 h-3 w-3 shrink-0" />
                                    </a>
                                    <ExpandableText
                                        text={deal.affiliateLink ?? ""}
                                        maxLength={30}
                                        showPreview={false}
                                        triggerLabel="View full link"
                                    />
                                </TableCell>
                                <TableCell className="text-gray-600 ">{new Date(deal.expiryDate).toLocaleDateString()}</TableCell>
                                <TableCell className="text-gray-600 ">{deal.usedCount}</TableCell>
                                <TableCell className="admin-table-actions text-right">
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
            <div className="flex justify-center items-center gap-4 mt-6">
    {page > 1 && (
        <Link href={`/admin/deals?page=${page - 1}`}>
            <Button variant="outline" size="sm">Previous</Button>
        </Link>
    )}
    <span className="text-sm text-gray-600">Page {page} of {pages || 1}</span>
    {page < pages && (
        <Link href={`/admin/deals?page=${page + 1}`}>
            <Button variant="outline" size="sm">Next</Button>
        </Link>
    )}
</div>
        </div>
    )
}
