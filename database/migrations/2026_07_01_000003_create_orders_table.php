<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('addresses')) {
            Schema::create('addresses', function (Blueprint $table) {
                $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                $table->uuid('user_id');
                $table->text('label')->default('Rumah');
                $table->text('recipient_name');
                $table->text('phone');
                $table->text('full_address');
                $table->text('city');
                $table->text('province');
                $table->text('postal_code');
                $table->boolean('is_primary')->default(false);
                $table->timestampTz('created_at')->useCurrent();
                $table->foreign('user_id')->references('id')->on('users');
            });
        }

        if (!Schema::hasTable('cart_items')) {
            Schema::create('cart_items', function (Blueprint $table) {
                $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                $table->uuid('user_id');
                $table->uuid('product_id');
                $table->uuid('recipe_id')->nullable();
                $table->integer('quantity')->default(1);
                $table->timestampTz('added_at')->useCurrent();
                $table->timestampTz('updated_at')->useCurrent();
                $table->foreign('user_id')->references('id')->on('users');
                $table->foreign('product_id')->references('id')->on('products');
                $table->foreign('recipe_id')->references('id')->on('recipes');
            });
        }

        if (!Schema::hasTable('orders')) {
            Schema::create('orders', function (Blueprint $table) {
                $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                $table->uuid('user_id');
                $table->uuid('address_id');
                $table->text('order_number')->unique();
                $table->text('status')->default('pending');
                $table->decimal('subtotal', 12, 2);
                $table->decimal('delivery_fee', 12, 2)->default(0);
                $table->decimal('discount', 12, 2)->default(0);
                $table->decimal('total', 12, 2);
                $table->text('notes')->nullable();
                $table->timestampsTz();
                $table->foreign('user_id')->references('id')->on('users');
                $table->foreign('address_id')->references('id')->on('addresses');
            });
        }

        if (!Schema::hasTable('order_items')) {
            Schema::create('order_items', function (Blueprint $table) {
                $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                $table->uuid('order_id');
                $table->uuid('product_id');
                $table->uuid('recipe_id')->nullable();
                $table->text('product_name');
                $table->text('product_image')->nullable();
                $table->decimal('price_at_purchase', 12, 2);
                $table->integer('quantity');
                $table->decimal('subtotal', 12, 2);
                $table->foreign('order_id')->references('id')->on('orders');
                $table->foreign('product_id')->references('id')->on('products');
                $table->foreign('recipe_id')->references('id')->on('recipes');
            });
        }

        if (!Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table) {
                $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
                $table->uuid('order_id')->unique();
                $table->uuid('user_id');
                $table->text('payment_method')->nullable();
                $table->text('status')->default('pending');
                $table->decimal('amount', 12, 2);
                $table->text('transaction_id')->nullable()->unique();
                $table->text('midtrans_token')->nullable();
                $table->text('midtrans_redirect_url')->nullable();
                $table->text('failure_reason')->nullable();
                $table->timestampTz('paid_at')->nullable();
                $table->timestampTz('expired_at')->nullable();
                $table->timestampTz('created_at')->useCurrent();
                $table->foreign('order_id')->references('id')->on('orders');
                $table->foreign('user_id')->references('id')->on('users');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('addresses');
    }
};
