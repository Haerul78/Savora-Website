<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\SavedRecipe;
use Illuminate\Support\Str;

class SavedRecipeController extends Controller
{
    public function toggle(Recipe $recipe)
    {
        $user = session('supabase_user');
        $userId = is_array($user) ? ($user['id'] ?? null) : ($user?->id);

        if (!$userId) {
            return back()->with('error', 'Silakan login terlebih dahulu.');
        }

        $savedRecipe = SavedRecipe::where('user_id', $userId)
            ->where('recipe_id', $recipe->id)
            ->first();

        if ($savedRecipe) {
            $savedRecipe->delete();
            return back()->with('success', 'Resep dihapus dari daftar disimpan.');
        }

        SavedRecipe::create([
            'id'        => (string) Str::uuid(),
            'user_id'   => $userId,
            'recipe_id' => $recipe->id,
        ]);

        return back()->with('success', 'Resep berhasil disimpan.');
    }
}
