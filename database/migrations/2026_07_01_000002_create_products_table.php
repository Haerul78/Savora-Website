<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('product_categories')) {
            Schema::create('product_categories', function (Blueprint $table) {
                $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                $table->text('name')->unique();
                $table->text('slug')->unique();
                $table->text('icon_url')->nullable();
                $table->integer('sort_order')->default(0);
            });
        }

        if (!Schema::hasTable('products')) {
            Schema::create('products', function (Blueprint $table) {
                $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                $table->uuid('category_id');
                $table->text('name');
                $table->text('description')->nullable();
                $table->decimal('price', 12, 2);
                $table->integer('stock')->default(0);
                $table->text('unit')->default('pcs');
                $table->text('image_url')->nullable();
                $table->boolean('is_available')->default(true);
                $table->timestampsTz();
                $table->foreign('category_id')->references('id')->on('product_categories');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
        Schema::dropIfExists('product_categories');
    }
};
