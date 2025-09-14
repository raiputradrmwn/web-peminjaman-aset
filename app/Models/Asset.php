<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Asset extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'serial_number',
        'name',
        'type',
        'status',
    ];

    public function borrows()
    {
        return $this->hasMany(Borrow::class, 'asset_id');
    }
}
