export interface Material {
  id: number;
  designation: string;
  price: number;
  checked: boolean;
  pivot?: {
    original_price: number;
    discount_amount: number;
    discount_percentage: number;
    final_price: number;
    promotion_id: number | null;
  };
}
