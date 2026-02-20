<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
// use App\Models\Token;

class TokenResponse extends Model
{
    protected $fillable = [
        'token_id',
        'consumer_name',
        'contact_number',
        "brand_id",
        "gender",
        "age",
        "pincode",
    ];

    public function leads()
    {
        return $this->hasOne(Lead::class, "token_responses_id");
    }

    public function token()
    {
        return $this->belongsTo(\App\Models\Token::class);
    }

    public function brand()
    {
        return $this->belongsTo(\App\Models\Brand::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

}
