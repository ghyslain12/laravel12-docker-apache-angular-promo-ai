<?php

use App\Models\Customer;
use App\Models\Material;
use App\Models\Sale;
use App\Services\InvoiceService;
use Illuminate\Support\Facades\Http;

function fakeGroqHtml(string $html = '<html><body><h1>Test Invoice</h1></body></html>'): void
{
    Http::fake([
        'api.groq.com/*' => Http::response([
            'choices' => [
                ['message' => ['content' => $html]],
            ],
        ], 200),
    ]);
}

function fakeGroqEmpty(): void
{
    Http::fake([
        'api.groq.com/*' => Http::response([
            'choices' => [
                ['message' => ['content' => '']],
            ],
        ], 200),
    ]);
}

it('returns 401 on generate without auth', function () {
    $sale = Sale::factory()->create();
    $this->postJson("/api/sale/{$sale->id}/invoice/fr")
        ->assertUnauthorized();
});

it('returns 401 on download without auth', function () {
    $sale = Sale::factory()->create();
    $this->getJson("/api/sale/{$sale->id}/invoice/fr/download")
        ->assertUnauthorized();
});

it('returns 404 for unknown sale', function () {
    fakeGroqHtml();
    $token = $this->getAuthToken();

    $this->withToken($token)
        ->postJson('/api/sale/99999/invoice/fr')
        ->assertNotFound();
});

it('returns 422 for unsupported country', function () {
    fakeGroqHtml();
    $token    = $this->getAuthToken();
    $customer = Customer::factory()->create();
    $sale     = Sale::factory()->create(['customer_id' => $customer->id]);

    $this->withToken($token)
        ->postJson("/api/sale/{$sale->id}/invoice/xx")
        ->assertUnprocessable()
        ->assertJson([
            'error' => "Country 'xx' not supported. Available: fr, be, es, nl, al, uk, us"
        ]);
});

it('generates invoice for France and returns 201', function () {
    fakeGroqHtml('<!DOCTYPE html><html><body><h1>Facture France</h1><p>TVA 20%</p></body></html>');
    $token    = $this->getAuthToken();
    $customer = Customer::factory()->create();
    $material = Material::factory()->create(['price' => 100.00, 'designation' => 'Modem XG']);
    $sale     = Sale::factory()->create(['customer_id' => $customer->id, 'titre' => 'Vente Test']);

    $sale->materials()->attach($material->id, [
        'original_price'      => 100.00,
        'discount_amount'     => 20.00,
        'discount_percentage' => 20.00,
        'final_price'         => 80.00,
        'promotion_id'        => null,
    ]);

    $response = $this->withToken($token)
        ->postJson("/api/sale/{$sale->id}/invoice/fr")
        ->assertCreated();

    expect($response->json('success'))->toBeTrue()
        ->and($response->json('country'))->toBe('France')
        ->and($response->json('filename'))->toBe("{$sale->id}-bill.pdf")
        ->and($response->json('download_url'))->toContain('/download');

    Http::assertSent(fn($req) => str_contains($req->url(), 'groq.com'));
});

it('generates invoice for all supported countries', function () {
    $token    = $this->getAuthToken();
    $customer = Customer::factory()->create();
    $sale     = Sale::factory()->create(['customer_id' => $customer->id]);
    $material = Material::factory()->create(['price' => 50.00]);
    $sale->materials()->attach($material->id, [
        'original_price' => 50.00, 'discount_amount' => 0,
        'discount_percentage' => 0, 'final_price' => 50.00, 'promotion_id' => null,
    ]);

    foreach (array_keys(InvoiceService::SUPPORTED_COUNTRIES) as $country) {
        fakeGroqHtml("<!DOCTYPE html><html><body>Invoice {$country}</body></html>");

        $this->withToken($token)
            ->postJson("/api/sale/{$sale->id}/invoice/{$country}")
            ->assertCreated("Failed for country: {$country}");
    }
});

it('overwrites previous invoice on second generation', function () {
    $token    = $this->getAuthToken();
    $customer = Customer::factory()->create();
    $sale     = Sale::factory()->create(['customer_id' => $customer->id]);
    $material = Material::factory()->create(['price' => 30.00]);
    $sale->materials()->attach($material->id, [
        'original_price' => 30.00, 'discount_amount' => 0,
        'discount_percentage' => 0, 'final_price' => 30.00, 'promotion_id' => null,
    ]);

    fakeGroqHtml('<html><body>v1</body></html>');
    $this->withToken($token)->postJson("/api/sale/{$sale->id}/invoice/be")->assertCreated();

    fakeGroqHtml('<html><body>v2</body></html>');
    $this->withToken($token)->postJson("/api/sale/{$sale->id}/invoice/be")->assertCreated();

    $service = app(InvoiceService::class);
    expect($service->fileExists($sale->id))->toBeTrue();
});

it('uses fallback html when AI returns empty content', function () {
    fakeGroqEmpty();
    $token    = $this->getAuthToken();
    $customer = Customer::factory()->create();
    $sale     = Sale::factory()->create(['customer_id' => $customer->id]);
    $material = Material::factory()->create(['price' => 25.00]);
    $sale->materials()->attach($material->id, [
        'original_price' => 25.00, 'discount_amount' => 0,
        'discount_percentage' => 0, 'final_price' => 25.00, 'promotion_id' => null,
    ]);

    $this->withToken($token)
        ->postJson("/api/sale/{$sale->id}/invoice/nl")
        ->assertCreated();
});

it('returns 404 on download when invoice not yet generated', function () {
    $token    = $this->getAuthToken();
    $customer = Customer::factory()->create();
    $sale     = Sale::factory()->create(['customer_id' => $customer->id]);

    $service  = app(InvoiceService::class);
    $filePath = $service->getFilePath($sale->id);
    if (file_exists($filePath)) {
        unlink($filePath);
    }

    $this->withToken($token)
        ->getJson("/api/sale/{$sale->id}/invoice/fr/download")
        ->assertNotFound();
});

it('downloads PDF after successful generation', function () {
    fakeGroqHtml('<!DOCTYPE html><html><body><h1>UK Invoice VAT 20%</h1></body></html>');
    $token    = $this->getAuthToken();
    $customer = Customer::factory()->create();
    $sale     = Sale::factory()->create(['customer_id' => $customer->id]);
    $material = Material::factory()->create(['price' => 45.00]);
    $sale->materials()->attach($material->id, [
        'original_price' => 45.00, 'discount_amount' => 0,
        'discount_percentage' => 0, 'final_price' => 45.00, 'promotion_id' => null,
    ]);

    $this->withToken($token)
        ->postJson("/api/sale/{$sale->id}/invoice/uk")
        ->assertCreated();

    $response = $this->withToken($token)
        ->get("/api/sale/{$sale->id}/invoice/uk/download");

    $response->assertOk()
        ->assertHeader('Content-Type', 'application/pdf');
});

it('has all 7 expected countries in SUPPORTED_COUNTRIES', function () {
    $expected = ['fr', 'be', 'es', 'nl', 'al', 'uk', 'us'];
    foreach ($expected as $code) {
        expect(InvoiceService::SUPPORTED_COUNTRIES)->toHaveKey($code);
    }
});

it('calls Groq API with correct model and prompt content', function () {
    fakeGroqHtml('<!DOCTYPE html><html><body>Test</body></html>');
    $token    = $this->getAuthToken();
    $customer = Customer::factory()->create();
    $sale     = Sale::factory()->create(['customer_id' => $customer->id, 'titre' => 'Ma Vente']);
    $material = Material::factory()->create(['price' => 60.00, 'designation' => 'Routeur']);
    $sale->materials()->attach($material->id, [
        'original_price' => 60.00, 'discount_amount' => 0,
        'discount_percentage' => 0, 'final_price' => 60.00, 'promotion_id' => null,
    ]);

    $this->withToken($token)->postJson("/api/sale/{$sale->id}/invoice/fr")->assertCreated();

    Http::assertSent(function ($request) {
        $body = $request->data();
        return str_contains($request->url(), 'groq.com')
            && $body['model'] === 'llama-3.3-70b-versatile'
            && str_contains($body['messages'][1]['content'], 'France')
            && str_contains($body['messages'][1]['content'], 'Routeur');
    });
});
