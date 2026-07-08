import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ProfileLayout from '@/Layouts/ProfileLayout';

export default function Index({ addresses, stats }) {
    const { props } = usePage();
    const user = props.auth?.user;
    
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    // Personal Info Form
    const profileForm = useForm({
        full_name: user?.fullName || '',
        phone: user?.phone || '',
    });

    useEffect(() => {
        if (user) {
            profileForm.setData({
                full_name: user.fullName || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    // Avatar Form
    const avatarForm = useForm({
        avatar: null,
    });

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

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        profileForm.post('/profile/update');
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            avatarForm.setData('avatar', file);
            avatarForm.post('/profile/avatar');
        }
    };

    const handleAddAddress = (e) => {
        e.preventDefault();
        addressForm.post('/addresses', {
            onSuccess: () => {
                setIsAddressModalOpen(false);
                addressForm.reset();
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Profil Saya - Savora" />

            <div className="max-w-7xl mx-auto py-8">
                <ProfileLayout stats={stats}>
                    <div className="space-y-6">
                        {/* Personal Info Card */}
                        <div className="bg-surface-lowest rounded-2xl p-6 shadow-[0_8px_32px_rgba(23,29,26,0.04)] border border-outline-variant/10">
                            <h3 className="text-lg font-bold text-on-surface mb-5 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Informasi Pribadi
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                                {/* Avatar Upload (Left - 3 Cols) */}
                                <div className="md:col-span-3 flex flex-col items-center text-center space-y-3">
                                    <div className="w-24 h-24 rounded-full bg-surface-low border border-outline-variant/20 overflow-hidden flex items-center justify-center relative group">
                                        {user?.avatarUrl ? (
                                            <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-bold uppercase text-on-surface-variant">
                                                {user?.fullName?.[0]}
                                            </span>
                                        )}
                                    </div>
                                    <label className="cursor-pointer bg-secondary-container text-primary hover:bg-secondary-container/80 text-xs font-semibold px-4 py-2 rounded-xl transition-all">
                                        Ubah Foto
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAvatarChange}
                                        />
                                    </label>
                                    <p className="text-[10px] text-on-surface-variant leading-relaxed">
                                        Format: JPG, PNG, GIF. Maks. 2MB.
                                    </p>
                                </div>

                                {/* Form Fields (Right - 9 Cols) */}
                                <form onSubmit={handleUpdateProfile} className="md:col-span-9 space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Nama Lengkap</label>
                                        <input
                                            type="text"
                                            placeholder="Nama Lengkap Anda"
                                            value={profileForm.data.full_name}
                                            onChange={e => profileForm.setData('full_name', e.target.value)}
                                            required
                                            className="w-full bg-surface rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                        {profileForm.errors.full_name && <p className="text-xs text-tertiary mt-1">{profileForm.errors.full_name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Nomor Handphone</label>
                                        <input
                                            type="tel"
                                            placeholder="0812xxxxxxx"
                                            value={profileForm.data.phone}
                                            onChange={e => profileForm.setData('phone', e.target.value)}
                                            className="w-full bg-surface rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                        {profileForm.errors.phone && <p className="text-xs text-tertiary mt-1">{profileForm.errors.phone}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">Alamat Email (Tidak dapat diubah)</label>
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full bg-surface-low rounded-xl px-4 py-3 text-sm text-on-surface-variant border border-outline-variant/10 cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="submit"
                                            disabled={profileForm.processing}
                                            className="bg-primary text-white text-xs font-semibold rounded-2xl px-6 h-11 hover:opacity-90 transition-opacity disabled:opacity-50"
                                        >
                                            {profileForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Addresses Card */}
                        <div className="bg-surface-lowest rounded-2xl p-6 shadow-[0_8px_32px_rgba(23,29,26,0.04)] border border-outline-variant/10">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Daftar Alamat Pengiriman
                                </h3>
                                <button
                                    onClick={() => setIsAddressModalOpen(true)}
                                    className="bg-secondary-container text-primary hover:bg-secondary-container/85 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                                >
                                    Tambah Alamat
                                </button>
                            </div>

                            {addresses.length === 0 ? (
                                <div className="text-center py-10 bg-surface-low/50 rounded-2xl border border-dashed border-outline-variant/50">
                                    <p className="text-xs text-on-surface-variant font-medium">Belum ada alamat pengiriman yang terdaftar.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {addresses.map((address) => (
                                        <div
                                            key={address.id}
                                            className={`p-4 rounded-xl border border-outline-variant/20 bg-white shadow-[0_4px_16px_rgba(23,29,26,0.02)]`}
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-sm font-bold text-on-surface">{address.label}</span>
                                                {address.is_primary && (
                                                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md">
                                                        Utama
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs font-semibold text-on-surface-variant">{address.recipient_name} • {address.phone}</p>
                                            <p className="text-xs text-on-surface-variant mt-1">{address.full_address}, {address.city}, {address.province} {address.postal_code}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </ProfileLayout>
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
