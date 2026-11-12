<?php

namespace App\Http\Controllers;

use App\Models\Conversion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ConverterController extends Controller
{
    /**
     * Show the single-page converter.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Converter', [
            'recentConversions' => $user
                ? $user->conversions()
                    ->latest()
                    ->limit(12)
                    ->get()
                    ->map(fn (Conversion $conversion): array => $this->summary($conversion))
                    ->values()
                : [],
            'stats' => $user
                ? [
                    'total' => $user->conversions()->count(),
                    'characters' => (int) $user->conversions()->sum('character_count'),
                    'images' => $user->conversions()->where('type', 'image')->count(),
                    'pdfs' => $user->conversions()->where('type', 'pdf')->count(),
                ]
                : null,
        ]);
    }

    /**
     * Store a conversion in the signed-in user's history.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', Rule::in(['image', 'pdf', 'text'])],
            'source_name' => ['nullable', 'string', 'max:255'],
            'source_size' => ['nullable', 'integer', 'min:0'],
            'page_count' => ['nullable', 'integer', 'min:0'],
            'output_text' => ['nullable', 'string', 'max:2000000'],
        ]);

        $text = $validated['output_text'] ?? '';

        $conversion = $request->user()->conversions()->create([
            'type' => $validated['type'],
            'source_name' => $validated['source_name'] ?? null,
            'source_size' => $validated['source_size'] ?? 0,
            'page_count' => $validated['page_count'] ?? null,
            'character_count' => mb_strlen($text),
            'output_text' => $text,
        ]);

        return response()->json([
            'conversion' => $this->summary($conversion),
        ], 201);
    }

    /**
     * Return the full text of a saved conversion.
     */
    public function show(Request $request, Conversion $conversion): JsonResponse
    {
        abort_unless($conversion->user_id === $request->user()->id, 403);

        return response()->json([
            'conversion' => [
                ...$this->summary($conversion),
                'output_text' => $conversion->output_text,
            ],
        ]);
    }

    /**
     * Remove a conversion from the user's history.
     */
    public function destroy(Request $request, Conversion $conversion): JsonResponse
    {
        abort_unless($conversion->user_id === $request->user()->id, 403);

        $conversion->delete();

        return response()->json(['deleted' => true]);
    }

    /**
     * Build the payload sent to the frontend for a conversion.
     *
     * @return array<string, mixed>
     */
    private function summary(Conversion $conversion): array
    {
        $text = (string) $conversion->output_text;
        $preview = trim(preg_replace('/\s+/u', ' ', $text) ?? '');

        return [
            'id' => $conversion->id,
            'type' => $conversion->type,
            'source_name' => $conversion->source_name,
            'source_size' => $conversion->source_size,
            'page_count' => $conversion->page_count,
            'character_count' => $conversion->character_count,
            'preview' => mb_strimwidth($preview, 0, 180, '…'),
            'created_at' => $conversion->created_at?->toIso8601String(),
        ];
    }
}
