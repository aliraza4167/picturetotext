<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\ConverterController;
use Illuminate\Support\Facades\Route;

Route::get('/', [ConverterController::class, 'index'])->name('home');

Route::inertia('about', 'About')->name('about');
Route::redirect('about-us', '/about');

Route::inertia('pricing', 'Pricing')->name('pricing');

Route::inertia('contact', 'Contact')->name('contact');
Route::redirect('contact-us', '/contact');
Route::post('contact', [ContactController::class, 'store'])->name('contact.store');

Route::middleware(['auth'])->group(function () {
    Route::post('conversions', [ConverterController::class, 'store'])->name('conversions.store');
    Route::get('conversions/{conversion}', [ConverterController::class, 'show'])->name('conversions.show');
    Route::delete('conversions/{conversion}', [ConverterController::class, 'destroy'])->name('conversions.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'Dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
