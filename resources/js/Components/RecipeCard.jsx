import { Link, router } from '@inertiajs/react';

export default function RecipeCard({ recipe, showBookmark = true }) {
    const handleToggleBookmark = (e) => {
        e.preventDefault();
        e.stopPropagation();
        router.post(`/recipes/${recipe.id}/save`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <Link
            href={`/recipes/${recipe.slug}`}
            className="group bg-surface-low rounded-2xl overflow-hidden border border-outline-variant hover:shadow-md transition block"
        >
            {/* Thumbnail */}
            <div className="relative overflow-hidden">
                {recipe.image_url ? (
                    <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-36 bg-surface-high flex items-center justify-center text-on-surface-variant text-xs">
                        No Image
                    </div>
                )}
                {/* Category badge */}
                {recipe.category && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/40 text-white text-xs font-medium backdrop-blur-sm">
                        {recipe.category}
                    </span>
                )}
                {/* Bookmark button */}
                {showBookmark && (
                    <button
                        type="button"
                        onClick={handleToggleBookmark}
                        title={recipe.is_saved ? 'Hapus dari simpanan' : 'Simpan resep'}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill={recipe.is_saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                            <path d="M5 3.5A1.5 1.5 0 016.5 2h7A1.5 1.5 0 0115 3.5v13l-5-3-5 3v-13z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Info */}
            <div className="p-3 space-y-1.5">
                <p className="text-sm font-semibold text-on-surface line-clamp-2 leading-snug">
                    {recipe.title}
                </p>
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span>{recipe.cook_time_minutes} menit</span>
                    <span className="capitalize">{recipe.difficulty}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-primary font-medium">
                    <span>★ {recipe.rating}</span>
                    <span className="text-on-surface-variant font-normal">({recipe.total_reviews})</span>
                </div>
            </div>
        </Link>
    );
}
