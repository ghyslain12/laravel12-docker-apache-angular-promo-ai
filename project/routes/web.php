<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/docs/api-docs.yaml', function () {
    $filePath = '/var/www/storage/api-docs/api-docs.yaml';
    if (file_exists($filePath)) {
        $content = file_get_contents($filePath);
        return Response::make($content, 200, [
            'Content-Type' => 'application/yaml',
            'Content-Disposition' => 'inline',
        ]);
    }
    abort(404, 'File not found');
});

Route::get('/crud-angular/{any?}', function () {
    return file_get_contents('/var/www/public/crud-angular/index.html');
})->where('any', '.*');

Route::get('/test-vitesse', function () {
    return 'ok';
});

Route::get('/test-frontend', function () {
    $isViteReady = file_exists(public_path('hot')) || file_exists(public_path('build/manifest.json'));

    if (!$isViteReady) {
        return response()->view('errors.vite', [], 500);
    }

    return view('app');
});

