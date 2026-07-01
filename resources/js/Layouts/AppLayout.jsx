import { Link, usePage } from '@inertiajs/react';

const navItems = [
    {
        label: 'Beranda',
        href: '/',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        label: 'Resep',
        href: '/recipes',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
    },
    {
        label: 'Toko',
        href: '/store',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
    {
        label: 'Keranjang',
        href: '/cart',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
        ),
    },
    {
        label: 'Profil',
        href: '/profile',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
];

export default function AppLayout({ children }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const cartCount = props.cartCount ?? 0;

    const isActive = (href) =>
        href === '/' ? url === '/' : url.startsWith(href);

    return (
        <div className="flex min-h-screen bg-surface">
            {/* Sidebar */}
            <aside className="fixed top-0 left-0 h-screen w-64 bg-white/70 backdrop-blur-xl border-r border-white/40 shadow-lg flex flex-col z-40">
                {/* Logo */}
                <div className="px-6 py-5 border-b border-white/40">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-white font-bold text-sm">S</span>
                        </div>
                        <span className="text-xl font-bold text-primary tracking-tight">Savora</span>
                    </Link>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    active
                                        ? 'bg-secondary-container text-primary'
                                        : 'text-on-surface-variant hover:bg-surface-high hover:text-on-surface'
                                }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                                {item.label === 'Keranjang' && cartCount > 0 && (
                                    <span className="ml-auto bg-primary text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info */}
                {user && (
                    <div className="px-3 py-4 border-t border-white/40">
                        <div className="flex items-center gap-3 px-3 py-2">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                                    <span className="text-primary text-sm font-semibold">
                                        {user.full_name?.[0]?.toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-on-surface truncate">{user.full_name}</p>
                                <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* Main Area */}
            <div className="flex-1 ml-64 flex flex-col">
                {/* Navbar */}
                <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-sm">
                    <div className="flex items-center gap-4 px-6 h-16">
                        {/* Search */}
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Cari resep atau bahan..."
                                    className="w-full pl-9 pr-4 py-2 text-sm bg-surface rounded-xl border border-outline-variant focus:outline-none focus:border-primary placeholder-on-surface-variant text-on-surface"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                            {/* Cart */}
                            <Link href="/cart" className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-high transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                                )}
                            </Link>

                            {/* Avatar */}
                            <Link href="/profile">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover border-2 border-outline-variant" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center border-2 border-outline-variant">
                                        <span className="text-primary text-sm font-semibold">
                                            {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
                                        </span>
                                    </div>
                                )}
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
