import Link from "next/link"
import { getOffersByType } from "@/lib/data"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Plus, Edit } from "lucide-react"
import { deleteCoupon } from "@/lib/action"
import { DeleteItemButton } from "@/components/DeleteButton"
import { ExpandableText } from "@/components/admin/expandable-text"


export const revalidate = 30   // seconds
export default async function AdminCouponsPage() {
    const coupons = await getOffersByType("code")

    return (
        <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold gradient-text">Coupons</h1>
                <Link href="/admin/coupons/new">
                    <Button className="bg-teal-500 hover:bg-teal-600 cursor-pointer">
                        <Plus className="h-4 w-4 mr-2" /> Add Coupon
                    </Button>
                </Link>
            </div>

            <div className="admin-table-panel bg-white rounded-lg shadow-card border border-dark-700">
                <Table containerClassName="admin-table-viewport" className="min-w-[760px] table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[30%] admin-table-title">Title</TableHead>
                            <TableHead className="w-[16%]">Store</TableHead>
                            <TableHead className="w-[15%]">Code</TableHead>
                            <TableHead className="w-[15%]">Expiry Date</TableHead>
                            <TableHead className="w-[9%]">Usage</TableHead>
                            <TableHead className="w-[15%] text-right admin-table-actions">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {coupons.map((coupon) => (
                            <TableRow
                                key={coupon.id}
                                className="hover:bg-dark-700 transition-colors"
                            >
                                <TableCell className="admin-table-title font-medium text-gray-900">
                                    <ExpandableText text={coupon.title} maxLength={32} />
                                </TableCell>
                                <TableCell className="text-gray-900">
                                    {coupon.store?.name && <ExpandableText text={coupon.store.name} maxLength={20} />}
                                </TableCell>
                                <TableCell className="text-gray-900">
                                    {coupon.code ? <ExpandableText text={coupon.code} maxLength={16} /> : "-"}
                                </TableCell>
                                <TableCell className="text-gray-900 ">
                                    {new Date(coupon.expiryDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-gray-900 ">
                                    {coupon.usedCount}
                                </TableCell>
                                <TableCell className="admin-table-actions text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/admin/coupons/edit/${coupon.id}`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-dark-600 hover:bg-dark-700 hover:text-teal-400 cursor-pointer"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <DeleteItemButton itemId={coupon.id!}
                                            deleteAction={deleteCoupon}
                                            itemName="coupon" />
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
