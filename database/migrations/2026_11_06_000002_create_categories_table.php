<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('key')->unique();
            $table->text('image')->nullable();
            $table->string('status', 10)->default('active');
            $table->timestamps();
        });

        Schema::create('category_store', function (Blueprint $table) {
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->primary(['category_id', 'store_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_store');
        Schema::dropIfExists('categories');
    }
};