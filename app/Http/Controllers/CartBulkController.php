<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CartBulkController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.recipe_id'  => 'nullable|exists:recipes,id',
            'items.*.quantity'   => 'required|integer|min:1',
        ]);

        $user = session('supabase_user');
        $userId = is_array($user) ? ($user['id'] ?? null) : ($user?->id);

        if (!$userId) {
            return back()->with('error', 'Silakan login terlebih dahulu.');
        }

        foreach ($request->items as $item) {
            $existing = CartItem::where('user_id', $userId)
                ->where('product_id', $item['product_id'])
                ->where('recipe_id', $item['recipe_id'] ?? null)
                ->first();

            if ($existing) {
                $existing->increment('quantity', $item['quantity']);
            } else {
                CartItem::create([
                    'id'         => (string) Str::uuid(),
                    'user_id'    => $userId,
                    'product_id' => $item['product_id'],
                    'recipe_id'  => $item['recipe_id'] ?? null,
                    'quantity'   => $item['quantity'],
                ]);
            }
        }

        return back()->with('success', 'Semua bahan berhasil ditambahkan ke keranjang.');
    }
}
