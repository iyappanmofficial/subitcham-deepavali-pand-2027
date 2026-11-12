export type UserRole = 'admin' | 'staff' | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface BusinessSettings {
  id: string;
  company_name: string;
  company_logo_url?: string;
  company_phone: string;
  company_email: string;
  company_address: string;
  default_monthly_contribution: number;
  default_late_penalty: number;
  payment_deadline_day: number;
  timezone: string;
  currency_symbol: string;
  currency_code: string;
  footer_text: string;
}

export interface Scheme {
  id: string;
  name: string;
  description: string;
  monthly_amount: number;
  duration_months: number;
  deadline_day: number;
  default_penalty_amount: number;
  currency: string;
  is_active: boolean;
  created_at: string;
}

export interface SchemeCycle {
  id: string;
  scheme_id: string;
  cycle_name: string;
  start_date: string;
  end_date: string;
  deepavali_date: string;
  status: 'upcoming' | 'active' | 'completed' | 'archived';
  expected_customers: number;
  created_at: string;
}

export type CustomerStatus = 'active' | 'inactive' | 'completed' | 'defaulted';

export interface Customer {
  id: string;
  customer_code: string; // e.g. SDP-2026-0001
  user_id?: string;
  full_name: string;
  mobile: string;
  whatsapp?: string;
  address: string;
  joining_date: string;
  scheme_cycle_id: string;
  status: CustomerStatus;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Computed / joined fields:
  cycle_name?: string;
  total_expected_principal?: number;
  total_principal_paid?: number;
  total_principal_outstanding?: number;
  total_penalty_applied?: number;
  total_penalty_paid?: number;
  total_penalty_outstanding?: number;
  installments_completed_count?: number;
}

export interface Enrollment {
  id: string;
  customer_id: string;
  scheme_cycle_id: string;
  enrollment_date: string;
  status: 'active' | 'completed' | 'cancelled';
  total_principal_expected: number;
  total_principal_paid: number;
  total_penalty_paid: number;
  notes?: string;
  created_at: string;
}

export type InstallmentStatus = 'pending' | 'partial' | 'paid' | 'overdue';

export interface Installment {
  id: string;
  enrollment_id: string;
  customer_id: string;
  installment_number: number;
  month_name: string;
  month_year: string;
  due_date: string;
  deadline_date: string; // 15th
  principal_amount: number;
  principal_paid: number;
  penalty_amount: number;
  penalty_paid: number;
  status: InstallmentStatus;
  created_at: string;
  updated_at: string;
}

export type PaymentMethod = 'cash' | 'upi';
export type PaymentStatus = 'confirmed' | 'pending_verification' | 'rejected' | 'reversed';

export interface PaymentAllocation {
  id: string;
  payment_id: string;
  installment_id: string;
  principal_allocated: number;
  penalty_allocated: number;
  created_at: string;
  // joined info:
  installment_number?: number;
  month_name?: string;
}

export interface Payment {
  id: string;
  receipt_number: string;
  customer_id: string;
  enrollment_id: string;
  payment_date: string;
  amount: number;
  principal_allocated: number;
  penalty_allocated: number;
  payment_method: PaymentMethod;
  upi_reference?: string;
  collected_by?: string;
  collector_name?: string;
  notes?: string;
  status: PaymentStatus;
  idempotency_key?: string;
  reversal_reason?: string;
  reversed_at?: string;
  reversed_by?: string;
  created_at: string;
  // joined fields:
  customer_code?: string;
  customer_name?: string;
  customer_mobile?: string;
  allocations?: PaymentAllocation[];
}

export interface Penalty {
  id: string;
  installment_id: string;
  customer_id: string;
  amount: number;
  applied_date: string;
  status: 'unpaid' | 'paid' | 'waived';
  waived_by?: string;
  waive_reason?: string;
  reason?: string;
  created_at: string;
  // joined fields:
  installment_number?: number;
  month_name?: string;
  customer_name?: string;
  customer_code?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at: string;
}

export interface Product {
  id: string;
  category: string;
  name: string;
  unit: string;
  purchase_price: number;
  available_quantity: number;
  reorder_level: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductPurchase {
  id: string;
  invoice_number?: string;
  supplier_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  purchase_date: string;
  notes?: string;
  created_at: string;
  supplier_name?: string;
  product_name?: string;
  unit?: string;
}

export interface PackageProduct {
  id: string;
  scheme_cycle_id: string;
  product_id: string;
  quantity_per_package: number;
  unit: string;
  notes?: string;
  product_name?: string;
  purchase_price?: number;
}

export type DistributionStatus = 'not_prepared' | 'preparing' | 'ready' | 'delivered';

export interface Distribution {
  id: string;
  customer_id: string;
  enrollment_id: string;
  scheme_cycle_id: string;
  status: DistributionStatus;
  delivered_date?: string;
  delivered_by?: string;
  confirmed_by_name?: string;
  recipient_notes?: string;
  created_at: string;
  customer_name?: string;
  customer_code?: string;
  customer_mobile?: string;
  total_principal_paid?: number;
  is_eligible?: boolean;
}

export type ExpenseCategory = 
  | 'product_purchases'
  | 'transportation'
  | 'packaging'
  | 'staff_expenses'
  | 'rent'
  | 'electricity'
  | 'other';

export interface Expense {
  id: string;
  expense_code: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expense_date: string;
  payment_method: 'cash' | 'upi' | 'bank_transfer';
  supplier_id?: string;
  supplier_name?: string;
  invoice_attachment_url?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  user_role?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_data?: any;
  new_data?: any;
  ip_address?: string;
  notes?: string;
  created_at: string;
}

export interface DashboardSummary {
  totalCustomers: number;
  activeCustomers: number;
  completedCustomers: number;
  totalExpectedPrincipal: number;
  totalPrincipalCollected: number;
  totalPrincipalOutstanding: number;
  totalPenaltiesCollected: number;
  totalPenaltiesOutstanding: number;
  totalBusinessExpenses: number;
  totalProductPurchasingCosts: number;
  pendingPackageDistributions: number;
  deliveredPackageDistributions: number;
}

