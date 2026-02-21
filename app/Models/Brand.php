<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Brand extends Model
{
    use SoftDeletes;
    protected $fillable = [
        "name"
    ];

    public function responses()
    {
        return $this->hasMany(TokenResponse::class);
    }
}
