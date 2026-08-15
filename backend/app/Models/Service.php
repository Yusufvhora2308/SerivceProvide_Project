<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\ServiceRequest;


class Service extends Model
{
    protected $fillable = [
        'name',
        'category',
        'description',
        'base_price',
        'is_active',
    ];

    public function serviceRequests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class);
    }
}
