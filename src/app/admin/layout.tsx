export const metadata = { title: 'Admin | CouponHub' };

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <main className="max-w-6xl mx-auto px-4 py-10">{children}</main>
        </>
    );
}
