import AppLayout from '@/Layouts/AppLayout';
import { usePage } from '@inertiajs/react';

export default function Home() {
    const { auth, cartCount } = usePage().props;

    return (
        <AppLayout>
            <div className="space-y-4">
                <h1 className="text-2xl font-bold text-on-surface">
                    Halo, {auth.user?.fullName ?? 'User'} 👋
                </h1>
                <p className="text-on-surface-variant text-sm">
                    Kamu login sebagai <strong>{auth.user?.email}</strong> · Role: <strong>{auth.user?.role}</strong>
                </p>
                <p className="text-on-surface-variant text-sm">Keranjang: {cartCount} item</p>

                <div className="mt-8 p-4 bg-secondary-container rounded-2xl text-on-secondary-container text-sm">
                    Phase 3a berhasil! Middleware, AuthController, dan shared props berjalan normal.
                </div>
            </div>
        </AppLayout>
    );
}
