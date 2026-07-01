import { useForm, usePage, Link } from '@inertiajs/react';

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
                </div>
            </div>
        </div>
    );
}
