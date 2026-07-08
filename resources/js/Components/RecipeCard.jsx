import { Link } from '@inertiajs/react';

export default function RecipeCard({ recipe }) {
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
