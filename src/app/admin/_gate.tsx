'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const PASSWORD = 'admin123';

export default function AdminGate({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [checked, setChecked] = useState(false);
    const [input, setInput] = useState('');

    // 1.  Check cookie on mount
    useEffect(() => {
        if (Cookies.get('admin') === 'yes') {
            setChecked(true);
        }
    }, []);

    // 2.  Submit handler
    function submit() {
        if (input === PASSWORD) {
            Cookies.set('admin', 'yes', { expires: 1 });
            setChecked(true);
            router.refresh(); // make sure nested SWR / queries re‑run
        } else {
            alert('Wrong password');
            setInput('');
        }
    }

    // 3.  If already allowed, render children straight away
    if (checked) return <main className="max-w-7xl mx-auto p-6">{children}</main>;

    // 4.  Otherwise show the overlay (no redirect)
    return (
        <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl p-8 w-80">
                <h2 className="text-center text-xl font-semibold mb-5">Admin Login</h2>

                <input
                    type="password"
                    placeholder="Enter password"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    className="w-full mb-4 rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                />

                <button onClick={submit} className="btn w-full">
                    Continue
                </button>
            </div>
        </div>
    );
}
