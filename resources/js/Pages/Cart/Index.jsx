import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Skeleton from '@/Components/Skeleton';

export default function Index({ groupedCart }) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const removeStart = router.on('start', (event) => {
            if (event.detail.visit.url.pathname.startsWith('/cart')) {
                setLoading(true);
            }
        });
        const removeFinish = router.on('finish', () => setLoading(false));
        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    // Calculate overall details
    const totalItemsCount = groupedCart.reduce((sum, group) => {
        return sum + group.items.reduce((groupSum, item) => groupSum + item.quantity, 0);
    }, 0);

    const overallSubtotal = groupedCart.reduce((sum, group) => {
        return sum + group.items.reduce((groupSum, item) => {
            const price = parseFloat(item.product?.price || 0);
            return groupSum + (price * item.quantity);
        }, 0);
    }, 0);

    const deliveryFee = overallSubtotal > 0 ? 10000 : 0; // Flat Rp 10.000 delivery fee
    const grandTotal = overallSubtotal + deliveryFee;

    // Format money helper
    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    // Update item quantity
    const handleUpdateQuantity = (item, delta) => {
        const newQty = item.quantity + delta;

        if (newQty < 1) {
            handleRemoveItem(item);
            return;
        }

        router.patch(`/cart/${item.id}`, { quantity: newQty }, {
            preserveScroll: true,
        });
    };

    // Remove single item from cart
    const handleRemoveItem = (item) => {
        if (confirm(`Apakah Anda yakin ingin menghapus "${item.product?.name}" dari keranjang?`)) {
            router.delete(`/cart/${item.id}`, {
                preserveScroll: true,
            });
        }
    };

    // Calculate subtotal per recipe group
    const getGroupSubtotal = (items) => {
        return items.reduce((sum, item) => {
            return sum + (parseFloat(item.product?.price || 0) * item.quantity);
        }, 0);
    };

    // Proceed to Checkout / Payment
    const handleCheckout = () => {
        router.visit('/checkout/payment');
    };

    return (
        <AppLayout>
            <Head title="Keranjang Belanja - Savora" />

            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Keranjang Belanja</h1>
                    <p className="text-sm text-on-surface-variant mt-1">Kelola bahan makanan segar pilihan Anda sebelum melanjutkan pembayaran.</p>
                </div>

                {totalItemsCount > 0 ? (
                    /* 2-Column Cart Layout */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* LEFT COLUMN: Grouped Cart Items (65% equivalent) */}
                        <div className="lg:col-span-8 space-y-8">
                            {loading ? (
                                Array.from({ length: 2 }).map((_, idx) => (
                                    <div key={idx} className="bg-white/50 rounded-3xl p-6 border border-white/40 space-y-4">
                                        <Skeleton className="h-5 w-1/3" />
                                        {Array.from({ length: 2 }).map((__, rowIdx) => (
                                            <div key={rowIdx} className="flex items-center gap-4 py-2">
                                                <Skeleton className="w-16 h-16 shrink-0" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton className="h-4 w-1/2" />
                                                    <Skeleton className="h-3 w-1/3" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            ) : groupedCart.map((group) => (
                                <div
                                    key={group.recipe_id || 'kitchen_needs'}
                                    className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white/40 shadow-sm space-y-6"
                                >
                                    {/* Group Header */}
                                    <div className="flex items-center justify-between pb-4 border-b border-surface-high">
                                        <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
                                            {group.recipe_id ? (
                                                <span className="w-2 h-2 rounded-full bg-primary"></span>
                                            ) : (
                                                <span className="w-2 h-2 rounded-full bg-on-surface-variant"></span>
                                            )}
                                            {group.title}
                                        </h3>
                                        <span className="text-xs font-semibold text-primary">
                                            Subtotal: {formatRupiah(getGroupSubtotal(group.items))}
                                        </span>
                                    </div>

                                    {/* Group Items list */}
                                    <div className="divide-y divide-surface-high/50">
                                        {group.items.map((item) => (
                                            <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    {/* Thumbnail */}
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-high shrink-0 border border-outline-variant/10">
                                                        {item.product?.image_url ? (
                                                            <img
                                                                src={item.product.image_url}
                                                                alt={item.product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-[9px] font-bold">
                                                                Bahan
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Product Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-on-surface truncate">
                                                            {item.product?.name || 'Produk Savora'}
                                                        </h4>
                                                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                                                            {formatRupiah(item.product?.price || 0)} · per {item.product?.unit || 'pack'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Quantity Controls and Delete */}
                                                <div className="flex items-center gap-6">
                                                    {/* Plus / Minus Control */}
                                                    <div className="flex items-center bg-surface-high rounded-xl border border-outline-variant/10 p-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateQuantity(item, -1)}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-white hover:text-primary transition"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="w-8 text-center text-xs font-bold text-on-surface">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateQuantity(item, 1)}
                                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-white hover:text-primary transition"
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    {/* Price multiplication result */}
                                                    <div className="text-right min-w-[80px]">
                                                        <p className="text-sm font-bold text-primary">
                                                            {formatRupiah(parseFloat(item.product?.price || 0) * item.quantity)}
                                                        </p>
                                                    </div>

                                                    {/* Delete Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(item)}
                                                        className="text-on-surface-variant hover:text-tertiary transition p-2 hover:bg-surface-high rounded-xl"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* RIGHT COLUMN: Sticky Summary Card (35% equivalent) */}
                        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-white/50 shadow-md space-y-6">
                                <h3 className="text-base font-bold text-on-surface">Ringkasan Belanja</h3>

                                {/* Shipping Address Placeholder */}
                                <div className="p-4 bg-surface rounded-2xl border border-outline-variant/10 space-y-2">
                                    <div className="flex items-center gap-1 text-[11px] font-bold text-primary uppercase tracking-wider">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Alamat Pengiriman
                                    </div>
                                    <p className="text-xs text-on-surface font-semibold leading-relaxed">
                                        Rumah · Jl. Raya Nusantara No. 45, Jakarta Selatan
                                    </p>
                                </div>

                                {/* Computations list */}
                                <div className="space-y-4 pt-2">
                                    <div className="flex justify-between text-xs text-on-surface-variant">
                                        <span>Total Barang</span>
                                        <span className="font-semibold text-on-surface">{totalItemsCount} Bahan</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-on-surface-variant">
                                        <span>Subtotal Belanja</span>
                                        <span className="font-semibold text-on-surface">{formatRupiah(overallSubtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-on-surface-variant">
                                        <span>Ongkos Kirim</span>
                                        <span className="font-semibold text-on-surface">{formatRupiah(deliveryFee)}</span>
                                    </div>
                                    <div className="border-t border-surface-high pt-4 flex justify-between text-sm">
                                        <span className="font-semibold text-on-surface">Total Harga</span>
                                        <span className="font-extrabold text-primary text-base">{formatRupiah(grandTotal)}</span>
                                    </div>
                                </div>

                                {/* Checkout Button CTA */}
                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-gradient-to-br from-primary to-primary-container text-white font-semibold rounded-2xl py-3.5 px-6 hover:shadow-lg active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2"
                                >
                                    Lanjut ke Pembayaran
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                    </div>
                ) : (
                    /* EMPTY CART STATE */
                    <div className="text-center py-24 bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl space-y-6 max-w-3xl mx-auto">
                        <div className="w-20 h-20 rounded-3xl bg-surface-high flex items-center justify-center mx-auto text-on-surface-variant text-3xl">
                            🛒
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-on-surface">Keranjang Belanja Kosong</h2>
                            <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                                Anda belum menambahkan bahan segar pilihan Anda ke keranjang. Cari bahan segar di toko kami atau pilih resep masakan kesukaan Anda.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-4 pt-2">
                            <Link
                                href="/store"
                                className="bg-primary text-white px-6 py-3 rounded-2xl text-xs font-semibold shadow-md hover:bg-primary-container transition"
                            >
                                Belanja di Toko
                            </Link>
                            <Link
                                href="/recipes"
                                className="bg-secondary-container text-primary px-6 py-3 rounded-2xl text-xs font-semibold hover:brightness-95 transition"
                            >
                                Cari Resep
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
