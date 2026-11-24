<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Store extends Model
{
    protected $fillable = ['name', 'slug', 'logo', 'website', 'affiliate_link'];

    protected function logo(): Attribute
    {
        return Attribute::get(static function (?string $value): ?string {
            $path = $value === null ? null : parse_url($value, PHP_URL_PATH);

            return is_string($path) && str_starts_with($path, '/storage/store-logos/')
                ? $path
                : $value;
        });
    }

    public function offers(): HasMany
    {
        return $this->hasMany(Coupon::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    /** Adds coupon_count (non-deal offers) and deal_count, like the Next.js aggregation. */
    public function scopeWithOfferCounts(Builder $query): Builder
    {
        return $query->withCount([
            'offers as coupon_count' => fn ($q) => $q->where('type', '!=', 'deal'),
            'offers as deal_count' => fn ($q) => $q->where('type', 'deal'),
        ]);
    }

    public function scopeWithAvailableOfferCounts(Builder $query): Builder
    {
        return $query->withCount([
            'offers as coupon_count' => fn ($q) => $q->available()->where('type', '!=', 'deal'),
            'offers as deal_count' => fn ($q) => $q->available()->where('type', 'deal'),
        ]);
    }
}
