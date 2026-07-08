import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

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
    const [touched, setTouched] = useState({});
    const [passwordMismatch, setPasswordMismatch] = useState(false);

    const { data, setData, post, processing } = useForm({
        full_name:              '',
        email:                  '',
        password:               '',
        password_confirmation:  '',
    });

    useEffect(() => {
        if (data.password_confirmation) {
            setPasswordMismatch(data.password !== data.password_confirmation);
        }
    }, [data.password, data.password_confirmation]);

    function touch(field) {
        setTouched(prev => ({ ...prev, [field]: true }));
    }

    function fieldClass(field, extra = '') {
        const isEmpty = touched[field] && !data[field];
        const hasError = errors[field];
        return `w-full px-4 py-2.5 text-sm rounded-xl border bg-surface-lowest text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 transition ${extra} ${
            hasError || isEmpty
                ? 'border-red-400 focus:ring-red-200'
                : 'border-outline-variant focus:border-primary focus:ring-primary/30'
        }`;
    }

    function submit(e) {
        e.preventDefault();
        setTouched({ full_name: true, email: true, password: true, password_confirmation: true });
        if (passwordMismatch) return;
        post('/register');
    }

    return (
        <div className="min-h-screen flex">
            <Head title="Daftar - Savora" />

            {/* Kolom Kiri — Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
                {/* Dekorasi lingkaran */}
                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5" />
                <div className="absolute top-32 -right-8 w-40 h-40 rounded-full bg-white/5" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5" />

                <div className="relative flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <span className="text-white text-2xl font-bold tracking-tight">Savora</span>
                </div>

                <div className="relative space-y-4">
                    <h1 className="text-white text-4xl font-bold leading-tight">
                        Bergabung dan mulai<br />masak hari ini.
                    </h1>
                    <p className="text-white/70 text-base leading-relaxed max-w-xs">
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
                                onBlur={() => touch('full_name')}
                                placeholder="Nama kamu"
                                className={fieldClass('full_name')}
                            />
                            {touched.full_name && !data.full_name && (
                                <p className="text-xs text-red-500">Nama lengkap wajib diisi.</p>
                            )}
                            {errors.full_name && <p className="text-xs text-red-500">{errors.full_name}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-on-surface">Email</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                onBlur={() => touch('email')}
                                placeholder="email@contoh.com"
                                className={fieldClass('email')}
                            />
                            {touched.email && !data.email && (
                                <p className="text-xs text-red-500">Email wajib diisi.</p>
                            )}
                            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-on-surface">Password</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                onBlur={() => touch('password')}
                                placeholder="Min. 8 karakter"
                                className={fieldClass('password')}
                            />
                            <PasswordStrength password={data.password} />
                            {touched.password && !data.password && (
                                <p className="text-xs text-red-500">Password wajib diisi.</p>
                            )}
                            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                        </div>

                        {/* Konfirmasi Password */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-on-surface">Konfirmasi Password</label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                onBlur={() => touch('password_confirmation')}
                                placeholder="Ulangi password"
                                className={fieldClass('password_confirmation')}
                            />
                            {touched.password_confirmation && !data.password_confirmation && (
                                <p className="text-xs text-red-500">Konfirmasi password wajib diisi.</p>
                            )}
                            {passwordMismatch && data.password_confirmation && (
                                <p className="text-xs text-red-500">Password tidak cocok.</p>
                            )}
                            {!passwordMismatch && data.password_confirmation && data.password && (
                                <p className="text-xs text-primary">Password cocok ✓</p>
                            )}
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
                        Daftar dengan Google
                    </a>
                </div>
            </div>
        </div>
    );
}
