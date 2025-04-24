import Link from "next/link"
import { getAllCoupons } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash } from "lucide-react"

export default async function AdminCouponsPage() {
    const coupons = await getAllCoupons()

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Coupons</h1>
                <Link href="/admin/coupons/new">
                    <Button className="bg-teal-600 hover:bg-teal-700">
                        <Plus className="h-4 w-4 mr-2" /> Add Coupon
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Store</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Expiry Date</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {coupons.map((coupon) => (
                            <TableRow key={coupon.id}>
                                <TableCell className="font-medium">{coupon.title}</TableCell>
                                <TableCell>{coupon.store?.name}</TableCell>
                                <TableCell>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${coupon.type === "code" ? "bg-teal-100 text-teal-800" : "bg-purple-100 text-purple-800"
                                            }`}
                                    >
                                        {coupon.type === "code" ? "Code" : "Deal"}
                                    </span>
                                </TableCell>
                                <TableCell>{coupon.code || "-"}</TableCell>
                                <TableCell>{new Date(coupon.expiryDate).toLocaleDateString()}</TableCell>
                                <TableCell>{coupon.usedCount}</TableCell>
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
