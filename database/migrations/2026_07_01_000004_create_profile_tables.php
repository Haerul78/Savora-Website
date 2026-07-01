<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('saved_recipes')) {
            Schema::create('saved_recipes', function (Blueprint $table) {
                $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                $table->uuid('user_id');
                $table->uuid('recipe_id');
                $table->timestampTz('saved_at')->useCurrent();
                $table->foreign('user_id')->references('id')->on('users');
                $table->foreign('recipe_id')->references('id')->on('recipes');
            });
        }

        if (!Schema::hasTable('reviews')) {
            Schema::create('reviews', function (Blueprint $table) {
                $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                $table->uuid('user_id');
                $table->uuid('recipe_id');
                $table->integer('rating');
                $table->text('comment')->nullable();
                $table->boolean('is_verified')->default(false);
                $table->timestampsTz();
                $table->foreign('user_id')->references('id')->on('users');
                $table->foreign('recipe_id')->references('id')->on('recipes');
            });
        }

        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                $table->uuid('user_id');
                $table->text('type');
                $table->text('title');
                $table->text('body');
                $table->boolean('is_read')->default(false);
                $table->text('reference_id')->nullable();
                $table->timestampTz('created_at')->useCurrent();
                $table->foreign('user_id')->references('id')->on('users');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('saved_recipes');
    }
};
