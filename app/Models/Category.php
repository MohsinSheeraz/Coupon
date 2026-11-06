<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Category extends Model
{
    protected $fillable = ['name', 'key', 'image', 'status'];

    protected static function booted(): void
    {
        static::saving(function (Category $category) {
            $category->key = static::keyFor($category->name);
        });
    }

    /** Port of categoryKey(): lowercase, letters and digits only, trailing "s" removed. */
    public static function keyFor(string $value): string
    {
        $normalized = preg_replace('/[^a-z0-9]/', '', mb_strtolower($value));

        return preg_replace('/s$/', '', $normalized);
    }

    public function stores(): BelongsToMany
    {
        return $this->belongsToMany(Store::class);
    }
}