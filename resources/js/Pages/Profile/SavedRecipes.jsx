import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ProfileLayout from '@/Layouts/ProfileLayout';
import RecipeCard from '@/Components/RecipeCard';

export default function SavedRecipes({ savedRecipes, stats }) {
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [removingId, setRemovingId] = useState(null);

    // List of Indonesian food categories for chips
    const categories = ['Semua', 'Padang', 'Jawa', 'Sunda', 'Betawi', 'Sulawesi'];

    // Filter recipes based on selected category chip
    const filteredRecipes = selectedCategory === 'Semua'
        ? savedRecipes
        : savedRecipes.filter(saved => 
            saved.recipe?.category?.toLowerCase() === selectedCategory.toLowerCase()
        );

    const handleUnsave = (e, recipe) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (confirm(`Apakah Anda yakin ingin menghapus "${recipe.title}" dari resep disimpan?`)) {
            setRemovingId(recipe.id);
            router.post(`/recipes/${recipe.id}/save`, {}, {
                preserveScroll: true,
                onFinish: () => setRemovingId(null)
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Resep Tersimpan - Savora" />

            <div className="max-w-7xl mx-auto py-8">
                <ProfileLayout stats={stats}>
                    <div className="bg-surface-lowest rounded-2xl p-6 shadow-[0_8px_32px_rgba(23,29,26,0.04)] border border-outline-variant/10 space-y-6">
                        {/* Title and stats counter */}
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-surface-low pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                    Resep Tersimpan
                                </h3>
                                <p className="text-xs text-on-surface-variant mt-1">
                                    {filteredRecipes.length} resep dari kategori "{selectedCategory}" tersimpan
                                </p>
                            </div>

                            {/* Category Filter Chips */}
                            <div className="flex flex-wrap gap-2">
                                {categories.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                                            selectedCategory === category
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'bg-surface-low text-on-surface-variant hover:bg-surface-high'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Saved Recipes Grid */}
                        {filteredRecipes.length === 0 ? (
                            <div className="text-center py-16 bg-surface-low/30 rounded-2xl border border-dashed border-outline-variant/50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-on-surface-variant/35 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                                <p className="text-sm text-on-surface font-semibold">Belum ada resep tersimpan</p>
                                <p className="text-xs text-on-surface-variant mt-1">Simpan resep masakan kesukaan Anda agar lebih mudah dicari nanti.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredRecipes.map((saved) => (
                                    <div key={saved.id} className="relative group">
                                        {/* Filled bookmark button at top right */}
                                        <button
                                            onClick={(e) => handleUnsave(e, saved.recipe)}
                                            disabled={removingId === saved.recipe?.id}
                                            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-primary flex items-center justify-center shadow-md transition backdrop-blur-sm"
                                            title="Hapus dari resep disimpan"
                                        >
                                            {removingId === saved.recipe?.id ? (
                                                <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                                </svg>
                                            )}
                                        </button>
                                        
                                        {/* Recipe Card */}
                                        {saved.recipe && <RecipeCard recipe={saved.recipe} />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </ProfileLayout>
            </div>
        </AppLayout>
    );
}
