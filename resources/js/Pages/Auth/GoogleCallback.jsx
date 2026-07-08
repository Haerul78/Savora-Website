import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';

export default function GoogleCallback() {
    const [error, setError] = useState(false);

    useEffect(() => {
        const hash = window.location.hash.startsWith('#')
            ? window.location.hash.slice(1)
            : window.location.hash;
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');

        if (!accessToken) {
            setError(true);
            return;
        }

        router.post('/auth/google/session', { access_token: accessToken });
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface">
            <Head title="Menghubungkan akun Google - Savora" />
            <div className="text-center space-y-3">
                {error ? (
                    <>
                        <p className="text-sm font-semibold text-tertiary">Login dengan Google gagal.</p>
                        <a href="/login" className="text-sm text-primary hover:underline">Kembali ke halaman login</a>
                    </>
                ) : (
                    <>
                        <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-sm text-on-surface-variant">Menghubungkan akun Google...</p>
                    </>
                )}
            </div>
        </div>
    );
}
