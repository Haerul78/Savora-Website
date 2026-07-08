import { Link, usePage, router } from '@inertiajs/react';

export default function ProfileLayout({ children, stats }) {
    const { url, props } = usePage();
    const user = props.auth?.user;

    const isActive = (path) => {
        if (path === '/profile') {
            return url === '/profile';
        }
        return url.startsWith(path);
    };

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const menuItems = [
        {
            label: 'Informasi Pribadi & Alamat',
            href: '/profile',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            label: 'Riwayat Pesanan',
            href: '/profile/payment-history',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            )
        },
        {
            label: 'Resep Tersimpan',
            href: '/profile/saved-recipes',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
            )
        }
    ];

    return (
        <div className="space-y-8">
            {/* Profile Header Card */}
            {user && (
                <div className="bg-gradient-to-br from-primary to-primary-container text-white rounded-3xl p-6 md:p-8 shadow-[0_12px_40px_rgba(0,105,76,0.15)] flex flex-col md:flex-row items-center gap-6 md:gap-8">
                    {/* Avatar (96px) */}
                    <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/30 overflow-hidden flex-shrink-0 flex items-center justify-center relative group">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-bold uppercase text-white">
                                {user.fullName?.[0]}
                            </span>
                        )}
                    </div>

                    {/* User Details */}
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-bold tracking-tight">{user.fullName}</h2>
                        <p className="text-white/80 text-sm mt-1">{user.email}</p>
                        
                        {/* Member badge */}
                        <div className="mt-3 inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
                            Member Savora
                        </div>
                    </div>

                    {/* Profile Stats */}
                    {stats && (
                        <div className="grid grid-cols-3 gap-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 md:px-6 w-full md:w-auto">
                            <div className="text-center">
                                <p className="text-lg font-bold">{stats.orderCount ?? 0}</p>
                                <p className="text-[10px] uppercase tracking-wider text-white/70 font-semibold mt-0.5">Pesanan</p>
                            </div>
                            <div className="text-center border-x border-white/10 px-2 md:px-4">
                                <p className="text-lg font-bold">{stats.savedCount ?? 0}</p>
                                <p className="text-[10px] uppercase tracking-wider text-white/70 font-semibold mt-0.5">Resep</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold">{stats.reviewCount ?? 0}</p>
                                <p className="text-[10px] uppercase tracking-wider text-white/70 font-semibold mt-0.5">Ulasan</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Navigation Sidebar (30% / 4 columns) */}
                <aside className="lg:col-span-4 bg-surface-lowest rounded-2xl p-4 shadow-[0_8px_32px_rgba(23,29,26,0.04)] border border-outline-variant/10 space-y-1.5">
                    {menuItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                                    active
                                        ? 'bg-secondary-container text-primary shadow-sm'
                                        : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
                                }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}

                    <hr className="my-3 border-surface-low" />

                    {/* Savora Premium Upsell Card */}
                    <div className="bg-gradient-to-br from-primary/5 to-primary-container/10 border border-primary/10 rounded-2xl p-4 mb-3 text-left">
                        <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                            👑 Savora Premium
                        </h4>
                        <p className="text-[10px] text-on-surface-variant mt-1.5 leading-relaxed">
                            Nikmati resep eksklusif dan gratis ongkir selamanya dengan berlangganan Savora Premium.
                        </p>
                        <button
                            onClick={() => alert('Savora Premium akan segera hadir!')}
                            className="mt-3 w-full bg-gradient-to-br from-primary to-primary-container text-white text-[10px] font-bold py-2 rounded-xl hover:opacity-95 transition-opacity"
                        >
                            Daftar Sekarang
                        </button>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-tertiary hover:bg-tertiary/10 transition-all text-left"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Keluar Akun
                    </button>
                </aside>

                {/* Right Content Area (70% / 8 columns) */}
                <main className="lg:col-span-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
