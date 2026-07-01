<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use Inertia\Inertia;

class RecipeController extends Controller
{
    public function index()
    {
        $search     = request('search', '');
        $category   = request('category', '');
        $difficulty = request('difficulty', '');

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
}
