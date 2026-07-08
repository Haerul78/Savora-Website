<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('recipes')) {
            Schema::create('recipes', function (Blueprint $table) {
                $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                $table->text('title');
                $table->text('slug')->unique();
                $table->text('category');
                $table->text('description')->nullable();
                $table->integer('cook_time_minutes');
                $table->integer('servings')->default(4);
                $table->text('difficulty')->default('Sedang');
                $table->text('image_url')->nullable();
                $table->decimal('rating', 3, 2)->default(0.00);
                $table->integer('total_reviews')->default(0);
                $table->text('source_key')->nullable()->unique();
                $table->boolean('is_published')->default(true);
                $table->timestampsTz();
            });
        }

        if (!Schema::hasTable('recipe_ingredients')) {
            Schema::create('recipe_ingredients', function (Blueprint $table) {
                $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                $table->uuid('recipe_id');
                $table->uuid('product_id')->nullable();
                $table->text('raw_text')->nullable();
                $table->text('name');
                $table->decimal('quantity', 10, 2)->nullable();
                $table->text('unit')->nullable();
                $table->boolean('is_optional')->default(false);
                $table->integer('sort_order')->default(0);
                $table->text('image_url')->nullable();
                $table->foreign('recipe_id')->references('id')->on('recipes');
                $table->foreign('product_id')->references('id')->on('products');
            });
        }

        if (!Schema::hasTable('recipe_steps')) {
            Schema::create('recipe_steps', function (Blueprint $table) {
                $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                $table->uuid('recipe_id');
                $table->integer('step_number');
                $table->text('instruction');
                $table->integer('duration_minutes')->nullable();
                $table->foreign('recipe_id')->references('id')->on('recipes');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('recipe_steps');
        Schema::dropIfExists('recipe_ingredients');
        Schema::dropIfExists('recipes');
    }
};
