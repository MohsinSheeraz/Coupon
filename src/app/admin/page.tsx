import Link from 'next/link';

export default function AdminHome() {
    return (
        <section className="grid gap-4">
            <h1 className="text-2xl font-semibold mb-4">Admin dashboard</h1>
            <Link href="/admin/stores" className="btn w-max">
                Manage Stores
            </Link>
            <Link href="/admin/coupons" className="btn w-max">
                Manage Coupons
            </Link>
        </section>
    );
}
