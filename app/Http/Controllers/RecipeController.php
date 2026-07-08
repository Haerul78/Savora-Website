<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\SavedRecipe;
use Inertia\Inertia;

class RecipeController extends Controller
{
    public function index()
    {
        $search     = request('search', '');
        $category   = request('category', '');
        $difficulty = request('difficulty', '');

        $userId = $this->currentUserId();
        $savedRecipeIds = $userId
            ? SavedRecipe::where('user_id', $userId)->pluck('recipe_id')->flip()
            : collect();

        $recipes = Recipe::where('is_published', true)
            ->when($search, fn ($q) => $q->where('title', 'ilike', "%{$search}%"))
            ->when($category, fn ($q) => $q->where('category', $category))
            ->when($difficulty, fn ($q) => $q->where('difficulty', $difficulty))
            ->orderByDesc('rating')
            ->paginate(12)
            ->withQueryString()
            ->through(fn ($r) => [
                'id'                => $r->id,
                'title'             => $r->title,
                'slug'              => $r->slug,
                'category'          => $r->category,
                'image_url'         => $r->image_url,
                'rating'            => $r->rating,
                'total_reviews'     => $r->total_reviews,
                'cook_time_minutes' => $r->cook_time_minutes,
                'difficulty'        => $r->difficulty,
                'is_saved'          => $savedRecipeIds->has($r->id),
            ]);

        $categories  = Recipe::where('is_published', true)->distinct()->pluck('category')->filter()->values();
        $difficulties = ['mudah', 'sedang', 'sulit'];

        return Inertia::render('Recipe/Index', [
            'recipes'      => $recipes,
            'categories'   => $categories,
            'difficulties' => $difficulties,
            'filters'      => compact('search', 'category', 'difficulty'),
        ]);
    }

    public function show($slug)
    {
        $recipe = Recipe::where('slug', $slug)
            ->where('is_published', true)
            ->with([
                'ingredients.product', 
                'steps', 
                'reviews.user'
            ])
            ->firstOrFail();

        $userId = $this->currentUserId();

        $isSaved = false;
        if ($userId) {
            $isSaved = SavedRecipe::where('user_id', $userId)
                ->where('recipe_id', $recipe->id)
                ->exists();
        }

        $savedRecipeIds = $userId
            ? SavedRecipe::where('user_id', $userId)->pluck('recipe_id')->flip()
            : collect();

        $relatedRecipes = Recipe::where('category', $recipe->category)
            ->where('id', '!=', $recipe->id)
            ->where('is_published', true)
            ->orderByDesc('rating')
            ->take(4)
            ->get(['id', 'title', 'slug', 'category', 'image_url', 'rating', 'total_reviews', 'cook_time_minutes', 'difficulty'])
            ->map(function ($r) use ($savedRecipeIds) {
                $r->is_saved = $savedRecipeIds->has($r->id);
                return $r;
            });

        return Inertia::render('Recipe/Show', [
            'recipe' => [
                'id'                => $recipe->id,
                'title'             => $recipe->title,
                'slug'              => $recipe->slug,
                'category'          => $recipe->category,
                'description'       => $recipe->description,
                'cook_time_minutes' => $recipe->cook_time_minutes,
                'servings'          => $recipe->servings,
                'difficulty'        => $recipe->difficulty,
                'image_url'         => $recipe->image_url,
                'rating'            => $recipe->rating,
                'total_reviews'     => $recipe->total_reviews,
                'ingredients'       => $recipe->ingredients->map(fn($ing) => [
                    'id'          => $ing->id,
                    'product_id'  => $ing->product_id,
                    'name'        => $ing->name,
                    'raw_text'    => $ing->raw_text,
                    'quantity'    => $ing->quantity,
                    'unit'        => $ing->unit,
                    'is_optional' => $ing->is_optional,
                    'image_url'   => $ing->image_url,
                    'product'     => $ing->product ? [
                        'id'          => $ing->product->id,
                        'name'        => $ing->product->name,
                        'price'       => $ing->product->price,
                        'image_url'   => $ing->product->image_url,
                        'description' => $ing->product->description,
                    ] : null,
                ]),
                'steps' => $recipe->steps->map(fn($step) => [
                    'id'               => $step->id,
                    'step_number'      => $step->step_number,
                    'instruction'      => $step->instruction,
                    'duration_minutes' => $step->duration_minutes,
                ]),
                'reviews' => $recipe->reviews->map(fn($rev) => [
                    'id'         => $rev->id,
                    'rating'     => $rev->rating,
                    'comment'    => $rev->comment,
                    'created_at' => $rev->created_at ? $rev->created_at->format('Y-m-d H:i') : null,
                    'user'       => $rev->user ? [
                        'id'        => $rev->user->id,
                        'full_name' => $rev->user->full_name,
                        'avatar_url'=> $rev->user->avatar_url,
                    ] : null,
                ]),
            ],
            'isSaved'        => $isSaved,
            'relatedRecipes' => $relatedRecipes,
        ]);
    }

    private function currentUserId(): ?string
    {
        $user = session('supabase_user');
        return is_array($user) ? ($user['id'] ?? null) : ($user?->id);
    }
}
