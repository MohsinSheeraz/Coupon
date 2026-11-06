<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->string('type', 10)->default('code')->index();
            $table->string('title', 500);
            $table->string('code')->nullable();
            $table->text('affiliate_link')->nullable();
            $table->text('description')->nullable();
            $table->string('expiry_date', 40)->nullable();
            $table->unsignedInteger('used_count')->default(0)->index();
            $table->longText('logo')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};