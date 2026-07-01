import AppLayout from '@/Layouts/AppLayout';
import RecipeCard from '@/Components/RecipeCard';
import { usePage, router } from '@inertiajs/react';

export default function RecipeIndex() {
    const { recipes, categories, difficulties, filters } = usePage().props;

    function setFilter(key, value) {
        router.get('/recipes', { ...filters, [key]: value, page: 1 }, {
            preserveState: true,
            replace: true,
        });
    }

    function clearFilters() {
        router.get('/recipes', {}, { preserveState: true, replace: true });
    }

    const hasFilter = filters.search || filters.category || filters.difficulty;

    return (
        <AppLayout>
            <div className="flex gap-6">
                {/* Filter Panel */}
                <aside className="w-52 shrink-0 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-on-surface">Filter</h2>
                        {hasFilter && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-primary hover:underline"
                            >
                                Reset
                            </button>
                        )}
                    </div>

                    {/* Kategori */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                            Kategori
                        </p>
                        <ul className="space-y-1">
                            {categories.map(cat => (
                                <li key={cat}>
                                    <button
                                        onClick={() => setFilter('category', filters.category === cat ? '' : cat)}
                                        className={`w-full text-left text-sm px-3 py-1.5 rounded-xl transition ${
                                            filters.category === cat
                                                ? 'bg-primary text-white font-medium'
                                                : 'text-on-surface-variant hover:bg-surface-high'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tingkat Kesulitan */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                            Kesulitan
                        </p>
                        <ul className="space-y-1">
                            {difficulties.map(d => (
                                <li key={d}>
                                    <button
                                        onClick={() => setFilter('difficulty', filters.difficulty === d ? '' : d)}
                                        className={`w-full text-left text-sm px-3 py-1.5 rounded-xl capitalize transition ${
                                            filters.difficulty === d
                                                ? 'bg-primary text-white font-medium'
                                                : 'text-on-surface-variant hover:bg-surface-high'
                                        }`}
                                    >
                                        {d}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 space-y-5 min-w-0">
                    {/* Header + Search */}
                    <div className="flex items-center justify-between gap-4">
                        <h1 className="text-xl font-bold text-on-surface shrink-0">Daftar Resep</h1>
                        <input
                            type="text"
                            defaultValue={filters.search}
                            placeholder="Cari resep..."
                            onChange={e => setFilter('search', e.target.value)}
                            className="w-64 px-4 py-2 text-sm rounded-xl border border-outline-variant bg-surface-lowest text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                        />
                    </div>

                    {/* Grid */}
                    {recipes.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                                {recipes.data.map(recipe => (
                                    <RecipeCard key={recipe.id} recipe={recipe} />
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between pt-2">
                                <p className="text-xs text-on-surface-variant">
                                    {recipes.from}–{recipes.to} dari {recipes.total} resep
                                </p>
                                <div className="flex gap-2">
                                    {recipes.prev_page_url && (
                                        <button
                                            onClick={() => router.get(recipes.prev_page_url, {}, { preserveState: true })}
                                            className="px-3 py-1.5 text-sm rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-high transition"
                                        >
                                            ← Sebelumnya
                                        </button>
                                    )}
                                    {recipes.next_page_url && (
                                        <button
                                            onClick={() => router.get(recipes.next_page_url, {}, { preserveState: true })}
                                            className="px-3 py-1.5 text-sm rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-high transition"
                                        >
                                            Selanjutnya →
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="py-20 text-center space-y-2">
                            <p className="text-on-surface-variant text-sm">Resep tidak ditemukan.</p>
                            {hasFilter && (
                                <button onClick={clearFilters} className="text-sm text-primary hover:underline">
                                    Hapus filter
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
