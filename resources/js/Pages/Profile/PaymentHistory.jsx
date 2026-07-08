import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ProfileLayout from '@/Layouts/ProfileLayout';
import StatusBadge from '@/components/StatusBadge';
import Skeleton from '@/Components/Skeleton';

export default function PaymentHistory({ payments, statusFilter, stats }) {
    const [processingId, setProcessingId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const removeStart = router.on('start', (event) => {
            if (event.detail.visit.url.pathname.startsWith('/profile/payment-history')) {
                setLoading(true);
            }
        });
        const removeFinish = router.on('finish', () => setLoading(false));
        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    // Format currency helper
    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    // Filter statuses mapping
    const filters = [
        { key: 'all', label: 'Semua' },
        { key: 'success', label: 'Berhasil' },
        { key: 'pending', label: 'Pending' },
        { key: 'failed', label: 'Gagal' }
    ];

    const handleFilterChange = (statusKey) => {
        router.get('/profile/payment-history', 
            { status: statusKey }, 
            { preserveState: true }
        );
    };

    const handlePayNow = (paymentToken, orderId) => {
        if (!window.snap) {
            alert('Gerbang pembayaran Midtrans sedang memuat, silakan coba beberapa saat lagi.');
            return;
        }

        setProcessingId(orderId);
        window.snap.pay(paymentToken, {
            onSuccess: () => {
                router.visit(`/checkout/success?order_id=${orderId}`);
            },
            onPending: () => {
                setProcessingId(null);
                alert('Pembayaran masih pending. Silakan selesaikan transaksi Anda.');
            },
            onError: () => {
                setProcessingId(null);
                alert('Pembayaran gagal dilakukan. Silakan coba kembali.');
            },
            onClose: () => {
                setProcessingId(null);
            }
        });
    };

    const handlePageChange = (url) => {
        if (url) router.get(url, {}, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="Riwayat Pembayaran - Savora" />

            <div className="max-w-7xl mx-auto py-8">
                <ProfileLayout stats={stats}>
                    <div className="bg-surface-lowest rounded-2xl p-6 shadow-[0_8px_32px_rgba(23,29,26,0.04)] border border-outline-variant/10 space-y-6">
                        {/* Title and Filter Chips */}
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-surface-low pb-4">
                            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                Riwayat Transaksi
                            </h3>

                            {/* Status Filter Chips */}
                            <div className="flex flex-wrap gap-2">
                                {filters.map(filter => (
                                    <button
                                        key={filter.key}
                                        onClick={() => handleFilterChange(filter.key)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                                            statusFilter === filter.key
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'bg-surface-low text-on-surface-variant hover:bg-surface-high'
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Orders List */}
                        {loading ? (
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, idx) => (
                                    <div key={idx} className="border border-outline-variant/15 rounded-2xl p-4 bg-white space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Skeleton className="h-4 w-1/3" />
                                            <Skeleton className="h-5 w-20" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="w-12 h-12 shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-3 w-1/2" />
                                                <Skeleton className="h-3 w-1/3" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : payments.data.length === 0 ? (
                            <div className="text-center py-12 bg-surface-low/30 rounded-2xl border border-dashed border-outline-variant/50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-on-surface-variant/35 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <p className="text-sm text-on-surface font-semibold">Tidak ada transaksi ditemukan</p>
                                <p className="text-xs text-on-surface-variant mt-1">Anda belum melakukan transaksi pembayaran.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {payments.data.map((order) => {
                                    const orderStatus = order.payment?.status || order.status;
                                    const isPending = orderStatus === 'pending';

                                    return (
                                        <div
                                            key={order.id}
                                            className="border border-outline-variant/15 rounded-2xl p-4 bg-white shadow-[0_4px_16px_rgba(23,29,26,0.01)] hover:shadow-md transition-shadow"
                                        >
                                            {/* Order Header */}
                                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-low pb-3 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-on-surface">{order.order_number}</span>
                                                    <span className="text-[10px] text-on-surface-variant">•</span>
                                                    <span className="text-[11px] text-on-surface-variant">
                                                        {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <StatusBadge status={orderStatus} />
                                            </div>

                                            {/* Order Items */}
                                            <div className="space-y-3">
                                                {order.items?.map((item) => (
                                                    <div key={item.id} className="flex gap-3 items-center">
                                                        <div className="w-12 h-12 rounded-xl bg-surface-low overflow-hidden flex-shrink-0 border border-outline-variant/10">
                                                            {item.product_image ? (
                                                                <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-surface-high font-bold text-[10px] text-on-surface-variant/40">
                                                                    Savora
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-on-surface truncate">{item.product_name}</p>
                                                            <p className="text-[10px] text-on-surface-variant mt-0.5">
                                                                {formatRupiah(item.price_at_purchase)} x {item.quantity}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Order Footer / Action */}
                                            <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-surface-low">
                                                <div>
                                                    <p className="text-[10px] text-on-surface-variant">Total Tagihan</p>
                                                    <p className="text-sm font-bold text-primary">{formatRupiah(order.total)}</p>
                                                </div>

                                                {isPending && order.payment?.midtrans_token && (
                                                    <button
                                                        onClick={() => handlePayNow(order.payment.midtrans_token, order.id)}
                                                        disabled={processingId === order.id}
                                                        className="bg-primary hover:opacity-90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition disabled:opacity-50"
                                                    >
                                                        {processingId === order.id ? 'Memuat...' : 'Bayar Sekarang'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Inline Pagination */}
                                {payments.last_page > 1 && (
                                    <div className="flex items-center justify-between pt-4 border-t border-surface-low">
                                        <p className="text-xs text-on-surface-variant">
                                            Menampilkan {payments.from}–{payments.to} dari {payments.total} transaksi
                                        </p>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handlePageChange(payments.prev_page_url)}
                                                disabled={!payments.prev_page_url}
                                                className="px-3 py-1.5 text-xs rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-low disabled:opacity-40 disabled:cursor-not-allowed transition"
                                            >
                                                ← Sebelum
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(payments.next_page_url)}
                                                disabled={!payments.next_page_url}
                                                className="px-3 py-1.5 text-xs rounded-xl border border-outline-variant/30 text-on-surface-variant hover:bg-surface-low disabled:opacity-40 disabled:cursor-not-allowed transition"
                                            >
                                                Berikutnya →
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </ProfileLayout>
            </div>
        </AppLayout>
    );
}
