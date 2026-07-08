<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoreController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $categorySlug = $request->input('category', '');
        $minPrice = $request->input('min_price', '');
        $maxPrice = $request->input('max_price', '');
        $sort = $request->input('sort', 'terbaru');

        // Query products
        $query = Product::where('is_available', true);

        // Search filter
        if ($search) {
            $query->where('name', 'ilike', '%' . $search . '%');
        }

        // Category filter
        if ($categorySlug && $categorySlug !== 'semua') {
            $query->whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        // Price filter
        if ($minPrice) {
            $query->where('price', '>=', floatval($minPrice));
        }
        if ($maxPrice) {
            $query->where('price', '<=', floatval($maxPrice));
        }

        // Sorting
        switch ($sort) {
            case 'termurah':
                $query->orderBy('price', 'asc');
                break;
            case 'termahal':
                $query->orderBy('price', 'desc');
                break;
            case 'terbaru':
                $query->orderByDesc('created_at');
                break;
            case 'terlaris':
            default:
                // Since we don't have a sales counter, sort by stock level or ID or default
                $query->orderByDesc('stock');
                break;
        }

        $products = $query->paginate(12)
            ->withQueryString()
            ->through(fn ($p) => [
                'id'          => $p->id,
                'name'        => $p->name,
                'description' => $p->description,
                'price'       => $p->price,
                'stock'       => $p->stock,
                'unit'        => $p->unit,
                'image_url'   => $p->image_url,
            ]);

        $categories = ProductCategory::orderBy('sort_order')->get(['id', 'name', 'slug', 'icon_url']);

        return Inertia::render('Store/Index', [
            'products'   => $products,
            'categories' => $categories,
            'filters'    => [
                'search'    => $search,
                'category'  => $categorySlug ?: 'semua',
                'min_price' => $minPrice,
                'max_price' => $maxPrice,
                'sort'      => $sort,
            ]
        ]);
    }
}
