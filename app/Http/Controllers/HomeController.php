<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Recipe;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $recipes = Recipe::where('is_published', true)
            ->orderByDesc('rating')
            ->limit(8)
            ->get(['id', 'title', 'slug', 'category', 'image_url', 'rating', 'total_reviews', 'cook_time_minutes', 'difficulty']);

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
}
