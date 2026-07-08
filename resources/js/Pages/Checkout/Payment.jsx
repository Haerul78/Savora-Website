import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Payment({ cartItems, addresses, subtotal, snapToken, orderId }) {
    const [selectedAddressId, setSelectedAddressId] = useState(
        addresses.find(addr => addr.is_primary)?.id || addresses[0]?.id || ''
    );
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [toast, setToast] = useState(null);

    // Toast helper
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Format currency helper
    const formatRupiah = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    // Address Form
    const addressForm = useForm({
        label: '',
        recipient_name: '',
        phone: '',
        full_address: '',
        city: '',
        province: '',
        postal_code: '',
        is_primary: false,
    });

    // Checkout processing form
    const checkoutForm = useForm({
        address_id: selectedAddressId,
    });

    useEffect(() => {
        checkoutForm.setData('address_id', selectedAddressId);
    }, [selectedAddressId]);

    // Handle adding address
    const handleAddAddress = (e) => {
        e.preventDefault();
        addressForm.post('/addresses', {
            onSuccess: () => {
                setIsAddressModalOpen(false);
                addressForm.reset();
                showToast('Alamat baru berhasil ditambahkan!');
                // Auto select the new address if there is one
                if (addresses.length > 0) {
                    setSelectedAddressId(addresses[addresses.length - 1].id);
                }
            },
            onError: () => {
                showToast('Gagal menambahkan alamat. Mohon periksa kembali input Anda.', 'error');
            }
        });
    };

    // Handle placing order and payment
    const handlePlaceOrder = (e) => {
        e.preventDefault();
        if (!selectedAddressId) {
            showToast('Silakan pilih alamat pengiriman terlebih dahulu.', 'error');
            return;
        }

        checkoutForm.post('/checkout/process', {
            preserveScroll: true,
            onSuccess: () => {
                showToast('Order berhasil dibuat! Membuka gerbang pembayaran...');
            },
            onError: (errors) => {
                showToast(errors.error || 'Gagal memproses order.', 'error');
            }
        });
    };

    // Midtrans Snap Trigger
    useEffect(() => {
        if (snapToken) {
            if (window.snap) {
                window.snap.pay(snapToken, {
                    onSuccess: (result) => {
                        router.visit(`/checkout/success?order_id=${orderId}`);
                    },
                    onPending: (result) => {
                        showToast('Pembayaran tertunda. Silakan selesaikan pembayaran Anda.', 'warning');
                        router.visit('/profile'); // or wherever appropriate
                    },
                    onError: (result) => {
                        showToast('Pembayaran gagal. Silakan coba kembali.', 'error');
                    },
                    onClose: () => {
                        showToast('Gerbang pembayaran ditutup. Anda bisa mencobanya kembali.', 'warning');
                    }
                });
            } else {
                showToast('Error: Midtrans Snap.js belum ter-load. Coba muat ulang halaman.', 'error');
            }
        }
    }, [snapToken, orderId]);

    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

    return (
        <AppLayout>
            <Head title="Pengiriman & Pembayaran - Savora" />

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in-up text-sm font-semibold transition-all ${
                    toast.type === 'error' ? 'bg-tertiary text-white' : 
                    toast.type === 'warning' ? 'bg-yellow-500 text-white' : 'bg-primary text-white'
                }`}>
                    <span>{toast.message}</span>
                </div>
            )}

            <div className="max-w-7xl mx-auto py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-on-surface tracking-tight">Checkout</h1>
                    <p className="text-on-surface-variant text-sm mt-1">Selesaikan pesanan Anda dengan aman</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column (Main details) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Address Selection */}
                        <div className="bg-surface-lowest rounded-2xl p-6 shadow-[0_8px_32px_rgba(23,29,26,0.04)] border border-outline-variant/10">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Alamat Pengiriman
                                </h2>
                                <button
                                    onClick={() => setIsAddressModalOpen(true)}
                                    className="bg-secondary-container text-on-secondary-container text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-secondary-container/80 transition-all flex items-center gap-1.5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Tambah Alamat
                                </button>
                            </div>

                            {addresses.length === 0 ? (
                                <div className="text-center py-10 bg-surface-low/50 rounded-2xl border border-dashed border-outline-variant/50">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <p className="text-sm text-on-surface font-semibold">Belum ada alamat pengiriman</p>
                                    <p className="text-xs text-on-surface-variant mt-1 mb-4">Mohon tambahkan alamat pengiriman Anda untuk memproses checkout.</p>
                                    <button
                                        onClick={() => setIsAddressModalOpen(true)}
                                        className="bg-primary text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all"
                                    >
                                        Buat Alamat Pertama
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {addresses.map((address) => (
                                        <div
                                            key={address.id}
                                            onClick={() => setSelectedAddressId(address.id)}
                                            className={`p-4 rounded-xl cursor-pointer transition-all border text-left ${
                                                selectedAddressId === address.id
                                                    ? 'bg-secondary-container/20 border-primary shadow-sm'
                                                    : 'bg-white border-outline-variant/20 hover:bg-surface-low/30'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-on-surface">{address.label}</span>
                                                    {address.is_primary && (
                                                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md">
                                                            Utama
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="w-5 h-5 rounded-full border border-outline-variant flex items-center justify-center bg-white">
                                                    {selectedAddressId === address.id && (
                                                        <div className="w-3 h-3 rounded-full bg-primary" />
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs font-semibold text-on-surface-variant">{address.recipient_name} • {address.phone}</p>
                                            <p className="text-xs text-on-surface-variant mt-1">{address.full_address}, {address.city}, {address.province} {address.postal_code}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Items Review */}
                        <div className="bg-surface-lowest rounded-2xl p-6 shadow-[0_8px_32px_rgba(23,29,26,0.04)] border border-outline-variant/10">
                            <h2 className="text-xl font-bold text-on-surface flex items-center gap-2 mb-5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                Rincian Pesanan
                            </h2>
                            <div className="divide-y divide-surface-low">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                                        <div className="w-16 h-16 rounded-xl bg-surface-low overflow-hidden flex-shrink-0">
                                            {item.product?.image_url ? (
                                                <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40 bg-surface-high font-bold text-xs">
                                                    Savora
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-on-surface truncate">{item.product?.name}</h4>
                                            <p className="text-xs text-on-surface-variant mt-0.5">
                                                {formatRupiah(item.product?.price)} x {item.quantity} {item.product?.unit || 'pcs'}
                                            </p>
                                            {item.recipe_id && (
                                                <span className="inline-flex mt-1 text-[10px] font-semibold text-primary bg-secondary-container px-2 py-0.5 rounded-md">
                                                    Resep Bahan
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-on-surface">
                                                {formatRupiah(item.product?.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Summary Panel) */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 bg-surface-lowest rounded-2xl p-6 shadow-[0_8px_32px_rgba(23,29,26,0.04)] border border-outline-variant/10">
                            <h3 className="text-lg font-bold text-on-surface mb-4">Ringkasan Pembayaran</h3>
                            
                            {/* Costs */}
                            <div className="space-y-3 mb-6 text-sm">
                                <div className="flex justify-between text-on-surface-variant">
                                    <span>Total Belanja ({cartItems.reduce((acc, curr) => acc + curr.quantity, 0)} Barang)</span>
                                    <span>{formatRupiah(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-on-surface-variant">
                                    <span>Biaya Pengiriman</span>
                                    <span className="text-primary font-semibold">Gratis</span>
                                </div>
                                <div className="border-t border-surface-low pt-3 flex justify-between font-bold text-base text-on-surface">
                                    <span>Total Tagihan</span>
                                    <span>{formatRupiah(subtotal)}</span>
                                </div>
                            </div>

                            {/* Payment Address Detail */}
                            {selectedAddress && (
                                <div className="bg-surface-low/50 rounded-xl p-3 mb-6 text-xs text-on-surface-variant border border-outline-variant/5">
                                    <p className="font-bold text-on-surface mb-1">📍 Kirim ke {selectedAddress.label}</p>
                                    <p>{selectedAddress.recipient_name} • {selectedAddress.phone}</p>
                                    <p className="truncate">{selectedAddress.full_address}</p>
                                </div>
                            )}

                            {/* Pay Button */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={checkoutForm.processing || !selectedAddressId}
                                className="w-full bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-3xl py-3.5 hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-[0_8px_20px_rgba(0,105,76,0.2)]"
                            >
                                {checkoutForm.processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        Bayar Sekarang
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Modal */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in border border-outline-variant/10">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-surface-low flex justify-between items-center">
                            <h3 className="text-lg font-bold text-on-surface">Tambah Alamat Baru</h3>
                            <button
                                onClick={() => setIsAddressModalOpen(false)}
                                className="text-on-surface-variant hover:text-on-surface transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body / Form */}
                        <form onSubmit={handleAddAddress}>
                            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                                {/* Label */}
                                <div>
                                    <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Label Alamat (misal: Rumah, Kantor)</label>
                                    <input
                                        type="text"
                                        placeholder="Rumah / Kantor"
                                        value={addressForm.data.label}
                                        onChange={e => addressForm.setData('label', e.target.value)}
                                        required
                                        className="w-full bg-surface rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                    {addressForm.errors.label && <p className="text-xs text-tertiary mt-1">{addressForm.errors.label}</p>}
                                </div>

                                {/* Row Name & Phone */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Nama Penerima</label>
                                        <input
                                            type="text"
                                            placeholder="Nama Lengkap"
                                            value={addressForm.data.recipient_name}
                                            onChange={e => addressForm.setData('recipient_name', e.target.value)}
                                            required
                                            className="w-full bg-surface rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                        {addressForm.errors.recipient_name && <p className="text-xs text-tertiary mt-1">{addressForm.errors.recipient_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Nomor HP</label>
                                        <input
                                            type="tel"
                                            placeholder="0812xxxxxx"
                                            value={addressForm.data.phone}
                                            onChange={e => addressForm.setData('phone', e.target.value)}
                                            required
                                            className="w-full bg-surface rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                        {addressForm.errors.phone && <p className="text-xs text-tertiary mt-1">{addressForm.errors.phone}</p>}
                                    </div>
                                </div>

                                {/* Full Address */}
                                <div>
                                    <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Alamat Lengkap (Jalan, No, RT/RW, Kecamatan)</label>
                                    <textarea
                                        placeholder="Tulis alamat detail..."
                                        rows={3}
                                        value={addressForm.data.full_address}
                                        onChange={e => addressForm.setData('full_address', e.target.value)}
                                        required
                                        className="w-full bg-surface rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                                    />
                                    {addressForm.errors.full_address && <p className="text-xs text-tertiary mt-1">{addressForm.errors.full_address}</p>}
                                </div>

                                {/* Row Province, City & Postal */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Provinsi</label>
                                        <input
                                            type="text"
                                            placeholder="Provinsi"
                                            value={addressForm.data.province}
                                            onChange={e => addressForm.setData('province', e.target.value)}
                                            required
                                            className="w-full bg-surface rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                        {addressForm.errors.province && <p className="text-xs text-tertiary mt-1">{addressForm.errors.province}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Kota / Kab</label>
                                        <input
                                            type="text"
                                            placeholder="Kota"
                                            value={addressForm.data.city}
                                            onChange={e => addressForm.setData('city', e.target.value)}
                                            required
                                            className="w-full bg-surface rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                        {addressForm.errors.city && <p className="text-xs text-tertiary mt-1">{addressForm.errors.city}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Kode Pos</label>
                                        <input
                                            type="text"
                                            placeholder="Kode Pos"
                                            value={addressForm.data.postal_code}
                                            onChange={e => addressForm.setData('postal_code', e.target.value)}
                                            required
                                            className="w-full bg-surface rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                        {addressForm.errors.postal_code && <p className="text-xs text-tertiary mt-1">{addressForm.errors.postal_code}</p>}
                                    </div>
                                </div>

                                {/* Set as primary */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="is_primary"
                                        checked={addressForm.data.is_primary}
                                        onChange={e => addressForm.setData('is_primary', e.target.checked)}
                                        className="w-4 h-4 text-primary bg-surface border-outline-variant rounded focus:ring-primary"
                                    />
                                    <label htmlFor="is_primary" className="text-xs font-semibold text-on-surface-variant cursor-pointer">
                                        Atur sebagai alamat utama
                                    </label>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-surface border-t border-surface-low flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddressModalOpen(false)}
                                    className="bg-surface-lowest text-on-surface border border-outline-variant/35 text-xs font-bold rounded-2xl px-5 py-2.5 hover:bg-surface-low transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={addressForm.processing}
                                    className="bg-primary text-white text-xs font-bold rounded-2xl px-6 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {addressForm.processing ? 'Menyimpan...' : 'Simpan Alamat'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
