import { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import RecipeCard from '@/Components/RecipeCard';

export default function Show({ recipe, isSaved, relatedRecipes }) {
    // State to track checked status of each ingredient
    const [checkedIngredients, setCheckedIngredients] = useState({});
    // State to track active cooking step
    const [activeStep, setActiveStep] = useState(0);

    // Initialize all ingredients with product_id as checked by default
    useEffect(() => {
        const initial = {};
        recipe.ingredients.forEach(ing => {
            if (ing.product_id) {
                initial[ing.id] = true;
            } else {
                initial[ing.id] = false;
            }
        });
        setCheckedIngredients(initial);
    }, [recipe]);

    // Handle single ingredient checkbox toggle
    const handleToggleIngredient = (id) => {
        setCheckedIngredients(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Handle check all / uncheck all ingredients
    const handleToggleAll = (checked) => {
        const updated = {};
        recipe.ingredients.forEach(ing => {
            if (ing.product_id) {
                updated[ing.id] = checked;
            }
        });
        setCheckedIngredients(updated);
    };

    // Calculate details for Checked ingredients
    const buyableIngredients = recipe.ingredients.filter(ing => ing.product_id);
    const selectedIngredients = recipe.ingredients.filter(ing => checkedIngredients[ing.id] && ing.product);
    const totalIngredientsPrice = selectedIngredients.reduce((sum, ing) => {
        return sum + parseFloat(ing.product?.price || 0);
    }, 0);

    // Format currency to Rupiah
    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    };

    // Handle Bookmark Toggle
    const handleToggleBookmark = () => {
        router.post(`/recipes/${recipe.id}/save`, {}, {
            preserveScroll: true,
        });
    };

    // Handle Buy Ingredients (Bulk Add to Cart)
    const handleBuyIngredients = () => {
        const items = selectedIngredients.map(ing => ({
            product_id: ing.product_id,
            recipe_id: recipe.id,
            quantity: 1
        }));

        router.post('/cart/bulk', { items }, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title={`${recipe.title} - Savora`} />

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Back button */}
                <div>
                    <Link
                        href="/recipes"
                        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary font-medium group transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                        Kembali ke Resep
                    </Link>
                </div>

                {/* Main 2-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT COLUMN: Recipe Info, Ingredients, Steps (60% equivalent) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Recipe Image & Title */}
                        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white/40 shadow-sm space-y-6">
                            <div className="relative overflow-hidden rounded-3xl aspect-[16/9]">
                                {recipe.image_url ? (
                                    <img
                                        src={recipe.image_url}
                                        alt={recipe.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-surface-high flex items-center justify-center text-on-surface-variant">
                                        Gambar Resep
                                    </div>
                                )}
                                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-semibold backdrop-blur-sm tracking-wide capitalize">
                                    {recipe.category}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <h1 className="text-3xl font-bold text-on-surface tracking-tight leading-tight">
                                    {recipe.title}
                                </h1>
                                {recipe.description && (
                                    <p className="text-on-surface-variant text-base leading-relaxed">
                                        {recipe.description}
                                    </p>
                                )}
                            </div>

                            {/* Info Stats Grid */}
                            <div className="grid grid-cols-3 gap-4 py-4 px-6 bg-surface rounded-2xl border border-outline-variant/10 text-center">
                                <div>
                                    <p className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">Waktu Masak</p>
                                    <p className="text-lg font-bold text-primary mt-1">{recipe.cook_time_minutes} Menit</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">Porsi</p>
                                    <p className="text-lg font-bold text-primary mt-1">{recipe.servings} Porsi</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant">Tingkat Kesulitan</p>
                                    <p className="text-lg font-bold text-primary mt-1 capitalize">{recipe.difficulty}</p>
                                </div>
                            </div>
                        </div>

                        {/* Ingredients Checklist */}
                        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white/40 shadow-sm space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-on-surface">Bahan-bahan</h2>
                                {buyableIngredients.length > 0 && (
                                    <div className="flex items-center gap-4 text-xs font-semibold text-primary">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleAll(true)}
                                            className="hover:underline"
                                        >
                                            Pilih Semua
                                        </button>
                                        <span className="text-outline-variant">|</span>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleAll(false)}
                                            className="hover:underline"
                                        >
                                            Hapus Semua
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="divide-y divide-surface-high/50">
                                {recipe.ingredients.map((ing) => (
                                    <div key={ing.id} className="py-4 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            {/* Custom Checkbox for buyable ingredients */}
                                            {ing.product_id ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleIngredient(ing.id)}
                                                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                                                        checkedIngredients[ing.id]
                                                            ? 'bg-primary border-primary text-white'
                                                            : 'border-outline-variant hover:border-primary/50 bg-white'
                                                    }`}
                                                >
                                                    {checkedIngredients[ing.id] && (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </button>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-surface-high flex items-center justify-center text-[10px] text-on-surface-variant font-bold">
                                                    •
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${ing.product_id && checkedIngredients[ing.id] ? 'text-on-surface' : 'text-on-surface-variant'} ${!ing.product_id ? 'text-on-surface' : ''}`}>
                                                    {ing.raw_text || `${ing.quantity} ${ing.unit} ${ing.name}`}
                                                </p>
                                                {ing.is_optional && (
                                                    <span className="inline-block px-2 py-0.5 mt-0.5 rounded bg-surface-high text-on-surface-variant text-[10px] font-medium">
                                                        Opsional
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Product Price Tag (if linked to product) */}
                                        {ing.product && (
                                            <div className="text-right">
                                                <span className="text-xs font-semibold text-primary block">
                                                    {formatRupiah(ing.product.price)}
                                                </span>
                                                <span className="text-[10px] text-on-surface-variant block truncate max-w-[120px]">
                                                    {ing.product.name}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Steps Section */}
                        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white/40 shadow-sm space-y-6">
                            <h2 className="text-xl font-bold text-on-surface">Langkah Pembuatan</h2>
                            
                            <div className="space-y-6">
                                {recipe.steps.map((step, idx) => (
                                    <div 
                                        key={step.id} 
                                        onClick={() => setActiveStep(idx)}
                                        className={`flex gap-5 p-4 rounded-2xl border transition-all cursor-pointer ${
                                            activeStep === idx 
                                                ? 'bg-secondary-container/40 border-primary/20 shadow-sm'
                                                : 'border-transparent hover:bg-surface-low/30'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                                            activeStep === idx ? 'bg-primary text-white' : 'bg-surface-high text-on-surface-variant'
                                        }`}>
                                            {step.step_number}
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-on-surface leading-relaxed">
                                                {step.instruction}
                                            </p>
                                            {step.duration_minutes > 0 && (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface text-primary text-xs font-semibold border border-outline-variant/10">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {step.duration_minutes} Menit
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white/40 shadow-sm space-y-6">
                            <h2 className="text-xl font-bold text-on-surface">
                                Ulasan ({recipe.total_reviews})
                            </h2>
                            {recipe.reviews && recipe.reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {recipe.reviews.map((review) => (
                                        <div key={review.id} className="p-4 rounded-2xl bg-surface/50 border border-outline-variant/10 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {review.user?.avatar_url ? (
                                                        <img src={review.user.avatar_url} alt={review.user.full_name} className="w-8 h-8 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                                                            <span className="text-primary text-xs font-bold">
                                                                {review.user?.full_name?.[0]?.toUpperCase() ?? 'U'}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="text-sm font-bold text-on-surface">{review.user?.full_name ?? 'Pengguna Savora'}</h4>
                                                        <span className="text-[10px] text-on-surface-variant">{review.created_at}</span>
                                                    </div>
                                                </div>
                                                <div className="text-yellow-500 font-bold text-sm">
                                                    ★ {review.rating}
                                                </div>
                                            </div>
                                            <p className="text-xs text-on-surface-variant pl-11">
                                                {review.comment}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-on-surface-variant italic">Belum ada ulasan untuk resep ini.</p>
                            )}
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Sticky Summary Card (40% equivalent) */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                        
                        {/* Summary Card */}
                        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-white/50 shadow-md space-y-6">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-on-surface">Ringkasan Pembelian</h3>
                                <p className="text-xs text-on-surface-variant">Beli bahan segar resep ini langsung</p>
                            </div>

                            {/* Saved/Bookmark Button and Stats */}
                            <div className="flex items-center justify-between py-3 border-y border-surface-high">
                                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                                    <span>★ {recipe.rating}</span>
                                    <span>({recipe.total_reviews} ulasan)</span>
                                </div>
                                <button
                                    onClick={handleToggleBookmark}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                                        isSaved
                                            ? 'bg-secondary-container text-primary shadow-sm'
                                            : 'bg-surface-high text-on-surface-variant hover:bg-surface-high/80'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${isSaved ? 'fill-current' : 'none'}`} fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                    {isSaved ? 'Tersimpan' : 'Simpan Resep'}
                                </button>
                            </div>

                            {/* Checked Item Calculations */}
                            {buyableIngredients.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between text-xs text-on-surface-variant">
                                        <span>Bahan Terpilih</span>
                                        <span className="font-semibold text-on-surface">{selectedIngredients.length} dari {buyableIngredients.length} bahan</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-semibold text-on-surface">Estimasi Harga</span>
                                        <span className="font-extrabold text-primary text-base">{formatRupiah(totalIngredientsPrice)}</span>
                                    </div>

                                    {/* CTA: Buy all ingredients */}
                                    <button
                                        onClick={handleBuyIngredients}
                                        disabled={selectedIngredients.length === 0}
                                        className="w-full bg-gradient-to-br from-primary to-primary-container text-white font-semibold rounded-2xl py-3.5 px-6 hover:shadow-lg active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Beli Bahan Terpilih
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-4 bg-surface rounded-2xl border border-outline-variant/10">
                                    <p className="text-xs text-on-surface-variant font-medium">Bahan untuk resep ini belum tersedia di toko Savora.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* BOTTOM: Related Recipes */}
                {relatedRecipes && relatedRecipes.length > 0 && (
                    <div className="pt-8 border-t border-outline-variant/15 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-on-surface tracking-tight">Rekomendasi Terkait</h2>
                            <Link href="/recipes" className="text-sm font-semibold text-primary hover:underline">
                                Lihat Semua
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {relatedRecipes.map((item) => (
                                <RecipeCard key={item.id} recipe={item} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
