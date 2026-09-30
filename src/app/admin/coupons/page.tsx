import Link from "next/link"
import { getAllCoupons } from "@/lib/data"
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


export const revalidate = 30   // seconds
export default async function AdminCouponsPage() {
    const allCoupons = await getAllCoupons()
    // only show type==="code"
    const coupons = allCoupons.filter((c) => c.type === "code")

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

            <div className="bg-white rounded-lg shadow-card overflow-hidden border border-dark-700">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Store</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Expiry Date</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {coupons.map((coupon) => (
                            <TableRow
                                key={coupon.id}
                                className="hover:bg-dark-700 transition-colors"
                            >
                                <TableCell className="font-medium text-gray-900 ">
                                    {coupon.title}
                                </TableCell>
                                <TableCell className="text-gray-900 ">
                                    {coupon.store?.name}
                                </TableCell>
                                <TableCell className="text-gray-900 ">
                                    {coupon.code || "-"}
                                </TableCell>
                                <TableCell className="text-gray-900 ">
                                    {new Date(coupon.expiryDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-gray-900 ">
                                    {coupon.usedCount}
                                </TableCell>
                                <TableCell className="text-right">
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
