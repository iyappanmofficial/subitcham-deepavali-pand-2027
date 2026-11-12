import {
  UserProfile,
  BusinessSettings,
  Scheme,
  SchemeCycle,
  Customer,
  Enrollment,
  Installment,
  Payment,
  PaymentAllocation,
  Penalty,
  Product,
  Supplier,
  ProductPurchase,
  PackageProduct,
  Distribution,
  Expense,
  AuditLog,
  DashboardSummary
} from '@/types';
import { calculateInstallmentDates, isPaymentPastDeadline, getTodayString } from './dateUtils';

const STORAGE_KEY = 'SDP_BUSINESS_DB_V1';

export interface DatabaseState {
  settings: BusinessSettings;
  users: UserProfile[];
  schemes: Scheme[];
  cycles: SchemeCycle[];
  customers: Customer[];
  enrollments: Enrollment[];
  installments: Installment[];
  payments: Payment[];
  allocations: PaymentAllocation[];
  penalties: Penalty[];
  products: Product[];
  suppliers: Supplier[];
  purchases: ProductPurchase[];
  packageProducts: PackageProduct[];
  distributions: Distribution[];
  expenses: Expense[];
  auditLogs: AuditLog[];
}

const DEFAULT_SETTINGS: BusinessSettings = {
  id: '00000000-0000-0000-0000-000000000001',
  company_name: 'Subitcham Deepavali Pand',
  company_logo_url: '',
  company_phone: '+91 98401 23456',
  company_email: 'admin@subitchampand.com',
  company_address: 'No. 45, Bazaar Street, Anna Nagar, Chennai, Tamil Nadu - 600040',
  default_monthly_contribution: 800,
  default_late_penalty: 50,
  payment_deadline_day: 15,
  timezone: 'Asia/Kolkata',
  currency_symbol: '₹',
  currency_code: 'INR',
  footer_text: '© 2026 Subitcham Deepavali Pand. All Rights Reserved.',
};

const DEFAULT_SCHEME: Scheme = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Subitcham 12-Month Deepavali Grocery Scheme',
  description: '12 months monthly ₹800 contribution for premium Deepavali grocery package',
  monthly_amount: 800,
  duration_months: 12,
  deadline_day: 15,
  default_penalty_amount: 50,
  currency: 'INR',
  is_active: true,
  created_at: '2025-10-01T10:00:00+05:30',
};

const DEFAULT_CYCLE: SchemeCycle = {
  id: '22222222-2222-2222-2222-222222222222',
  scheme_id: '11111111-1111-1111-1111-111111111111',
  cycle_name: 'Deepavali 2026 Cycle',
  start_date: '2025-11-01',
  end_date: '2026-10-31',
  deepavali_date: '2026-11-08',
  status: 'active',
  expected_customers: 100,
  created_at: '2025-10-15T10:00:00+05:30',
};

const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user-admin-1',
    email: 'admin@subitchampand.com',
    full_name: 'V. Ramanathan (Proprietor)',
    role: 'admin',
    phone: '+91 98401 23456',
    is_active: true,
    created_at: '2025-10-01T00:00:00+05:30',
  },
  {
    id: 'user-staff-1',
    email: 'staff@subitchampand.com',
    full_name: 'K. Senthil Kumar (Collection Agent)',
    role: 'staff',
    phone: '+91 94441 98765',
    is_active: true,
    created_at: '2025-10-10T00:00:00+05:30',
  },
  {
    id: 'user-cust-1',
    email: 'karthik@gmail.com',
    full_name: 'S. Karthikeyan',
    role: 'customer',
    phone: '9840011223',
    is_active: true,
    created_at: '2025-11-01T00:00:00+05:30',
  },
];

const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: 'supp-1',
    name: 'Sri Meenakshi Rice Mills',
    contact_person: 'Sundar Rajan',
    phone: '+91 98410 11223',
    email: 'sundar@meenakshirice.com',
    address: 'Kumbakonam Main Road, Thanjavur',
    notes: 'Grade-A Ponni Boiled Rice bulk supplier',
    created_at: '2025-10-20T10:00:00+05:30',
  },
  {
    id: 'supp-2',
    name: 'Vasantham Agro & Oils',
    contact_person: 'K. Murugan',
    phone: '+91 94440 33445',
    email: 'murugan@vasanthamoils.com',
    address: 'APMC Market Yard, Erode',
    notes: 'Refined sunflower oil and gingelly oil wholesaler',
    created_at: '2025-10-20T10:00:00+05:30',
  },
  {
    id: 'supp-3',
    name: 'Lakshmi Spices & Groceries',
    contact_person: 'Ramesh Kumar',
    phone: '+91 98840 55667',
    email: 'ramesh@lakshmispices.com',
    address: 'Kothawalchavadi, George Town, Chennai',
    notes: 'Direct wholesale sugar, toor dal, and spices',
    created_at: '2025-10-20T10:00:00+05:30',
  },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    category: 'Rice',
    name: 'Ponni Boiled Rice (Premium)',
    unit: 'kg',
    purchase_price: 58,
    available_quantity: 1200,
    reorder_level: 200,
    is_active: true,
    created_at: '2025-10-25T10:00:00+05:30',
  },
  {
    id: 'prod-2',
    category: 'Oil',
    name: 'Gold Winner Refined Sunflower Oil',
    unit: 'L',
    purchase_price: 115,
    available_quantity: 150,
    reorder_level: 50,
    is_active: true,
    created_at: '2025-10-25T10:00:00+05:30',
  },
  {
    id: 'prod-3',
    category: 'Sugar',
    name: 'Pure White Crystal Sugar',
    unit: 'kg',
    purchase_price: 42,
    available_quantity: 300,
    reorder_level: 50,
    is_active: true,
    created_at: '2025-10-25T10:00:00+05:30',
  },
  {
    id: 'prod-4',
    category: 'Dal',
    name: 'First Grade Toor Dal (Oorai)',
    unit: 'kg',
    purchase_price: 145,
    available_quantity: 200,
    reorder_level: 40,
    is_active: true,
    created_at: '2025-10-25T10:00:00+05:30',
  },
  {
    id: 'prod-5',
    category: 'Spices',
    name: 'Deepavali Special Masala & Spices Combo',
    unit: 'pkt',
    purchase_price: 180,
    available_quantity: 100,
    reorder_level: 20,
    is_active: true,
    created_at: '2025-10-25T10:00:00+05:30',
  },
  {
    id: 'prod-6',
    category: 'Grocery',
    name: 'Deepavali Sweets & Mixture Gift Pack',
    unit: 'box',
    purchase_price: 220,
    available_quantity: 100,
    reorder_level: 20,
    is_active: true,
    created_at: '2025-10-25T10:00:00+05:30',
  },
];

const DEFAULT_PACKAGE_PRODUCTS: PackageProduct[] = [
  {
    id: 'pkg-prod-1',
    scheme_cycle_id: '22222222-2222-2222-2222-222222222222',
    product_id: 'prod-1',
    quantity_per_package: 10,
    unit: 'kg',
    notes: '10kg Ponni Boiled Rice bag',
  },
  {
    id: 'pkg-prod-2',
    scheme_cycle_id: '22222222-2222-2222-2222-222222222222',
    product_id: 'prod-2',
    quantity_per_package: 1,
    unit: 'L',
    notes: '1 Litre sunflower oil pouch',
  },
  {
    id: 'pkg-prod-3',
    scheme_cycle_id: '22222222-2222-2222-2222-222222222222',
    product_id: 'prod-3',
    quantity_per_package: 2,
    unit: 'kg',
    notes: '2kg crystal sugar',
  },
  {
    id: 'pkg-prod-4',
    scheme_cycle_id: '22222222-2222-2222-2222-222222222222',
    product_id: 'prod-4',
    quantity_per_package: 1,
    unit: 'kg',
    notes: '1kg premium toor dal',
  },
  {
    id: 'pkg-prod-5',
    scheme_cycle_id: '22222222-2222-2222-2222-222222222222',
    product_id: 'prod-5',
    quantity_per_package: 1,
    unit: 'pkt',
    notes: 'Festive spice mix combo',
  },
  {
    id: 'pkg-prod-6',
    scheme_cycle_id: '22222222-2222-2222-2222-222222222222',
    product_id: 'prod-6',
    quantity_per_package: 1,
    unit: 'box',
    notes: 'Festive sweets and mixture combo box',
  },
];

const DEFAULT_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    expense_code: 'EXP-2025-001',
    category: 'product_purchases',
    description: 'Advance wholesale purchase for Ponni rice (1200 kg)',
    amount: 69600,
    expense_date: '2025-11-05',
    payment_method: 'bank_transfer',
    supplier_id: 'supp-1',
    supplier_name: 'Sri Meenakshi Rice Mills',
    created_at: '2025-11-05T14:30:00+05:30',
  },
  {
    id: 'exp-2',
    expense_code: 'EXP-2025-002',
    category: 'packaging',
    description: 'Custom Deepavali jute and non-woven printed bags (100 bags)',
    amount: 3500,
    expense_date: '2025-11-12',
    payment_method: 'cash',
    created_at: '2025-11-12T11:00:00+05:30',
  },
  {
    id: 'exp-3',
    expense_code: 'EXP-2025-003',
    category: 'transportation',
    description: 'Goods tempo delivery charges from Thanjavur mill to Chennai godown',
    amount: 2800,
    expense_date: '2025-11-15',
    payment_method: 'cash',
    created_at: '2025-11-15T16:00:00+05:30',
  },
];

class DatabaseEngine {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadState();
    if (this.state.customers.length === 0) {
      this.seedInitialCustomers();
    }
  }

  private loadState(): DatabaseState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using in-memory state');
    }

    return {
      settings: DEFAULT_SETTINGS,
      users: DEFAULT_USERS,
      schemes: [DEFAULT_SCHEME],
      cycles: [DEFAULT_CYCLE],
      customers: [],
      enrollments: [],
      installments: [],
      payments: [],
      allocations: [],
      penalties: [],
      products: DEFAULT_PRODUCTS,
      suppliers: DEFAULT_SUPPLIERS,
      purchases: [],
      packageProducts: DEFAULT_PACKAGE_PRODUCTS,
      distributions: [],
      expenses: DEFAULT_EXPENSES,
      auditLogs: [],
    };
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save database state to localStorage', e);
    }
  }

  public resetToFactory(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.state = {
      settings: DEFAULT_SETTINGS,
      users: DEFAULT_USERS,
      schemes: [DEFAULT_SCHEME],
      cycles: [DEFAULT_CYCLE],
      customers: [],
      enrollments: [],
      installments: [],
      payments: [],
      allocations: [],
      penalties: [],
      products: DEFAULT_PRODUCTS,
      suppliers: DEFAULT_SUPPLIERS,
      purchases: [],
      packageProducts: DEFAULT_PACKAGE_PRODUCTS,
      distributions: [],
      expenses: DEFAULT_EXPENSES,
      auditLogs: [],
    };
    this.seedInitialCustomers();
    this.saveState();
  }

  // Pre-seed realistic test customers matching the exact test requirements
  private seedInitialCustomers(): void {
    const cycle = this.state.cycles[0];

    // Customer 1: On-time payments (Scenarios 1)
    const c1 = this.registerCustomer({
      full_name: 'S. Karthikeyan',
      mobile: '9840011223',
      whatsapp: '9840011223',
      address: 'Plot 12, Sri Ram Nagar, Anna Nagar, Chennai - 600040',
      scheme_cycle_id: cycle.id,
      joining_date: '2025-11-01',
      notes: 'Prompt payer, preferred method UPI',
      user_id: 'user-cust-1',
    });
    // Record payment 1: ₹800 on 2025-11-10 (before 15th) -> 0 penalty
    this.recordPayment({
      customer_id: c1.customer_id,
      amount: 800,
      payment_method: 'upi',
      payment_date: '2025-11-10T11:00:00+05:30',
      upi_reference: 'UPI/531512938101',
      collector_name: 'K. Senthil Kumar',
      notes: 'Month 1 contribution',
    });
    // Record payment 2: ₹800 on 2025-12-12 (before 15th) -> 0 penalty
    this.recordPayment({
      customer_id: c1.customer_id,
      amount: 800,
      payment_method: 'upi',
      payment_date: '2025-12-12T15:20:00+05:30',
      upi_reference: 'UPI/534718290482',
      collector_name: 'K. Senthil Kumar',
      notes: 'Month 2 contribution',
    });

    // Customer 2: Paid after 15th with ₹800 (Scenario 2 & 3)
    // Pays ₹800 after 15th -> ₹800 goes to principal, ₹50 penalty outstanding!
    const c2 = this.registerCustomer({
      full_name: 'M. Anandhi',
      mobile: '9789023456',
      whatsapp: '9789023456',
      address: '24/1, Gandhi Street, Villivakkam, Chennai - 600049',
      scheme_cycle_id: cycle.id,
      joining_date: '2025-11-01',
      notes: 'Grocery store customer',
    });
    this.recordPayment({
      customer_id: c2.customer_id,
      amount: 800,
      payment_method: 'cash',
      payment_date: '2025-11-20T17:45:00+05:30', // After 15th
      collector_name: 'K. Senthil Kumar',
      notes: 'Paid late in cash for Month 1',
    });

    // Customer 3: Paid ₹850 after 15th (Scenario 4)
    // ₹800 to principal, ₹50 to penalty, ₹0 outstanding!
    const c3 = this.registerCustomer({
      full_name: 'R. Balasubramanian',
      mobile: '9841134567',
      whatsapp: '9841134567',
      address: '7B, 2nd Main Road, Ambattur, Chennai - 600053',
      scheme_cycle_id: cycle.id,
      joining_date: '2025-11-01',
      notes: 'Pays with fine whenever late',
    });
    this.recordPayment({
      customer_id: c3.customer_id,
      amount: 850,
      payment_method: 'upi',
      payment_date: '2025-11-18T10:30:00+05:30', // After 15th
      upi_reference: 'UPI/532398471203',
      collector_name: 'K. Senthil Kumar',
      notes: 'Month 1 payment including ₹50 late fine',
    });

    // Customer 4: Partial Payment (Scenario 5)
    // Pays ₹400 before 15th, after 15th ₹50 penalty applies
    const c4 = this.registerCustomer({
      full_name: 'D. Selvi',
      mobile: '9445145678',
      whatsapp: '9445145678',
      address: '15, School Street, Padi, Chennai - 600050',
      scheme_cycle_id: cycle.id,
      joining_date: '2025-11-01',
      notes: 'Requested partial installments',
    });
    this.recordPayment({
      customer_id: c4.customer_id,
      amount: 400,
      payment_method: 'cash',
      payment_date: '2025-11-10T12:00:00+05:30', // Before 15th
      collector_name: 'K. Senthil Kumar',
      notes: 'Month 1 partial payment',
    });

    // Customer 5: Multi-stage partial payment (Scenario 6)
    // Customer pays ₹500 before 15th. Later pays ₹350 after 15th -> ₹300 to principal, ₹50 to penalty!
    const c5 = this.registerCustomer({
      full_name: 'T. Murugesan',
      mobile: '9884256789',
      whatsapp: '9884256789',
      address: '102, Bharathi Road, Mogappair East, Chennai - 600037',
      scheme_cycle_id: cycle.id,
      joining_date: '2025-11-01',
      notes: 'Scenario 6 test customer',
    });
    this.recordPayment({
      customer_id: c5.customer_id,
      amount: 500,
      payment_method: 'cash',
      payment_date: '2025-11-08T11:00:00+05:30', // Before 15th
      collector_name: 'K. Senthil Kumar',
      notes: 'First partial payment Month 1',
    });
    this.recordPayment({
      customer_id: c5.customer_id,
      amount: 350,
      payment_method: 'cash',
      payment_date: '2025-11-22T16:00:00+05:30', // After 15th: ₹300 goes to principal, ₹50 to penalty
      collector_name: 'K. Senthil Kumar',
      notes: 'Settled remaining Month 1 + penalty',
    });

    this.saveState();
  }

  // --- BUSINESS SETTINGS ---
  public getSettings(): BusinessSettings {
    return { ...this.state.settings };
  }

  public updateSettings(settings: Partial<BusinessSettings>, userId?: string): BusinessSettings {
    this.state.settings = { ...this.state.settings, ...settings };
    this.addAuditLog('UPDATE_SETTINGS', 'business_settings', this.state.settings.id, undefined, settings, userId);
    this.saveState();
    return this.getSettings();
  }

  // --- SCHEMES & CYCLES ---
  public getSchemes(): Scheme[] {
    return [...this.state.schemes];
  }

  public getCycles(): SchemeCycle[] {
    return [...this.state.cycles];
  }

  public getActiveCycle(): SchemeCycle {
    const active = this.state.cycles.find(c => c.status === 'active');
    return active || this.state.cycles[0];
  }

  public createCycle(cycleData: Omit<SchemeCycle, 'id' | 'created_at'>): SchemeCycle {
    const newCycle: SchemeCycle = {
      ...cycleData,
      id: 'cycle-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    this.state.cycles.push(newCycle);
    this.addAuditLog('CREATE_CYCLE', 'scheme_cycles', newCycle.id, undefined, newCycle);
    this.saveState();
    return newCycle;
  }

  // --- CUSTOMER MANAGEMENT ---
  public getCustomers(filter?: { cycleId?: string; search?: string; status?: string }): Customer[] {
    let list = this.state.customers.map(c => this.enrichCustomer(c));

    if (filter?.cycleId) {
      list = list.filter(c => c.scheme_cycle_id === filter.cycleId);
    }
    if (filter?.status && filter.status !== 'all') {
      list = list.filter(c => c.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(c =>
        c.full_name.toLowerCase().includes(q) ||
        c.customer_code.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        (c.address && c.address.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => a.customer_code.localeCompare(b.customer_code));
  }

  public getCustomerById(id: string): Customer | null {
    const c = this.state.customers.find(item => item.id === id || item.customer_code === id);
    if (!c) return null;
    return this.enrichCustomer(c);
  }

  public getCustomerByUserId(userId: string): Customer | null {
    const c = this.state.customers.find(item => item.user_id === userId);
    if (!c) return null;
    return this.enrichCustomer(c);
  }

  private enrichCustomer(c: Customer): Customer {
    const cycle = this.state.cycles.find(cy => cy.id === c.scheme_cycle_id);
    const installments = this.state.installments.filter(i => i.customer_id === c.id);

    const total_expected_principal = installments.reduce((acc, i) => acc + i.principal_amount, 0);
    const total_principal_paid = installments.reduce((acc, i) => acc + i.principal_paid, 0);
    const total_principal_outstanding = Math.max(0, total_expected_principal - total_principal_paid);

    const total_penalty_applied = installments.reduce((acc, i) => acc + i.penalty_amount, 0);
    const total_penalty_paid = installments.reduce((acc, i) => acc + i.penalty_paid, 0);
    const total_penalty_outstanding = Math.max(0, total_penalty_applied - total_penalty_paid);

    const installments_completed_count = installments.filter(i => i.principal_paid >= i.principal_amount).length;

    return {
      ...c,
      cycle_name: cycle?.cycle_name || 'Active Cycle',
      total_expected_principal,
      total_principal_paid,
      total_principal_outstanding,
      total_penalty_applied,
      total_penalty_paid,
      total_penalty_outstanding,
      installments_completed_count,
    };
  }

  public registerCustomer(params: {
    full_name: string;
    mobile: string;
    whatsapp?: string;
    address: string;
    scheme_cycle_id: string;
    joining_date?: string;
    notes?: string;
    created_by?: string;
    user_id?: string;
  }): { customer_id: string; customer_code: string; enrollment_id: string } {
    // Check duplicate mobile in same cycle
    const duplicate = this.state.customers.find(
      c => c.mobile.replace(/\D/g, '') === params.mobile.replace(/\D/g, '') &&
           c.scheme_cycle_id === params.scheme_cycle_id &&
           c.status !== 'inactive'
    );
    if (duplicate) {
      throw new Error(`Customer with mobile number ${params.mobile} is already registered (${duplicate.customer_code} - ${duplicate.full_name})`);
    }

    const cycle = this.state.cycles.find(cy => cy.id === params.scheme_cycle_id) || this.getActiveCycle();
    const scheme = this.state.schemes[0];

    const cycleYear = new Date(cycle.start_date).getFullYear();
    const existingForYear = this.state.customers.filter(c => c.customer_code.startsWith(`SDP-${cycleYear}-`));
    const nextSeq = existingForYear.length + 1;
    const customer_code = `SDP-${cycleYear}-${String(nextSeq).padStart(4, '0')}`;

    const customerId = 'cust-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const enrollmentId = 'enr-' + Date.now();
    const joiningDate = params.joining_date || getTodayString();

    const newCustomer: Customer = {
      id: customerId,
      customer_code,
      user_id: params.user_id,
      full_name: params.full_name.trim(),
      mobile: params.mobile.trim(),
      whatsapp: params.whatsapp?.trim() || params.mobile.trim(),
      address: params.address.trim(),
      joining_date: joiningDate,
      scheme_cycle_id: cycle.id,
      status: 'active',
      notes: params.notes,
      created_by: params.created_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newEnrollment: Enrollment = {
      id: enrollmentId,
      customer_id: customerId,
      scheme_cycle_id: cycle.id,
      enrollment_date: joiningDate,
      status: 'active',
      total_principal_expected: scheme.monthly_amount * scheme.duration_months,
      total_principal_paid: 0,
      total_penalty_paid: 0,
      created_at: new Date().toISOString(),
    };

    // Create 12 Installments
    const newInstallments: Installment[] = [];
    for (let i = 1; i <= scheme.duration_months; i++) {
      const dates = calculateInstallmentDates(cycle.start_date, i, scheme.deadline_day);
      newInstallments.push({
        id: `inst-${customerId}-${i}`,
        enrollment_id: enrollmentId,
        customer_id: customerId,
        installment_number: i,
        month_name: dates.monthName,
        month_year: dates.monthYear,
        due_date: dates.dueDate,
        deadline_date: dates.deadlineDate,
        principal_amount: scheme.monthly_amount,
        principal_paid: 0,
        penalty_amount: 0,
        penalty_paid: 0,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Create Distribution record
    const newDistribution: Distribution = {
      id: 'dist-' + customerId,
      customer_id: customerId,
      enrollment_id: enrollmentId,
      scheme_cycle_id: cycle.id,
      status: 'not_prepared',
      created_at: new Date().toISOString(),
    };

    this.state.customers.push(newCustomer);
    this.state.enrollments.push(newEnrollment);
    this.state.installments.push(...newInstallments);
    this.state.distributions.push(newDistribution);

    this.addAuditLog('REGISTER_CUSTOMER', 'customers', customerId, undefined, {
      customer_code,
      full_name: newCustomer.full_name,
      mobile: newCustomer.mobile,
    });

    this.saveState();

    return {
      customer_id: customerId,
      customer_code,
      enrollment_id: enrollmentId,
    };
  }

  public updateCustomer(id: string, updates: Partial<Customer>): Customer {
    const idx = this.state.customers.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Customer not found');

    const old = this.state.customers[idx];
    this.state.customers[idx] = {
      ...old,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.addAuditLog('UPDATE_CUSTOMER', 'customers', id, old, updates);
    this.saveState();
    return this.enrichCustomer(this.state.customers[idx]);
  }

  // --- INSTALLMENTS ---
  public getInstallmentsByCustomer(customerId: string): Installment[] {
    return this.state.installments
      .filter(i => i.customer_id === customerId)
      .sort((a, b) => a.installment_number - b.installment_number);
  }

  // --- PENALTY LOGIC ---
  /**
   * Applies ₹50 late penalty once per installment for unpaid installments past deadline (15th)
   */
  public applyLatePenalties(asOfDate: string = getTodayString(), penaltyAmount = 50): number {
    let appliedCount = 0;
    const activeEnrollments = new Set(
      this.state.enrollments.filter(e => e.status === 'active').map(e => e.id)
    );

    for (const inst of this.state.installments) {
      if (!activeEnrollments.has(inst.enrollment_id)) continue;

      // Must be past deadline (strictly after the 15th)
      const isPast = isPaymentPastDeadline(asOfDate, inst.deadline_date);
      const isUnpaid = inst.principal_paid < inst.principal_amount;
      const alreadyHasPenalty = this.state.penalties.some(p => p.installment_id === inst.id);

      if (isPast && isUnpaid && !alreadyHasPenalty) {
        // Record penalty
        const penaltyId = 'pen-' + inst.id;
        this.state.penalties.push({
          id: penaltyId,
          installment_id: inst.id,
          customer_id: inst.customer_id,
          amount: penaltyAmount,
          applied_date: new Date().toISOString(),
          status: 'unpaid',
          reason: 'Late payment after 15th deadline',
          created_at: new Date().toISOString(),
        });

        // Update installment
        inst.penalty_amount = penaltyAmount;
        inst.status = 'overdue';
        inst.updated_at = new Date().toISOString();
        appliedCount++;
      }
    }

    if (appliedCount > 0) {
      this.saveState();
    }
    return appliedCount;
  }

  // --- PAYMENT PROCESSING (ATOMIC PRINCIPAL-FIRST ALLOCATION) ---
  public recordPayment(params: {
    customer_id: string;
    amount: number;
    payment_method: 'cash' | 'upi';
    payment_date?: string;
    upi_reference?: string;
    collector_name?: string;
    collected_by?: string;
    notes?: string;
    idempotency_key?: string;
  }): { payment: Payment; allocations: PaymentAllocation[] } {
    if (params.amount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    // Idempotency check
    if (params.idempotency_key) {
      const existing = this.state.payments.find(p => p.idempotency_key === params.idempotency_key);
      if (existing) {
        const allocs = this.state.allocations.filter(a => a.payment_id === existing.id);
        return { payment: existing, allocations: allocs };
      }
    }

    const customer = this.state.customers.find(c => c.id === params.customer_id);
    if (!customer) throw new Error('Customer not found');

    const enrollment = this.state.enrollments.find(
      e => e.customer_id === params.customer_id && e.status === 'active'
    );
    if (!enrollment) throw new Error('No active scheme enrollment found for this customer');

    const paymentDateStr = params.payment_date || new Date().toISOString();

    // Check deadlines as of payment date and apply late penalties if applicable
    this.applyLatePenalties(paymentDateStr.slice(0, 10));

    // Generate unique receipt number RCP-YYYY-XXXXX
    const year = new Date().getFullYear();
    const existingYearPayments = this.state.payments.filter(p => p.receipt_number.startsWith(`RCP-${year}-`));
    const nextReceiptSeq = existingYearPayments.length + 1;
    const receipt_number = `RCP-${year}-${String(nextReceiptSeq).padStart(5, '0')}`;

    const paymentId = 'pay-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    let remainingAmount = params.amount;
    let totalPrincipalAllocated = 0;
    let totalPenaltyAllocated = 0;
    const allocationsCreated: PaymentAllocation[] = [];

    // Get customer's installments sorted by installment number
    const customerInstallments = this.state.installments
      .filter(i => i.enrollment_id === enrollment.id)
      .sort((a, b) => a.installment_number - b.installment_number);

    // PASS 1: Allocate to PRINCIPAL FIRST (in order of installment_number)
    for (const inst of customerInstallments) {
      if (remainingAmount <= 0) break;

      const principalDue = inst.principal_amount - inst.principal_paid;
      if (principalDue > 0) {
        const principalToAlloc = Math.min(remainingAmount, principalDue);
        remainingAmount -= principalToAlloc;
        totalPrincipalAllocated += principalToAlloc;
        inst.principal_paid += principalToAlloc;
        inst.updated_at = new Date().toISOString();

        const alloc: PaymentAllocation = {
          id: `alloc-${paymentId}-${inst.id}`,
          payment_id: paymentId,
          installment_id: inst.id,
          principal_allocated: principalToAlloc,
          penalty_allocated: 0,
          created_at: new Date().toISOString(),
          installment_number: inst.installment_number,
          month_name: inst.month_name,
        };
        allocationsCreated.push(alloc);
      }
    }

    // PASS 2: Allocate remaining amount to OUTSTANDING PENALTIES (in order)
    if (remainingAmount > 0) {
      for (const inst of customerInstallments) {
        if (remainingAmount <= 0) break;

        const penaltyDue = inst.penalty_amount - inst.penalty_paid;
        if (penaltyDue > 0) {
          const penaltyToAlloc = Math.min(remainingAmount, penaltyDue);
          remainingAmount -= penaltyToAlloc;
          totalPenaltyAllocated += penaltyToAlloc;
          inst.penalty_paid += penaltyToAlloc;
          inst.updated_at = new Date().toISOString();

          // Update penalty status
          const penRecord = this.state.penalties.find(p => p.installment_id === inst.id);
          if (penRecord && inst.penalty_paid >= inst.penalty_amount) {
            penRecord.status = 'paid';
          }

          // Check if an allocation entry already exists for this installment in this payment
          const existingAlloc = allocationsCreated.find(a => a.installment_id === inst.id);
          if (existingAlloc) {
            existingAlloc.penalty_allocated += penaltyToAlloc;
          } else {
            const alloc: PaymentAllocation = {
              id: `alloc-${paymentId}-${inst.id}`,
              payment_id: paymentId,
              installment_id: inst.id,
              principal_allocated: 0,
              penalty_allocated: penaltyToAlloc,
              created_at: new Date().toISOString(),
              installment_number: inst.installment_number,
              month_name: inst.month_name,
            };
            allocationsCreated.push(alloc);
          }
        }
      }
    }

    // UPDATE INSTALLMENT STATUSES
    const payDateDay = paymentDateStr.slice(0, 10);
    for (const inst of customerInstallments) {
      if (inst.principal_paid >= inst.principal_amount) {
        inst.status = 'paid';
      } else if (inst.principal_paid > 0) {
        inst.status = 'partial';
      } else if (isPaymentPastDeadline(payDateDay, inst.deadline_date)) {
        inst.status = 'overdue';
      } else {
        inst.status = 'pending';
      }
    }

    // Create payment object
    const newPayment: Payment = {
      id: paymentId,
      receipt_number,
      customer_id: params.customer_id,
      enrollment_id: enrollment.id,
      payment_date: paymentDateStr,
      amount: params.amount,
      principal_allocated: totalPrincipalAllocated,
      penalty_allocated: totalPenaltyAllocated,
      payment_method: params.payment_method,
      upi_reference: params.upi_reference,
      collected_by: params.collected_by,
      collector_name: params.collector_name || 'Staff Collector',
      notes: params.notes,
      status: 'confirmed',
      idempotency_key: params.idempotency_key,
      created_at: new Date().toISOString(),
      customer_name: customer.full_name,
      customer_code: customer.customer_code,
      customer_mobile: customer.mobile,
      allocations: allocationsCreated,
    };

    // Update enrollment totals
    enrollment.total_principal_paid += totalPrincipalAllocated;
    enrollment.total_penalty_paid += totalPenaltyAllocated;
    if (enrollment.total_principal_paid >= enrollment.total_principal_expected) {
      enrollment.status = 'completed';
      customer.status = 'completed';
    }

    this.state.payments.push(newPayment);
    this.state.allocations.push(...allocationsCreated);

    this.addAuditLog('PAYMENT_CONFIRMED', 'payments', paymentId, undefined, {
      receipt_number,
      amount: params.amount,
      principal_allocated: totalPrincipalAllocated,
      penalty_allocated: totalPenaltyAllocated,
      customer_code: customer.customer_code,
      payment_method: params.payment_method,
    });

    this.saveState();

    return { payment: newPayment, allocations: allocationsCreated };
  }

  // --- REVERSE PAYMENT ATOMICALLY ---
  public reversePayment(paymentId: string, reason: string, reversedByUserId?: string): Payment {
    const payment = this.state.payments.find(p => p.id === paymentId);
    if (!payment) throw new Error('Payment not found');
    if (payment.status === 'reversed') throw new Error('Payment has already been reversed');

    const allocations = this.state.allocations.filter(a => a.payment_id === paymentId);
    const enrollment = this.state.enrollments.find(e => e.id === payment.enrollment_id);

    // Unwind allocations from installments
    for (const alloc of allocations) {
      const inst = this.state.installments.find(i => i.id === alloc.installment_id);
      if (inst) {
        inst.principal_paid = Math.max(0, inst.principal_paid - alloc.principal_allocated);
        inst.penalty_paid = Math.max(0, inst.penalty_paid - alloc.penalty_allocated);
        inst.updated_at = new Date().toISOString();

        // Recompute status
        if (inst.principal_paid >= inst.principal_amount) {
          inst.status = 'paid';
        } else if (inst.principal_paid > 0) {
          inst.status = 'partial';
        } else if (isPaymentPastDeadline(getTodayString(), inst.deadline_date)) {
          inst.status = 'overdue';
        } else {
          inst.status = 'pending';
        }

        // Reopen penalty if penalty unwound
        if (alloc.penalty_allocated > 0) {
          const pen = this.state.penalties.find(p => p.installment_id === inst.id);
          if (pen) pen.status = 'unpaid';
        }
      }
    }

    // Unwind enrollment totals
    if (enrollment) {
      enrollment.total_principal_paid = Math.max(0, enrollment.total_principal_paid - payment.principal_allocated);
      enrollment.total_penalty_paid = Math.max(0, enrollment.total_penalty_paid - payment.penalty_allocated);
      enrollment.status = 'active';

      const customer = this.state.customers.find(c => c.id === enrollment.customer_id);
      if (customer && customer.status === 'completed') {
        customer.status = 'active';
      }
    }

    // Mark payment reversed
    payment.status = 'reversed';
    payment.reversal_reason = reason;
    payment.reversed_at = new Date().toISOString();
    payment.reversed_by = reversedByUserId;

    this.addAuditLog('PAYMENT_REVERSED', 'payments', paymentId, undefined, {
      receipt_number: payment.receipt_number,
      reason,
      unwound_principal: payment.principal_allocated,
      unwound_penalty: payment.penalty_allocated,
    });

    this.saveState();
    return payment;
  }

  public getPayments(filter?: { customerId?: string; status?: string }): Payment[] {
    let list = this.state.payments.map(p => {
      const cust = this.state.customers.find(c => c.id === p.customer_id);
      const allocs = this.state.allocations.filter(a => a.payment_id === p.id);
      return {
        ...p,
        customer_name: cust?.full_name || 'Unknown',
        customer_code: cust?.customer_code || '---',
        customer_mobile: cust?.mobile || '---',
        allocations: allocs,
      };
    });

    if (filter?.customerId) {
      list = list.filter(p => p.customer_id === filter.customerId);
    }
    if (filter?.status && filter.status !== 'all') {
      list = list.filter(p => p.status === filter.status);
    }

    return list.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
  }

  public getPaymentById(paymentId: string): Payment | null {
    const list = this.getPayments();
    return list.find(p => p.id === paymentId || p.receipt_number === paymentId) || null;
  }

  // --- PENALTIES LIST ---
  public getPenalties(): Penalty[] {
    return this.state.penalties.map(p => {
      const inst = this.state.installments.find(i => i.id === p.installment_id);
      const cust = this.state.customers.find(c => c.id === p.customer_id);
      return {
        ...p,
        installment_number: inst?.installment_number,
        month_name: inst?.month_name,
        customer_name: cust?.full_name,
        customer_code: cust?.customer_code,
      };
    });
  }

  // --- PRODUCTS & INVENTORY ---
  public getProducts(): Product[] {
    return [...this.state.products];
  }

  public addProduct(prod: Omit<Product, 'id' | 'created_at'>): Product {
    const newProd: Product = {
      ...prod,
      id: 'prod-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    this.state.products.push(newProd);
    this.addAuditLog('ADD_PRODUCT', 'products', newProd.id, undefined, newProd);
    this.saveState();
    return newProd;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product {
    const idx = this.state.products.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    this.state.products[idx] = { ...this.state.products[idx], ...updates };
    this.saveState();
    return this.state.products[idx];
  }

  public getSuppliers(): Supplier[] {
    return [...this.state.suppliers];
  }

  public addSupplier(supplier: Omit<Supplier, 'id' | 'created_at'>): Supplier {
    const newSupp: Supplier = {
      ...supplier,
      id: 'supp-' + Date.now(),
      created_at: new Date().toISOString(),
    };
    this.state.suppliers.push(newSupp);
    this.saveState();
    return newSupp;
  }

  public getPackageProducts(): PackageProduct[] {
    return this.state.packageProducts.map(pp => {
      const prod = this.state.products.find(p => p.id === pp.product_id);
      return {
        ...pp,
        product_name: prod?.name || 'Unknown Item',
        purchase_price: prod?.purchase_price || 0,
      };
    });
  }

  public updatePackageProducts(list: PackageProduct[]): void {
    this.state.packageProducts = list;
    this.saveState();
  }

  // --- DISTRIBUTIONS ---
  public getDistributions(filter?: { status?: string }): Distribution[] {
    let list = this.state.distributions.map(d => {
      const cust = this.state.customers.find(c => c.id === d.customer_id);
      const enr = this.state.enrollments.find(e => e.id === d.enrollment_id);
      const isEligible = enr ? enr.total_principal_paid >= enr.total_principal_expected : false;

      return {
        ...d,
        customer_name: cust?.full_name || 'Customer',
        customer_code: cust?.customer_code || '---',
        customer_mobile: cust?.mobile || '---',
        total_principal_paid: enr?.total_principal_paid || 0,
        is_eligible: isEligible,
      };
    });

    if (filter?.status && filter.status !== 'all') {
      list = list.filter(d => d.status === filter.status);
    }

    return list;
  }

  public updateDistributionStatus(
    distributionId: string,
    status: Distribution['status'],
    confirmedByName: string
  ): Distribution {
    const dist = this.state.distributions.find(d => d.id === distributionId);
    if (!dist) throw new Error('Distribution record not found');

    dist.status = status;
    if (status === 'delivered') {
      dist.delivered_date = new Date().toISOString();
      dist.confirmed_by_name = confirmedByName;
    }
    this.saveState();
    return dist;
  }

  // --- EXPENSES ---
  public getExpenses(): Expense[] {
    return [...this.state.expenses].sort(
      (a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()
    );
  }

  public addExpense(expenseData: Omit<Expense, 'id' | 'expense_code' | 'created_at'>): Expense {
    const year = new Date().getFullYear();
    const existingYear = this.state.expenses.filter(e => e.expense_code.startsWith(`EXP-${year}-`));
    const nextCode = `EXP-${year}-${String(existingYear.length + 1).padStart(3, '0')}`;

    const newExpense: Expense = {
      ...expenseData,
      id: 'exp-' + Date.now(),
      expense_code: nextCode,
      created_at: new Date().toISOString(),
    };

    this.state.expenses.push(newExpense);
    this.addAuditLog('ADD_EXPENSE', 'expenses', newExpense.id, undefined, newExpense);
    this.saveState();
    return newExpense;
  }

  // --- DASHBOARD SUMMARY CALCULATIONS ---
  public getDashboardSummary(dateFilter?: 'all' | 'today' | 'week' | 'month'): DashboardSummary {
    const confirmedPayments = this.state.payments.filter(p => p.status === 'confirmed');

    // Filter payments if date filter applied
    let filteredPayments = confirmedPayments;
    const now = new Date();
    if (dateFilter === 'today') {
      const todayStr = getTodayString();
      filteredPayments = confirmedPayments.filter(p => p.payment_date.startsWith(todayStr));
    } else if (dateFilter === 'month') {
      const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      filteredPayments = confirmedPayments.filter(p => p.payment_date.startsWith(monthPrefix));
    }

    const totalCustomers = this.state.customers.length;
    const activeCustomers = this.state.customers.filter(c => c.status === 'active').length;
    const completedCustomers = this.state.customers.filter(c => c.status === 'completed').length;

    // Expected principal: customers * 12 months * 800 (or sum of installments)
    const totalExpectedPrincipal = this.state.installments.reduce((acc, i) => acc + i.principal_amount, 0);

    // Actual collected principal from confirmed payments
    const totalPrincipalCollected = filteredPayments.reduce((acc, p) => acc + p.principal_allocated, 0);

    // Outstanding principal = Expected - Total Paid (all time)
    const allTimePrincipalPaid = confirmedPayments.reduce((acc, p) => acc + p.principal_allocated, 0);
    const totalPrincipalOutstanding = Math.max(0, totalExpectedPrincipal - allTimePrincipalPaid);

    // Penalties
    const totalPenaltiesCollected = filteredPayments.reduce((acc, p) => acc + p.penalty_allocated, 0);
    const totalPenaltiesAppliedAllTime = this.state.installments.reduce((acc, i) => acc + i.penalty_amount, 0);
    const totalPenaltiesPaidAllTime = confirmedPayments.reduce((acc, p) => acc + p.penalty_allocated, 0);
    const totalPenaltiesOutstanding = Math.max(0, totalPenaltiesAppliedAllTime - totalPenaltiesPaidAllTime);

    // Expenses
    const totalBusinessExpenses = this.state.expenses.reduce((acc, e) => acc + e.amount, 0);
    const totalProductPurchasingCosts = this.state.expenses
      .filter(e => e.category === 'product_purchases')
      .reduce((acc, e) => acc + e.amount, 0);

    // Distributions
    const pendingPackageDistributions = this.state.distributions.filter(d => d.status !== 'delivered').length;
    const deliveredPackageDistributions = this.state.distributions.filter(d => d.status === 'delivered').length;

    return {
      totalCustomers,
      activeCustomers,
      completedCustomers,
      totalExpectedPrincipal,
      totalPrincipalCollected,
      totalPrincipalOutstanding,
      totalPenaltiesCollected,
      totalPenaltiesOutstanding,
      totalBusinessExpenses,
      totalProductPurchasingCosts,
      pendingPackageDistributions,
      deliveredPackageDistributions,
    };
  }

  // --- AUDIT LOGS ---
  private addAuditLog(
    action: string,
    entity_type: string,
    entity_id?: string,
    old_data?: any,
    new_data?: any,
    user_id?: string
  ): void {
    const log: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      user_id: user_id || 'system-admin',
      user_email: 'admin@subitchampand.com',
      user_role: 'admin',
      action,
      entity_type,
      entity_id,
      old_data,
      new_data,
      created_at: new Date().toISOString(),
    };
    this.state.auditLogs.unshift(log);
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.state.auditLogs];
  }
}

export const db = new DatabaseEngine();

