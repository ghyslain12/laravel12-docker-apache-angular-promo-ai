<?php

namespace App\Services;

use App\Models\Sale;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\Http;

class InvoiceService
{
    public const SUPPORTED_COUNTRIES = [
        'fr' => 'France',
        'be' => 'Belgique',
        'es' => 'Espagne',
        'nl' => 'Pays-Bas',
        'al' => 'Allemagne',
        'uk' => 'Royaume-Uni',
        'us' => 'États-Unis',
    ];

    public function generate(Sale $sale, string $countryCode): string
    {
        $countryCode = strtolower($countryCode);

        if (!isset(self::SUPPORTED_COUNTRIES[$countryCode])) {
            throw new \InvalidArgumentException("Country '{$countryCode}' not supported.");
        }

        $saleData = $this->buildSaleData($sale);
        $html     = $this->generateHtmlViaAI($saleData, $countryCode, self::SUPPORTED_COUNTRIES[$countryCode]);
        $filePath = $this->getFilePath($sale->id);

        $dir = dirname($filePath);
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }

        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', false);
        $options->set('defaultFont', 'Arial');

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        file_put_contents($filePath, $dompdf->output());

        return $filePath;
    }

    public function getFilePath(int $saleId): string
    {
        return storage_path("invoices/{$saleId}-bill.pdf");
    }

    public function fileExists(int $saleId): bool
    {
        return file_exists($this->getFilePath($saleId));
    }

    private function generateHtmlViaAI(array $saleData, string $countryCode, string $countryName): string
    {
        $prompt = $this->buildPrompt($saleData, $countryCode, $countryName);

        $response = Http::withToken(config('services.groq.api_key'))
            ->timeout(30)
            ->post('https://api.groq.com/openai/v1/chat/completions', [
                'model'       => 'llama-3.3-70b-versatile',
                'temperature' => 0.2,
                'messages'    => [
                    [
                        'role'    => 'system',
                        'content' => 'You are a professional invoice generator. Output ONLY valid HTML/CSS.',
                    ],
                    [
                        'role'    => 'user',
                        'content' => $prompt,
                    ],
                ],
            ]);

        $html = $response->json('choices.0.message.content', '');

        // Strip markdown fences if AI wrapped in ```html ... ```
        $html = preg_replace('/^```html\s*/i', '', trim($html));
        $html = preg_replace('/\s*```$/', '', $html);

        if (empty(trim($html)) || !str_contains($html, '<html')) {
            return $this->fallbackHtml($saleData, $countryName);
        }

        return $html;
    }

    private function buildPrompt(array $sale, string $countryCode, string $countryName): string
    {
        $linesJson = json_encode($sale['lines'], JSON_UNESCAPED_UNICODE);
        $date      = now()->format('Y-m-d');

        return <<<PROMPT
You are a billing expert. Generate a complete, professional HTML invoice for the following sale, applying ALL fiscal and legal requirements for {$countryName} ({$countryCode}).

SALE DATA:
- Invoice number: INV-{$sale['id']}-{$date}
- Date: {$date}
- Sale title: {$sale['titre']}
- Description: {$sale['description']}
- Client: {$sale['customer']}
- Items (JSON): {$linesJson}

YOUR TASK:
1. Apply the correct fiscal rules for {$countryName}: VAT/tax rates, tax label (TVA/VAT/IVA/BTW/MwSt/etc.), currency symbol, date format, number format.
2. Include ALL mandatory legal mentions required on invoices in {$countryName} (e.g. for France: numéro SIRET, mentions TVA, conditions de paiement, pénalités de retard, etc.).
3. Calculate totals correctly: subtotal HT, tax amount, total TTC. For countries with no VAT (like US), mention applicable state tax rules.
4. Show crossed-out original price when there is a discount (original_price > final_price).
5. Use a clean, professional layout with these colors: header background #1a3a5c (white text), alternating row backgrounds.

IMPORTANT:
- Respond with ONLY the complete HTML document (starting with <!DOCTYPE html>). No markdown, no explanation.
- Use inline CSS only (no external stylesheets), compatible with dompdf PDF rendering.
- All text in the language of {$countryName}.
- Include a footer with all legally required mentions for {$countryName}.
PROMPT;
    }

    private function buildSaleData(Sale $sale): array
    {
        $sale->loadMissing(['customer', 'materials']);

        $lines = $sale->materials->map(fn($m) => [
            'designation'    => $m->designation,
            'original_price' => (float) ($m->pivot->original_price ?? $m->price ?? 0),
            'final_price'    => (float) ($m->pivot->final_price    ?? $m->price ?? 0),
            'discount'       => (float) ($m->pivot->discount_amount ?? 0),
        ])->toArray();

        return [
            'id'          => $sale->id,
            'titre'       => $sale->titre ?? '',
            'description' => $sale->description ?? '',
            'customer'    => $sale->customer?->surnom ?? '',
            'lines'       => $lines,
        ];
    }

    private function fallbackHtml(array $sale, string $countryName): string
    {
        $rows = '';
        foreach ($sale['lines'] as $line) {
            $rows .= '<tr>'
                . '<td>' . htmlspecialchars($line['designation']) . '</td>'
                . '<td style="text-align:right">' . number_format($line['final_price'], 2) . '</td>'
                . '</tr>';
        }

        return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>'
            . 'body{font-family:Arial,sans-serif;padding:20px}'
            . '.hdr{background:#1a3a5c;color:white;padding:16px}'
            . 'table{width:100%;border-collapse:collapse;margin-top:16px}'
            . 'th{background:#1a3a5c;color:white;padding:8px}'
            . 'td{padding:8px;border-bottom:1px solid #eee}'
            . '</style></head><body>'
            . '<div class="hdr"><h1>INVOICE — ' . htmlspecialchars($countryName) . '</h1></div>'
            . '<p><strong>Client:</strong> ' . htmlspecialchars($sale['customer']) . '</p>'
            . '<p><strong>Sale:</strong> ' . htmlspecialchars($sale['titre']) . '</p>'
            . '<table><tr><th>Item</th><th>Price</th></tr>' . $rows . '</table>'
            . '</body></html>';
    }
}
