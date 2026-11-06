<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('site_name');
            $table->text('site_description')->nullable();
            $table->string('contact_email')->nullable();
            $table->json('social_links')->nullable();
            $table->json('meta_tags')->nullable();
            $table->timestamps();
        });

        Schema::create('visitor_presence', function (Blueprint $table) {
            $table->uuid('visitor_id')->primary();
            $table->timestamp('last_seen_at')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitor_presence');
        Schema::dropIfExists('settings');
    }
};