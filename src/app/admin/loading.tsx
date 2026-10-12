export default function AdminLoading() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="h-9 w-56 rounded-md bg-gray-200" />
            <div className="rounded-lg border bg-white p-4 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-10 rounded-md bg-gray-100" />
                ))}
            </div>
        </div>
    )
}