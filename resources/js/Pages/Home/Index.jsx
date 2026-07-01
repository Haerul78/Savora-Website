import AppLayout from '@/Layouts/AppLayout';
import CategoryChips from '@/Components/CategoryChips';
import RecipeCard from '@/Components/RecipeCard';
import ProductCard from '@/Components/ProductCard';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Home() {
    const { auth, recipes, categories, products } = usePage().props;
    const [activeCategory, setActiveCategory] = useState(null);

    const filteredRecipes = activeCategory
        ? recipes.filter(r => r.category === activeCategory)
        : recipes;

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

                {/* Category Chips */}
                <section className="space-y-3">
                    <h2 className="text-base font-semibold text-on-surface">Kategori</h2>
                    <CategoryChips
                        categories={categories}
                        active={activeCategory}
                        onChange={setActiveCategory}
                    />
                </section>

                {/* Rekomendasi Resep — placeholder grid */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-on-surface">Rekomendasi Resep</h2>
                        <a href="/recipes" className="text-sm text-primary font-medium hover:underline">
                            Lihat semua
                        </a>
                    </div>
                    {filteredRecipes.length > 0 ? (
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                            {filteredRecipes.map(recipe => (
                                <RecipeCard key={recipe.id} recipe={recipe} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-on-surface-variant py-8 text-center">
                            Belum ada resep untuk kategori ini.
                        </p>
                    )}
                </section>

                {/* Bahan Segar — placeholder grid */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-on-surface">Bahan Segar</h2>
                        <a href="/store" className="text-sm text-primary font-medium hover:underline">
                            Lihat toko
                        </a>
                    </div>
                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-on-surface-variant py-8 text-center">
                            Belum ada produk tersedia.
                        </p>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
