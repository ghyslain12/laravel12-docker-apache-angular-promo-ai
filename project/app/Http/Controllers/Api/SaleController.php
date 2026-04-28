<?php

namespace App\Http\Controllers\Api;

use App\Actions\Promotion\CalculateDiscountAction;
use App\Actions\Promotion\FindBestPromotionAction;
use App\Exceptions\Promotion\CouponException;
use App\Http\Controllers\Controller;
use App\Http\Requests\SaleStoreRequest;
use App\Http\Requests\SaleUpdateRequest;
use App\Http\Resources\SaleResource;
use App\Models\Material;
use App\Models\Sale;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class SaleController extends Controller
{
    public function __construct(
        private readonly FindBestPromotionAction $findPromotion,
        private readonly CalculateDiscountAction $calculateDiscount,
    ) {}

    public function index(): JsonResponse
    {
        $sales = Cache::remember('sales_list', 3600, function () {
            return Sale::with(['customer', 'materials', 'tickets'])->get();
        });

        return response()->json(SaleResource::collection($sales));
    }

    public function store(SaleStoreRequest $request): JsonResponse
    {
        $sale = Sale::create($request->validated());

        if ($request->has('materials')) {
            $pivotData = $this->buildPivotData(
                $request->input('materials'),
                $request->input('coupon_code')
            );
            $sale->materials()->attach($pivotData);
        }

        return (new SaleResource($sale->load(['customer', 'materials', 'tickets'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Sale $sale): JsonResponse
    {
        return response()->json(
            new SaleResource($sale->load(['customer', 'materials', 'tickets']))
        );
    }

    public function update(SaleUpdateRequest $request, Sale $sale): JsonResponse
    {
        $sale->update($request->validated());

        if ($request->has('materials')) {
            $pivotData = $this->buildPivotData(
                $request->input('materials'),
                $request->input('coupon_code')
            );
            $sale->materials()->sync($pivotData);
        }

        return response()->json(
            new SaleResource($sale->load(['customer', 'materials', 'tickets']))
        );
    }

    public function destroy(Sale $sale): JsonResponse
    {
        $sale->delete();

        return response()->json(null, 204);
    }

    private function buildPivotData(array $materials, ?string $couponCode = null): array
    {
        $pivot = [];

        foreach ($materials as $item) {
            $materialId = is_array($item) ? $item['id'] : $item;
            $material   = Material::find($materialId);

            if (!$material) continue;

            try {
                $promotion = $this->findPromotion->execute($material, $couponCode);
            } catch (CouponException $ex) {
                $promotion = null;
            }

            $pivot[$materialId] = $this->calculateDiscount->execute(
                (float) $material->price,
                $promotion
            );
        }

        return $pivot;
    }
}

