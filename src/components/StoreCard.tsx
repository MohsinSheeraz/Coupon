import Link from 'next/link';

interface Store {
    _id: string;
    name: string;
    slug: string;
    logoUrl: string;
}

export default function StoreCard({ store }: { store: Store }) {
    return (
        <Link
            href={`/coupons?store=${store._id}`}
            className="card items-center p-5 hover:shadow-md"
        >
            <img
                src={store.logoUrl}
                alt={store.name}
                className="object-contain"
            />
            <p className="mt-3 font-medium">{store.name}</p>
        </Link>
    );
}
