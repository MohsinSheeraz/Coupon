'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import debounce from 'lodash.debounce';

export default function SearchBar({ placeholder }: { placeholder: string }) {
    const router = useRouter();
    const params = useSearchParams();
    const [term, setTerm] = useState(params.get('q') ?? '');

    const updateSearch = debounce((q: string) => {
        const url = q ? `/coupons?q=${encodeURIComponent(q)}` : '/coupons';
        router.push(url);
    }, 400);

    useEffect(() => {
        updateSearch(term);
        return () => updateSearch.cancel();
    }, [term]);

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
            <input
                type="search"
                placeholder={placeholder}
                value={term}
                onChange={e => setTerm(e.target.value)}
                className="w-full rounded-md border border-muted/40 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
        </div>
    );
}
