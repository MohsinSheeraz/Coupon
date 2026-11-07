<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VisitorPresence extends Model
{
    /** Rows older than this are deleted (the Next.js app used a 10 minute MongoDB TTL index). */
    private const TTL_SECONDS = 600;

    protected $table = 'visitor_presence';

    protected $primaryKey = 'visitor_id';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = ['visitor_id', 'last_seen_at'];

    protected $casts = ['last_seen_at' => 'datetime'];

    /** Create or refresh a visitor, and now and then clean out old rows. */
    public static function record(string $visitorId): void
    {
        static::upsert(
            [['visitor_id' => $visitorId, 'last_seen_at' => now()]],
            ['visitor_id'],
            ['last_seen_at'],
        );

        if (random_int(1, 20) === 1) {
            static::where('last_seen_at', '<', now()->subSeconds(self::TTL_SECONDS))->delete();
        }
    }

    /** Visitors seen within the last few minutes (the admin dashboard shows this number). */
    public static function activeCount(int $windowMinutes = 3): int
    {
        return static::where('last_seen_at', '>=', now()->subMinutes($windowMinutes))->count();
    }
}
