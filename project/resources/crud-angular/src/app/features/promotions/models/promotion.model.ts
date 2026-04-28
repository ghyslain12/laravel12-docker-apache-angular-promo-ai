export interface Promotion {
  id: number;
  name: string;
  code: string | null;
  type: 'percentage' | 'fixed_amount';
  value: number;
  target_type: 'material' | 'all' | 'coupon';
  target_id: number | null;
  starts_at: string | null;
  ends_at: string | null;
  usage_limit: number | null;
  per_customer_limit: number | null;
  times_used: number;
  priority: number;
  active: boolean;
  status: 'active' | 'disabled' | 'expired' | 'scheduled';
  discount_label: string;
  created_at: string;
  updated_at: string;
  material?: { id: number; designation: string };
}
