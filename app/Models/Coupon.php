<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Coupon extends Model
{
    protected $fillable = [
        'store_id', 'type', 'title', 'code', 'affiliate_link',
        'description', 'expiry_date', 'used_count', 'logo',
    ];

    protected $casts = ['used_count' => 'integer'];

    protected $appends = ['verified_time'];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function scopeCodes(Builder $query): Builder
    {
        return $query->where('type', 'code');
    }

    public function scopeDeals(Builder $query): Builder
    {
        return $query->where('type', 'deal');
    }

    /** "Today" / "Yesterday" / "Mar 4, 2026", worked out from created_at. */
    public function getVerifiedTimeAttribute(): string
    {
        $date = $this->created_at;

        if ($date->isToday()) {
            return 'Today';
        }
        if ($date->isYesterday()) {
            return 'Yesterday';
        }

        return $date->format('M j, Y');
    }
}