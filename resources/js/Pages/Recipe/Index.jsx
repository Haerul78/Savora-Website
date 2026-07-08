import AppLayout from '@/Layouts/AppLayout';
import RecipeCard from '@/Components/RecipeCard';
import Pagination from '@/Components/Pagination';
import Skeleton from '@/Components/Skeleton';
import { usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

export default function RecipeIndex() {
    const { recipes, categories, difficulties, filters } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [loading, setLoading] = useState(false);
    const debounceTimer = useRef(null);

    useEffect(() => {
        const removeStart = router.on('start', (event) => {
            if (event.detail.visit.url.pathname === '/recipes') {
                setLoading(true);
            }
        });
        const removeFinish = router.on('finish', () => setLoading(false));
        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    useEffect(() => {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            if (search !== (filters.search ?? '')) {
                router.get('/recipes', { ...filters, search, page: 1 }, {
                    preserveState: true,
                    replace: true,
                });
            }
        }, 400);

        return () => clearTimeout(debounceTimer.current);
    }, [search]);

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
                <aside className="w-52 shrink-0">
                    <div className="bg-surface-low border border-outline-variant rounded-2xl p-4 space-y-5 sticky top-4">
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
                            <ul className="space-y-0.5">
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

                        <hr className="border-outline-variant" />

                        {/* Tingkat Kesulitan */}
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                                Kesulitan
                            </p>
                            <ul className="space-y-0.5">
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
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 space-y-5 min-w-0">
                    {/* Header + Search */}
                    <div className="flex items-center justify-between gap-4">
                        <h1 className="text-xl font-bold text-on-surface shrink-0">Daftar Resep</h1>
                        <input
                            type="text"
                            value={search}
                            placeholder="Cari resep..."
                            onChange={e => setSearch(e.target.value)}
                            className="w-64 px-4 py-2 text-sm rounded-xl border border-outline-variant bg-surface-lowest text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                        />
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, idx) => (
                                <div key={idx} className="rounded-2xl border border-outline-variant overflow-hidden space-y-3 p-3">
                                    <Skeleton className="aspect-[4/3] w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : recipes.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                                {recipes.data.map(recipe => (
                                    <RecipeCard key={recipe.id} recipe={recipe} />
                                ))}
                            </div>

                            <Pagination meta={recipes} />
                        </>
                    ) : (
                        <div className="text-center py-16 bg-surface-lowest border border-outline-variant rounded-3xl space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-surface-high flex items-center justify-center mx-auto text-on-surface-variant text-2xl">
                                🔍
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-bold text-on-surface">Resep Tidak Ditemukan</h3>
                                <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                                    {hasFilter
                                        ? 'Maaf, kami tidak dapat menemukan resep dengan kata kunci atau filter yang Anda gunakan. Coba ubah pencarian Anda.'
                                        : 'Belum ada resep yang tersedia saat ini.'}
                                </p>
                            </div>
                            {hasFilter && (
                                <button
                                    onClick={clearFilters}
                                    className="bg-primary text-white px-5 py-2.5 rounded-2xl text-xs font-semibold shadow-md hover:bg-primary-container transition"
                                >
                                    Hapus Filter
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
