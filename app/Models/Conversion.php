<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $user_id
 * @property string $type
 * @property string|null $source_name
 * @property int $source_size
 * @property int|null $page_count
 * @property int $character_count
 * @property string|null $output_text
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'type',
    'source_name',
    'source_size',
    'page_count',
    'character_count',
    'output_text',
])]
class Conversion extends Model
{
    /**
     * Get the user that owns the conversion.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
