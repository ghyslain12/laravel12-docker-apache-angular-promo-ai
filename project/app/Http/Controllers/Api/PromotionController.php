<?php

namespace App\Http\Controllers\Api;

use App\Actions\Promotion\CalculateDiscountAction;
use App\Actions\Promotion\FindBestPromotionAction;
use App\Actions\Promotion\ValidateCouponAction;
use App\Exceptions\Promotion\CouponException;
use App\Http\Controllers\Controller;
use App\Http\Requests\PromotionStoreRequest;
use App\Http\Requests\PromotionUpdateRequest;
use App\Http\Resources\PromotionResource;
use App\Models\Material;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PromotionController extends Controller
{
    public function index(): JsonResponse
    {
        $promotions = Cache::remember('promotions_list', 3600, function () {
            return Promotion::all();
        });

        return response()->json(PromotionResource::collection($promotions));
    }

    public function store(PromotionStoreRequest $request): JsonResponse
    {
        $ticket = Promotion::create($request->validated());

        return (new PromotionResource($ticket->load(['material'])))->response()->setStatusCode(201);
    }

    public function show(Promotion $promotion): JsonResponse
    {
        return response()->json(new PromotionResource($promotion->load(['material'])));
    }

    public function update(PromotionUpdateRequest $request, Promotion $promotion): JsonResponse
    {
        $promotion->update($request->validated());

        return (new PromotionResource($promotion->load(['material'])))->response();
    }

    public function destroy(Promotion $promotion): JsonResponse
    {
        $promotion->delete();

        return response()->json(null, 204);
    }

    public function validateCoupon(
        Request                $request,
        ValidateCouponAction   $validate,
        CalculateDiscountAction $calculate
    ): JsonResponse {
        $request->validate([
            'code'        => 'required|string|max:30',
            'material_id' => 'nullable|exists:materials,id',
        ]);

        try {
            $material  = $request->filled('material_id')
                ? Material::findOrFail($request->input('material_id'))
                : null;

            $promotion = $validate->execute($request->input('code'), $material);

            $preview = null;
            if ($material) {
                $preview = $calculate->execute((float) $material->price, $promotion);
            }

            return response()->json([
                'valid'     => true,
                'promotion' => new PromotionResource($promotion),
                'preview'   => $preview,
            ]);

        } catch (CouponException $e) {
            return response()->json([
                'valid'      => false,
                'error_code' => $e->getErrorCode(),
                'message'    => $e->getMessage(),
            ], 422);
        }
    }

    public function materialPromotion(
        Material               $material,
        FindBestPromotionAction $find,
        CalculateDiscountAction $calculate
    ): JsonResponse {
        $promotion = $find->execute($material);

        if (!$promotion) {
            return response()->json(['promotion' => null, 'preview' => null]);
        }

        $preview = $calculate->execute((float) $material->price, $promotion);

        return response()->json([
            'promotion' => new PromotionResource($promotion),
            'preview'   => $preview,
        ]);
    }
}
