<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductCategory extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = ['id', 'name', 'slug', 'icon_url', 'sort_order'];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'category_id');
    }
}
