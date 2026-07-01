import { Link } from '@inertiajs/react';

export default function ProductCard({ product }) {
    return (
        <div className="bg-surface-low rounded-2xl overflow-hidden border border-outline-variant hover:shadow-md transition">
            {/* Thumbnail */}
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

            {/* Info */}
            <div className="p-3 space-y-1.5">
                <p className="text-sm font-semibold text-on-surface line-clamp-1">
                    {product.name}
                </p>
                {product.category && (
                    <p className="text-xs text-on-surface-variant">
                        {product.category.name} · per {product.unit}
                    </p>
                )}
                <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-primary">
                        Rp {Number(product.price).toLocaleString('id-ID')}
                    </p>
                    <Link
                        href="/store"
                        className="text-xs text-primary font-medium hover:underline"
                    >
                        Beli
                    </Link>
                </div>
            </div>
        </div>
    );
}
