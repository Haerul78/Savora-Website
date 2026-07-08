<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Recipe extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id', 'title', 'slug', 'category', 'description',
        'cook_time_minutes', 'servings', 'difficulty', 'image_url',
        'rating', 'total_reviews', 'source_key', 'is_published',
    ];

    protected $casts = [
        'rating'       => 'decimal:2',
        'is_published' => 'boolean',
        'created_at'   => 'datetime',
        'updated_at'   => 'datetime',
    ];

    public function ingredients(): HasMany
    {
        return $this->hasMany(RecipeIngredient::class)->orderBy('sort_order');
    }

    public function steps(): HasMany
    {
        return $this->hasMany(RecipeStep::class)->orderBy('step_number');
    }

    public function savedByUsers(): HasMany
    {
        return $this->hasMany(SavedRecipe::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
