"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LoaderCircle, Trash } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

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
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        if (deleting) return
        setDeleting(true)
        try {
            const { success } = await deleteAction(itemId)
            if (!success) throw new Error(`Failed to delete ${itemName}.`)
            router.refresh()
            toast.success(`${itemName[0].toUpperCase()}${itemName.slice(1)} deleted.`)
        } catch (error) {
            console.error(`Error deleting ${itemName}:`, error)
            toast.error(error instanceof Error ? error.message : `Failed to delete ${itemName}.`)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            aria-label={deleting ? `Deleting ${itemName}` : `Delete ${itemName}`}
            className="text-red-500 hover:text-red-400 border-dark-600 hover:bg-dark-700 cursor-pointer"
        >
            {deleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
        </Button>
    )
}
