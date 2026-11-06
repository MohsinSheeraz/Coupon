<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VisitorPresence extends Model
{
    protected $table = 'visitor_presence';

    protected $primaryKey = 'visitor_id';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = ['visitor_id', 'last_seen_at'];

    protected $casts = ['last_seen_at' => 'datetime'];
}