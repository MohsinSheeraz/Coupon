<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['site_name', 'site_description', 'contact_email', 'social_links', 'meta_tags'];

    protected $casts = [
        'social_links' => 'array',
        'meta_tags' => 'array',
    ];

    /** The single settings row. Created with the same defaults as the Next.js app if missing. */
    public static function current(): self
    {
        return static::first() ?? static::create([
            'site_name' => 'DealzyCoup',
            'site_description' => 'Find the best deals and coupons',
            'contact_email' => 'contact@DealzyCoup.com',
            'social_links' => [
                'facebook' => 'https://facebook.com/DealzyCoup',
                'twitter' => 'https://twitter.com/DealzyCoup',
                'instagram' => 'https://instagram.com/DealzyCoup',
            ],
            'meta_tags' => [
                'title' => 'DealzyCoup - Find the Best Deals',
                'description' => 'Discover the best coupons and deals from your favorite stores',
                'keywords' => 'coupons, deals, promo codes, discounts, savings',
            ],
        ]);
    }
}