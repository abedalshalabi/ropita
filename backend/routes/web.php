<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\SitemapController;

Route::get('/', function () {
    return view('welcome');
});

// Sitemap route
Route::get('/sitemap.xml', [SitemapController::class, 'index']);

/**
 * Temporary route to trigger specific migrations when CLI access is unavailable.
 * Secure it with an environment token: set MIGRATION_HTTP_TOKEN in .env (same as the ?token= value).
 * Example: /maintenance/run-migrations?token=SECRET123
 */
Route::post('/maintenance/run-migrations', function (Request $request) {
    $token = env('MIGRATION_HTTP_TOKEN');
    if (!$token || $request->query('token') !== $token) {
        abort(403, 'Unauthorized');
    }

    $paths = [
        'database/migrations/2026_04_06_000100_fix_about_story_content.php',
        'database/migrations/2026_04_06_120000_make_about_story_content_text.php',
        'database/migrations/2026_04_06_123000_add_about_story_image.php',
    ];

    $results = [];
    foreach ($paths as $path) {
        Artisan::call('migrate', [
            '--path'  => $path,
            '--force' => true,
        ]);
        $results[$path] = Artisan::output();
    }

    return response()->json([
        'message' => 'Migrations executed',
        'ran'     => $paths,
        'output'  => $results,
    ]);
});

/**
 * Temporary route to clear config cache when CLI access is unavailable.
 * Secure it with an environment token: set CONFIG_CLEAR_HTTP_TOKEN in .env (same as the ?token= value).
 * Example: /maintenance/clear-config?token=SECRET123
 */
Route::match(['GET', 'POST'], '/maintenance/clear-config', function (Request $request) {
    $token = env('CONFIG_CLEAR_HTTP_TOKEN');

    if (!$token || $request->query('token') !== $token) {
        abort(403, 'Unauthorized');
    }

    Artisan::call('config:clear');

    return response()->json([
        'message' => 'Config cache cleared successfully',
        'output' => trim(Artisan::output()),
    ]);
});

/**
 * Temporary route to send a simple test email when CLI access is unavailable.
 * Secure it with an environment token: set MAIL_TEST_HTTP_TOKEN in .env (same as the ?token= value).
 * Example: /maintenance/test-mail?token=SECRET123&to=name@example.com
 */
Route::match(['GET', 'POST'], '/maintenance/test-mail', function (Request $request) {
    $token = env('MAIL_TEST_HTTP_TOKEN');

    if (!$token || $request->query('token') !== $token) {
        abort(403, 'Unauthorized');
    }

    $to = $request->query('to', env('MAIL_FROM_ADDRESS'));

    if (!$to || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
        return response()->json([
            'message' => 'A valid recipient email is required',
        ], 422);
    }

    try {
        Mail::raw(
            "This is a test email from Ropita.\nSent at: " . now()->toDateTimeString() . "\nMailer: " . config('mail.default'),
            function ($message) use ($to) {
                $message
                    ->to($to)
                    ->subject('Ropita Test Email');
            }
        );

        return response()->json([
            'message' => 'Test email sent successfully',
            'to' => $to,
            'mail' => [
                'default' => config('mail.default'),
                'host' => config('mail.mailers.smtp.host'),
                'port' => config('mail.mailers.smtp.port'),
                'scheme' => config('mail.mailers.smtp.scheme'),
                'username' => config('mail.mailers.smtp.username'),
                'from' => config('mail.from.address'),
            ],
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'message' => 'Failed to send test email',
            'to' => $to,
            'error' => $e->getMessage(),
            'mail' => [
                'default' => config('mail.default'),
                'host' => config('mail.mailers.smtp.host'),
                'port' => config('mail.mailers.smtp.port'),
                'scheme' => config('mail.mailers.smtp.scheme'),
                'username' => config('mail.mailers.smtp.username'),
                'from' => config('mail.from.address'),
            ],
        ], 500);
    }
});
