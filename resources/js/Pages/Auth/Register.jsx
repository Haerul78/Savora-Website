import { useForm, usePage, Link } from '@inertiajs/react';
import { useState } from 'react';

function PasswordStrength({ password }) {
    const checks = [
        { label: 'Minimal 8 karakter', pass: password.length >= 8 },
        { label: 'Huruf besar', pass: /[A-Z]/.test(password) },
        { label: 'Huruf kecil', pass: /[a-z]/.test(password) },
        { label: 'Angka', pass: /[0-9]/.test(password) },
    ];

    const score = checks.filter(c => c.pass).length;

    const bar = [
        { min: 1, color: 'bg-red-400', label: 'Lemah' },
        { min: 2, color: 'bg-orange-400', label: 'Cukup' },
        { min: 3, color: 'bg-yellow-400', label: 'Baik' },
        { min: 4, color: 'bg-primary', label: 'Kuat' },
    ];

    const current = bar.findLast(b => score >= b.min) ?? null;

    if (!password) return null;

    return (
        <div className="space-y-2 mt-2">
            <div className="flex gap-1">
                {bar.map((b, i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${score > i ? b.color : 'bg-surface-high'}`}
                    />
                ))}
            </div>
            {current && (
                <p className="text-xs text-on-surface-variant">
                    Kekuatan: <span className="font-medium">{current.label}</span>
                </p>
            )}
        </div>
    );
}

export default function Register() {
    const { errors } = usePage().props;
    const [agreed, setAgreed] = useState(false);

    const { data, setData, post, processing } = useForm({
        full_name:              '',
        email:                  '',
        password:               '',
        password_confirmation:  '',
    });

    function submit(e) {
        e.preventDefault();
        post('/register');
    }

    return (
        <div className="min-h-screen flex">
            {/* Kolom Kiri — Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <span className="text-white text-2xl font-bold tracking-tight">Savora</span>
                </div>

                <div className="space-y-4">
                    <h1 className="text-white text-4xl font-bold leading-tight">
                        Bergabung dan mulai<br />masak hari ini.
                    </h1>
                    <p className="text-white/70 text-base leading-relaxed">
                        Daftar gratis dan akses ratusan resep Nusantara lengkap dengan bahan-bahannya.
                    </p>
                </div>

                <div />
            </div>

            {/* Kolom Kanan — Form */}
            <div className="flex-1 flex items-center justify-center bg-surface p-8">
                <div className="w-full max-w-sm space-y-7">
                    {/* Header */}
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-on-surface">Buat akun baru</h2>
                        <p className="text-sm text-on-surface-variant">
                            Sudah punya akun?{' '}
                            <Link href="/login" className="text-primary font-medium hover:underline">
                                Masuk
                            </Link>
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={submit} className="space-y-4">
                        {/* Nama Lengkap */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-on-surface">Nama Lengkap</label>
                            <input
                                type="text"
                                value={data.full_name}
                                onChange={e => setData('full_name', e.target.value)}
                                placeholder="Nama kamu"
                                className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-surface-lowest text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30 transition ${
                                    errors.full_name ? 'border-red-400' : 'border-outline-variant focus:border-primary'
                                }`}
                            />
                            {errors.full_name && <p className="text-xs text-red-500">{errors.full_name}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-on-surface">Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="email@contoh.com"
                                className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-surface-lowest text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30 transition ${
                                    errors.email ? 'border-red-400' : 'border-outline-variant focus:border-primary'
                                }`}
                            />
                            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-on-surface">Password</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder="Min. 8 karakter"
                                className="w-full px-4 py-2.5 text-sm rounded-xl border border-outline-variant bg-surface-lowest text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                            />
                            <PasswordStrength password={data.password} />
                            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                        </div>

                        {/* Konfirmasi Password */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-on-surface">Konfirmasi Password</label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                placeholder="Ulangi password"
                                className="w-full px-4 py-2.5 text-sm rounded-xl border border-outline-variant bg-surface-lowest text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                            />
                        </div>

                        {/* Checkbox Syarat */}
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={e => setAgreed(e.target.checked)}
                                className="mt-0.5 accent-primary"
                            />
                            <span className="text-sm text-on-surface-variant leading-relaxed">
                                Saya menyetujui{' '}
                                <span className="text-primary font-medium">Syarat & Ketentuan</span>
                                {' '}dan{' '}
                                <span className="text-primary font-medium">Kebijakan Privasi</span>
                                {' '}Savora.
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={processing || !agreed}
                            className="w-full bg-primary hover:bg-primary-container disabled:opacity-50 text-white font-semibold text-sm rounded-xl py-3 transition"
                        >
                            {processing ? 'Mendaftar...' : 'Daftar Sekarang'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
