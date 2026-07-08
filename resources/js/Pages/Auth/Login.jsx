import { Head, useForm, usePage, Link } from '@inertiajs/react';

export default function Login() {
    const { errors, flash } = usePage().props;
    const { data, setData, post, processing } = useForm({
        email: '',
        password: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <div className="min-h-screen flex">
            <Head title="Masuk - Savora" />
            {/* Kolom Kiri — Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
                {/* Dekorasi lingkaran */}
                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
                <div className="absolute top-32 -right-8 w-40 h-40 rounded-full bg-white/5" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5" />

                <div className="relative">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <span className="text-white text-2xl font-bold tracking-tight">Savora</span>
                    </div>
                </div>

                <div className="relative space-y-4">
                    <h1 className="text-white text-4xl font-bold leading-tight">
                        Masak lebih mudah,<br />belanja lebih hemat.
                    </h1>
                    <p className="text-white/70 text-base leading-relaxed max-w-xs">
                        Temukan resep masakan Nusantara dan pesan bahan segar langsung dari dapur kamu.
                    </p>
                </div>

                <div />
            </div>

            {/* Kolom Kanan — Form */}
            <div className="flex-1 flex items-center justify-center bg-surface p-8">
                <div className="w-full max-w-sm space-y-8">
                    {/* Header */}
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-on-surface">Masuk ke akun</h2>
                        <p className="text-sm text-on-surface-variant">
                            Belum punya akun?{' '}
                            <Link href="/register" className="text-primary font-medium hover:underline">
                                Daftar sekarang
                            </Link>
                        </p>
                    </div>

                    {/* Flash error */}
                    {flash?.error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            {flash.error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={submit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-on-surface">
                                Email
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="email@contoh.com"
                                className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-surface-lowest text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30 transition ${
                                    errors.email ? 'border-red-400' : 'border-outline-variant focus:border-primary'
                                }`}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-on-surface">
                                Password
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 text-sm rounded-xl border border-outline-variant bg-surface-lowest text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-primary hover:bg-primary-container disabled:opacity-60 text-white font-semibold text-sm rounded-xl py-3 transition"
                        >
                            {processing ? 'Masuk...' : 'Masuk'}
                        </button>
                    </form>

                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-outline-variant" />
                        <span className="text-xs text-on-surface-variant">atau</span>
                        <div className="flex-1 h-px bg-outline-variant" />
                    </div>

                    <a
                        href="/auth/google"
                        className="w-full flex items-center justify-center gap-2 border border-outline-variant text-on-surface font-semibold text-sm rounded-xl py-3 hover:bg-surface-high transition"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82z" />
                            <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.02c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.12A12 12 0 0 0 12 24z" />
                            <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.61H1.26a12 12 0 0 0 0 10.78l4.01-3.12z" />
                            <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.61l4.01 3.12C6.22 6.88 8.87 4.77 12 4.77z" />
                        </svg>
                        Masuk dengan Google
                    </a>
                </div>
            </div>
        </div>
    );
}
