<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BorrowHistory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'borrow_id',
        'changed_by',
        'old_status',
        'new_status',
        'notes',
        'changed_at',
    ];

    public function borrow()
    {
        return $this->belongsTo(Borrow::class, 'borrow_id');
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
