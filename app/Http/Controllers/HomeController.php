<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Recipe;
use App\Models\SavedRecipe;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $recipes = Recipe::where('is_published', true)
            ->orderByDesc('rating')
            ->limit(8)
            ->get(['id', 'title', 'slug', 'category', 'image_url', 'rating', 'total_reviews', 'cook_time_minutes', 'difficulty']);

        $userId = $this->currentUserId();
        $savedRecipeIds = $userId
            ? SavedRecipe::where('user_id', $userId)->pluck('recipe_id')->flip()
            : collect();

        $recipes = $recipes->map(function ($recipe) use ($savedRecipeIds) {
            $recipe->is_saved = $savedRecipeIds->has($recipe->id);
            return $recipe;
        });

        $categories = Recipe::where('is_published', true)
            ->distinct()
            ->pluck('category')
            ->filter()
            ->values();

        $products = Product::where('is_available', true)
            ->with('category:id,name')
            ->limit(8)
            ->get(['id', 'category_id', 'name', 'price', 'unit', 'image_url']);

        return Inertia::render('Home/Index', [
            'recipes'    => $recipes,
            'categories' => $categories,
            'products'   => $products,
        ]);
    }

    private function currentUserId(): ?string
    {
        $user = session('supabase_user');
        return is_array($user) ? ($user['id'] ?? null) : ($user?->id);
    }
}
