import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function Toast() {
    const { props } = usePage();
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const message = props.flash?.success || props.flash?.error;
        if (!message) return;

        setToast({
            message,
            type: props.flash?.error ? 'error' : 'success',
        });

        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }, [props.flash]);

    if (!toast) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50 animate-fade-in-up">
            <div className={`px-6 py-3 rounded-2xl shadow-xl text-white font-semibold text-sm flex items-center gap-2 ${
                toast.type === 'error' ? 'bg-tertiary' : 'bg-primary'
            }`}>
                {toast.type === 'error' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )}
                <span>{toast.message}</span>
            </div>
        </div>
    );
}
