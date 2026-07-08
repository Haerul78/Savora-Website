import { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Skeleton from '@/Components/Skeleton';

export default function Index({ products, categories, filters }) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const removeStart = router.on('start', (event) => {
            if (event.detail.visit.url.pathname === '/store') {
                setLoading(true);
            }
        });
        const removeFinish = router.on('finish', () => setLoading(false));
        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    // Filter states
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'semua');
    const [minPrice, setMinPrice] = useState(filters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price || '');
    const [sort, setSort] = useState(filters.sort || 'terbaru');

    // Debounce or filter apply helper
    const applyFilters = (newParams = {}) => {
        const params = {
            search,
            category: selectedCategory,
            min_price: minPrice,
            max_price: maxPrice,
            sort,
            ...newParams
        };

        // Remove empty keys
        Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === null) {
                delete params[key];
            }
        });

        router.get('/store', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Trigger filters on category change
    const handleCategoryChange = (slug) => {
        setSelectedCategory(slug);
        applyFilters({ category: slug });
    };

    // Trigger filters on sort change
    const handleSortChange = (e) => {
        const val = e.target.value;
        setSort(val);
        applyFilters({ sort: val });
    };

    // Handle submit price filter
    const handlePriceFilterSubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    // Handle reset filters
    const handleResetFilters = () => {
        setSearch('');
        setSelectedCategory('semua');
        setMinPrice('');
        setMaxPrice('');
        setSort('terbaru');
        router.get('/store', {}, { preserveScroll: true });
    };

    // Add single item to cart
    const handleAddToCart = (product) => {
        router.post('/cart', {
            product_id: product.id,
            quantity: 1,
            recipe_id: null
        }, {
            preserveScroll: true,
        });
    };

    // Format money helper
    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    return (
        <AppLayout>
            <Head title="Toko Segar Savora" />

            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* 1. Promo Banner */}
                <div className="bg-gradient-to-br from-primary to-primary-container rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg">
                    {/* Decorative Background Elements */}
                    <div className="absolute right-0 bottom-0 opacity-20 w-80 h-80 rounded-full bg-white/20 blur-3xl -mr-16 -mb-16"></div>
                    <div className="absolute left-1/3 top-0 opacity-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>

                    <div className="max-w-md space-y-4 relative z-10">
                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                            Promo Minggu Ini
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                            Bahan Segar Pilihan, Langsung dari Petani
                        </h2>
                        <p className="text-white/80 text-sm leading-relaxed">
                            Nikmati sayuran hidroponik, daging segar kualitas premium, dan bumbu tradisional dengan diskon gratis ongkir flat Rp 10.000 ke seluruh Indonesia.
                        </p>
                    </div>
                </div>

                {/* 2. Category Tabs Slider */}
                <div className="space-y-3">
                    <h3 className="text-lg font-bold text-on-surface">Kategori Bahan</h3>
                    <div className="flex items-center gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                        <button
                            type="button"
                            onClick={() => handleCategoryChange('semua')}
                            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                                selectedCategory === 'semua'
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'bg-white text-on-surface-variant hover:bg-surface-high border border-outline-variant/15'
                            }`}
                        >
                            Semua Bahan
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => handleCategoryChange(cat.slug)}
                                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                                    selectedCategory === cat.slug
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-white text-on-surface-variant hover:bg-surface-high border border-outline-variant/15'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Filter and Product Grid Main Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Sidebar Filter Panel (220px equivalent in grid) */}
                    <div className="lg:col-span-3 bg-white/70 backdrop-blur-xl border border-white/40 shadow-sm rounded-3xl p-6 space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-surface-high">
                            <h4 className="font-bold text-on-surface text-base">Filter</h4>
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="text-xs font-semibold text-primary hover:underline"
                            >
                                Reset
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Cari Produk</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                    placeholder="Cari wortel, daging..."
                                    className="w-full bg-surface-high rounded-xl h-11 pl-4 pr-9 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary border border-transparent"
                                />
                                <button
                                    onClick={() => applyFilters()}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Urutkan</label>
                            <select
                                value={sort}
                                onChange={handleSortChange}
                                className="w-full bg-surface-high rounded-xl h-11 px-3 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary border border-transparent appearance-none cursor-pointer"
                            >
                                <option value="terbaru">Terbaru</option>
                                <option value="termurah">Harga: Terendah</option>
                                <option value="termahal">Harga: Tertinggi</option>
                                <option value="terlaris">Ketersediaan Stok</option>
                            </select>
                        </div>

                        {/* Price Range Filter Form */}
                        <form onSubmit={handlePriceFilterSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Rentang Harga</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        placeholder="Min"
                                        className="w-full bg-surface-high rounded-xl h-11 px-3 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary border border-transparent"
                                    />
                                    <input
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        placeholder="Max"
                                        className="w-full bg-surface-high rounded-xl h-11 px-3 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary border border-transparent"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-container text-white font-semibold rounded-xl py-2.5 text-xs transition"
                            >
                                Terapkan Harga
                            </button>
                        </form>
                    </div>

                    {/* Right Product Grid */}
                    <div className="lg:col-span-9 space-y-8">
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                {Array.from({ length: 8 }).map((_, idx) => (
                                    <div key={idx} className="bg-white/80 rounded-2xl overflow-hidden border border-outline-variant/15 space-y-3 p-4">
                                        <Skeleton className="aspect-[4/3] w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                        <Skeleton className="h-8 w-full" />
                                    </div>
                                ))}
                            </div>
                        ) : products.data.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {products.data.map((product) => (
                                        <div
                                            key={product.id}
                                            className="bg-white/80 rounded-2xl overflow-hidden border border-outline-variant/15 shadow-[0_8px_32px_rgba(23,29,26,0.04)] hover:shadow-md transition duration-300 flex flex-col h-full"
                                        >
                                            {/* Product Thumbnail */}
                                            <div className="relative overflow-hidden aspect-[4/3] bg-surface-high">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-xs">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div className="p-4 flex flex-col flex-1 space-y-2">
                                                <h4 className="text-sm font-bold text-on-surface line-clamp-1 leading-snug">
                                                    {product.name}
                                                </h4>
                                                <p className="text-[11px] text-on-surface-variant font-medium">
                                                    Takaran: per {product.unit || 'pack'} · Stok: {product.stock}
                                                </p>
                                                <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed flex-1">
                                                    {product.description || 'Bahan makanan segar kualitas pilihan.'}
                                                </p>
                                                
                                                {/* Price & Add to Cart button */}
                                                <div className="flex items-center justify-between pt-2">
                                                    <p className="text-sm font-extrabold text-primary">
                                                        {formatRupiah(product.price)}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddToCart(product)}
                                                        className="bg-secondary-container text-primary hover:bg-primary hover:text-white transition-all duration-200 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 shadow-sm"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                                        </svg>
                                                        Tambah
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                {products.links && products.links.length > 3 && (
                                    <div className="flex justify-center items-center gap-2 pt-6">
                                        {products.links.map((link, idx) => {
                                            if (link.label.includes('Previous')) {
                                                return link.url ? (
                                                    <Link
                                                        key={idx}
                                                        href={link.url}
                                                        className="px-3.5 py-2 rounded-xl border border-outline-variant/15 text-xs font-semibold bg-white text-on-surface hover:bg-surface-low transition"
                                                    >
                                                        ‹
                                                    </Link>
                                                ) : null;
                                            }
                                            if (link.label.includes('Next')) {
                                                return link.url ? (
                                                    <Link
                                                        key={idx}
                                                        href={link.url}
                                                        className="px-3.5 py-2 rounded-xl border border-outline-variant/15 text-xs font-semibold bg-white text-on-surface hover:bg-surface-low transition"
                                                    >
                                                        ›
                                                    </Link>
                                                ) : null;
                                            }
                                            return (
                                                <Link
                                                    key={idx}
                                                    href={link.url || '#'}
                                                    disabled={!link.url}
                                                    className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition ${
                                                        link.active
                                                            ? 'bg-primary text-white border-primary shadow-sm'
                                                            : 'bg-white text-on-surface border-outline-variant/15 hover:bg-surface-low'
                                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        ) : (
                            /* Empty State Grid */
                            <div className="text-center py-16 bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-surface-high flex items-center justify-center mx-auto text-on-surface-variant">
                                    🔍
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-bold text-on-surface">Produk Tidak Ditemukan</h3>
                                    <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                                        Maaf, kami tidak dapat menemukan bahan makanan segar dengan filter yang Anda gunakan. Silakan ubah filter Anda.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="bg-primary text-white px-5 py-2.5 rounded-2xl text-xs font-semibold shadow-md hover:bg-primary-container transition"
                                >
                                    Lihat Semua Produk
                                </button>
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </AppLayout>
    );
}
