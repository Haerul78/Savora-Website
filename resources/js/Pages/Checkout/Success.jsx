import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Success({ order }) {
    const [simulating, setSimulating] = useState(false);

    // Format currency helper
    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    // Check if running in local environment for mockup button
    const isLocal = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    const handleMockPayment = () => {
        setSimulating(true);
        router.post('/checkout/mock-pay', { order_id: order.id }, {
            onFinish: () => setSimulating(false)
        });
    };

    const isPaid = order.status === 'paid' || order.payment?.status === 'paid' || order.status === 'confirmed';

    return (
        <AppLayout>
            <Head title="Pesanan Berhasil - Savora" />

            <div className="max-w-2xl mx-auto py-12 px-4 text-center">
                {/* Visual Icon */}
                <div className="mb-6 flex justify-center">
                    {isPaid ? (
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-bounce">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    ) : (
                        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-600 animate-pulse">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Heading */}
                <h1 className="text-3xl font-bold text-on-surface tracking-tight">
                    {isPaid ? 'Pembayaran Berhasil!' : 'Menunggu Pembayaran'}
                </h1>
                <p className="text-on-surface-variant text-sm mt-2 max-w-md mx-auto">
                    {isPaid 
                        ? 'Terima kasih atas pembayaran Anda. Pesanan Anda sedang diproses dan akan segera dikirim.' 
                        : 'Pesanan Anda telah dibuat. Silakan selesaikan pembayaran Anda via popup Midtrans.'}
                </p>

                {/* Status Badge */}
                <div className="mt-4">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold ${
                        isPaid 
                            ? 'bg-secondary-container text-primary' 
                            : 'bg-yellow-100 text-yellow-800'
                    }`}>
                        {isPaid ? 'Sudah Dibayar' : 'Menunggu Pembayaran'}
                    </span>
                </div>

                {/* Mockup Simulation for Local Development */}
                {isLocal && !isPaid && (
                    <div className="mt-8 p-6 bg-surface-low rounded-2xl border border-dashed border-outline-variant/60 max-w-md mx-auto">
                        <p className="text-xs font-bold text-on-surface flex items-center justify-center gap-1 mb-2">
                            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                            Mode Pengembangan Lokal (Local Dev Mode)
                        </p>
                        <p className="text-[11px] text-on-surface-variant mb-4 leading-relaxed">
                            Webhook callback Midtrans tidak dapat menjangkau server localhost secara otomatis. Klik tombol di bawah untuk mensimulasikan pembayaran sukses.
                        </p>
                        <button
                            onClick={handleMockPayment}
                            disabled={simulating}
                            className="bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {simulating ? 'Mensimulasikan...' : 'Simulasikan Pembayaran Sukses'}
                        </button>
                    </div>
                )}

                {/* Order Details Card */}
                <div className="mt-8 bg-surface-lowest rounded-2xl p-6 shadow-[0_8px_32px_rgba(23,29,26,0.04)] border border-outline-variant/10 text-left">
                    <h3 className="text-sm font-bold text-on-surface mb-4 border-b border-surface-low pb-2">Detail Pesanan</h3>
                    
                    <div className="space-y-2.5 text-xs text-on-surface-variant">
                        <div className="flex justify-between">
                            <span>ID Pesanan</span>
                            <span className="font-semibold text-on-surface">{order.order_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tanggal Transaksi</span>
                            <span>{new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {order.payment?.transaction_id && (
                            <div className="flex justify-between">
                                <span>ID Transaksi Midtrans</span>
                                <span>{order.payment.transaction_id}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span>Total Pembayaran</span>
                            <span className="font-bold text-primary text-sm">{formatRupiah(order.total)}</span>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="mt-6 space-y-3 pt-4 border-t border-surface-low">
                        <p className="text-xs font-bold text-on-surface mb-2">Item yang Dibeli:</p>
                        {order.items?.map((item) => (
                            <div key={item.id} className="flex gap-4 items-center py-2">
                                <div 
                                    className="w-16 h-16 rounded-xl bg-surface-low overflow-hidden shrink-0 border border-outline-variant/10"
                                    style={{ width: '64px', height: '64px' }}
                                >
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
                                <div className="text-right">
                                    <p className="text-xs font-bold text-on-surface">
                                        {formatRupiah(item.subtotal)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="bg-gradient-to-br from-primary to-primary-container text-white text-sm font-semibold rounded-3xl px-8 py-3 hover:opacity-95 transition-opacity inline-flex items-center justify-center gap-1.5 shadow-[0_8px_20px_rgba(0,105,76,0.15)]"
                    >
                        Kembali ke Beranda
                    </Link>
                    <button
                        onClick={() => alert('Fitur Hubungi Support akan segera hadir!')}
                        className="bg-secondary-container text-on-secondary-container text-sm font-semibold rounded-2xl px-6 py-3 hover:brightness-95 transition-all inline-flex items-center justify-center"
                    >
                        Hubungi Support
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
