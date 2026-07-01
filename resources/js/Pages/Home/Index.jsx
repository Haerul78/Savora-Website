import AppLayout from '@/Layouts/AppLayout';
import { usePage } from '@inertiajs/react';

export default function Home() {
    const { auth, recipes, categories, products } = usePage().props;

    return (
        <AppLayout>
            <div className="space-y-10">
                {/* Greeting */}
                <section>
                    <h1 className="text-2xl font-bold text-on-surface">
                        Halo, {auth.user?.fullName ?? 'User'} 👋
                    </h1>
                    <p className="text-sm text-on-surface-variant mt-1">
                        Mau masak apa hari ini?
                    </p>
                </section>

                {/* Category Chips — placeholder */}
                <section className="space-y-3">
                    <h2 className="text-base font-semibold text-on-surface">Kategori</h2>
                    <div className="flex gap-2 flex-wrap">
                        {categories.map(cat => (
                            <span
                                key={cat}
                                className="px-4 py-1.5 rounded-full text-sm bg-surface-high text-on-surface-variant border border-outline-variant"
                            >
                                {cat}
                            </span>
                        ))}
                    </div>
                </section>

                {/* Rekomendasi Resep — placeholder grid */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-on-surface">Rekomendasi Resep</h2>
                        <a href="/recipes" className="text-sm text-primary font-medium hover:underline">
                            Lihat semua
                        </a>
                    </div>
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                        {recipes.map(recipe => (
                            <div
                                key={recipe.id}
                                className="bg-surface-low rounded-2xl overflow-hidden border border-outline-variant"
                            >
                                {recipe.image_url ? (
                                    <img
                                        src={recipe.image_url}
                                        alt={recipe.title}
                                        className="w-full h-36 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-36 bg-surface-high flex items-center justify-center text-on-surface-variant text-xs">
                                        No Image
                                    </div>
                                )}
                                <div className="p-3 space-y-1">
                                    <p className="text-sm font-semibold text-on-surface line-clamp-1">
                                        {recipe.title}
                                    </p>
                                    <p className="text-xs text-on-surface-variant">
                                        {recipe.cook_time_minutes} menit · {recipe.difficulty}
                                    </p>
                                    <p className="text-xs text-primary font-medium">
                                        ★ {recipe.rating} ({recipe.total_reviews})
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Bahan Segar — placeholder grid */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-on-surface">Bahan Segar</h2>
                        <a href="/store" className="text-sm text-primary font-medium hover:underline">
                            Lihat toko
                        </a>
                    </div>
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                        {products.map(product => (
                            <div
                                key={product.id}
                                className="bg-surface-low rounded-2xl overflow-hidden border border-outline-variant"
                            >
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-28 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-28 bg-surface-high flex items-center justify-center text-on-surface-variant text-xs">
                                        No Image
                                    </div>
                                )}
                                <div className="p-3 space-y-1">
                                    <p className="text-sm font-semibold text-on-surface line-clamp-1">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-on-surface-variant">
                                        {product.category?.name} · per {product.unit}
                                    </p>
                                    <p className="text-sm font-bold text-primary">
                                        Rp {Number(product.price).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
