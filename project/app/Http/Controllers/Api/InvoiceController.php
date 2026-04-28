<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Services\InvoiceService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class InvoiceController extends Controller
{
    public function __construct(
        private readonly InvoiceService $invoiceService,
    ) {}

    public function generate(Sale $sale, string $country): JsonResponse
    {
        $countryCode = strtolower($country);

        if (!isset(InvoiceService::SUPPORTED_COUNTRIES[$countryCode])) {
            return response()->json([
                'error' => "Country '{$countryCode}' not supported. Available: "
                    . implode(', ', array_keys(InvoiceService::SUPPORTED_COUNTRIES)),
            ], 422);
        }

        try {
            $this->invoiceService->generate($sale, $countryCode);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'PDF generation failed: ' . $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'success'      => true,
            'download_url' => "/api/sale/{$sale->id}/invoice/{$countryCode}/download",
            'filename'     => "{$sale->id}-bill.pdf",
            'country'      => InvoiceService::SUPPORTED_COUNTRIES[$countryCode],
        ], 201);
    }

    public function download(Sale $sale, string $country): JsonResponse|BinaryFileResponse
    {
        if (!$this->invoiceService->fileExists($sale->id)) {
            return response()->json([
                'error' => 'Invoice not generated yet. Call POST first.',
            ], 404);
        }

        return response()->download(
            $this->invoiceService->getFilePath($sale->id),
            "{$sale->id}-bill.pdf",
            ['Content-Type' => 'application/pdf']
        );
    }
}
