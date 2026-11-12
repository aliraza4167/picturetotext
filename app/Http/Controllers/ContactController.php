<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    /**
     * Handle incoming contact inquiries.
     */
    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255'],
            'topic' => ['nullable', 'string', 'max:100'],
            'subject' => ['required', 'string', 'max:200'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        Log::info('New contact submission received', [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'topic' => $validated['topic'] ?? 'General inquiry',
            'subject' => $validated['subject'],
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Thank you! Your message has been received. We will get back to you soon.',
            ]);
        }

        return back()->with('success', 'Thank you! Your message has been received. We will get back to you soon.');
    }
}

