'use client';
import useSWR from 'swr';
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AdminStores() {
    const { data: stores, mutate, isLoading } = useSWR('/api/stores', fetcher);
    const [form, setForm] = useState({
        name: '',
        slug: '',
        logoUrl: '',
        domain: '',
        description: '',
    });
    const [saved, setSaved] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        await fetch('/api/stores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        setForm({ name: '', slug: '', logoUrl: '', domain: '', description: '' });
        setSaved(true);
        mutate();
        setTimeout(() => setSaved(false), 1800);
    }

    return (
        <section className="space-y-10">
            <h1 className="text-3xl font-bold">Stores</h1>

            {/* form */}
            <form
                onSubmit={onSubmit}
                className="bg-white rounded-xl shadow-md p-8 grid gap-6 md:grid-cols-2"
            >
                {(Object.keys(form) as (keyof typeof form)[]).map(key => (
                    <div key={key} className="space-y-1">
                        <label className="font-medium capitalize">{key}</label>
                        <input
                            required={key !== 'domain' && key !== 'description'}
                            value={form[key]}
                            onChange={e => setForm({ ...form, [key]: e.target.value })}
                            className="w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                        />
                    </div>
                ))}

                <button className="btn md:col-span-2">
                    {saved ? (
                        <>
                            <CheckCircle2 size={18} /> Saved
                        </>
                    ) : (
                        'Add Store'
                    )}
                </button>
            </form>

            {/* list */}
            <div className="bg-white rounded-xl shadow-md overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="p-3 text-left">Logo</th>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Slug</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && (
                            <tr>
                                <td colSpan={3} className="p-4 text-center">
                                    Loading…
                                </td>
                            </tr>
                        )}
                        {stores?.map((s: any) => (
                            <tr key={s._id} className="border-t hover:bg-gray-50">
                                <td className="p-3">
                                    <img src={s.logoUrl} alt="" className="h-6" />
                                </td>
                                <td className="p-3">{s.name}</td>
                                <td className="p-3">{s.slug}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
