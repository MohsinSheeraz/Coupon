"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { toast } from "sonner"

interface DeleteItemButtonProps {
    itemId: string
    deleteAction: (id: string) => Promise<{ success: boolean }>
    itemName: string           // "coupon" | "store" | "deal"
}

export function DeleteItemButton({
    itemId,
    deleteAction,
    itemName,
}: DeleteItemButtonProps) {
    const router = useRouter()

    const handleDelete = async () => {
        const { success } = await deleteAction(itemId)
        if (success) {
            router.refresh()
            toast.success(`${itemName[0].toUpperCase()}${itemName.slice(1)} deleted.`)
        } else {
            toast.error(`Failed to delete ${itemName}.`)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-400 border-dark-600 hover:bg-dark-700 cursor-pointer"
        >
            <Trash className="h-4 w-4" />
        </Button>
    )
}
