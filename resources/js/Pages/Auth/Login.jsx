import { useForm, usePage } from '@inertiajs/react';

export default function Login() {
    const { errors } = usePage().props;
    const { data, setData, post, processing } = useForm({
        email: '',
        password: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
            <div className="bg-surface-lowest rounded-2xl shadow p-8 w-full max-w-sm space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Savora</h1>
                    <p className="text-sm text-on-surface-variant mt-1">Masuk ke akun kamu</p>
                </div>

                {errors.email && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errors.email}</p>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-1">Email</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-outline-variant rounded-xl bg-surface focus:outline-none focus:border-primary"
                            placeholder="email@contoh.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-1">Password</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-outline-variant rounded-xl bg-surface focus:outline-none focus:border-primary"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-primary text-white text-sm font-semibold rounded-xl py-2.5 hover:bg-primary-container disabled:opacity-50 transition"
                    >
                        {processing ? 'Masuk...' : 'Masuk'}
                    </button>
                </form>

                <p className="text-sm text-center text-on-surface-variant">
                    Belum punya akun?{' '}
                    <a href="/register" className="text-primary font-medium hover:underline">Daftar</a>
                </p>
            </div>
        </div>
    );
}
