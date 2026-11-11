-- =========================================================================
-- Subitcham Deepavali Pand - Production PostgreSQL Database Schema
-- Multi-Tenant Role-Based Management System
-- Timezone: Asia/Kolkata
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set Timezone
SET timezone = 'Asia/Kolkata';

-- -------------------------------------------------------------------------
-- 1. PROFILES (Extends Supabase Auth users)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'staff', 'customer')),
    phone VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

-- -------------------------------------------------------------------------
-- 2. BUSINESS SETTINGS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL DEFAULT 'Subitcham Deepavali Pand',
    company_logo_url TEXT,
    company_phone VARCHAR(50) DEFAULT '+91 98765 43210',
    company_email VARCHAR(100) DEFAULT 'contact@subitchampand.com',
    company_address TEXT DEFAULT 'Main Road, Chennai, Tamil Nadu - 600040',
    default_monthly_contribution NUMERIC(10,2) NOT NULL DEFAULT 800.00,
    default_late_penalty NUMERIC(10,2) NOT NULL DEFAULT 50.00,
    payment_deadline_day INT NOT NULL DEFAULT 15,
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    currency_symbol VARCHAR(10) NOT NULL DEFAULT '₹',
    currency_code VARCHAR(10) NOT NULL DEFAULT 'INR',
    footer_text TEXT NOT NULL DEFAULT '© 2026 Subitcham Deepavali Pand. All Rights Reserved.',
    updated_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

-- -------------------------------------------------------------------------
-- 3. SCHEMES
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL DEFAULT 'Subitcham 12-Month Deepavali Grocery Scheme',
    description TEXT DEFAULT '12 months monthly ₹800 contribution for premium Deepavali grocery package',
    monthly_amount NUMERIC(10,2) NOT NULL DEFAULT 800.00 CHECK (monthly_amount > 0),
    duration_months INT NOT NULL DEFAULT 12 CHECK (duration_months > 0),
    deadline_day INT NOT NULL DEFAULT 15 CHECK (deadline_day BETWEEN 1 AND 31),
    default_penalty_amount NUMERIC(10,2) NOT NULL DEFAULT 50.00 CHECK (default_penalty_amount >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

-- -------------------------------------------------------------------------
-- 4. SCHEME CYCLES (e.g. 2025-2026, 2026-2027)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scheme_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE RESTRICT,
    cycle_name VARCHAR(100) NOT NULL, -- e.g. "Deepavali 2026 Cycle"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    deepavali_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('upcoming', 'active', 'completed', 'archived')),
    expected_customers INT DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

-- -------------------------------------------------------------------------
-- 5. CUSTOMERS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code VARCHAR(50) NOT NULL UNIQUE, -- e.g. SDP-2026-001
    user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL, -- for customer portal login
    full_name VARCHAR(255) NOT NULL,
    mobile VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50),
    address TEXT NOT NULL,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    scheme_cycle_id UUID NOT NULL REFERENCES scheme_cycles(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed', 'defaulted')),
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile);
CREATE INDEX IF NOT EXISTS idx_customers_cycle ON customers(scheme_cycle_id);

-- -------------------------------------------------------------------------
-- 6. ENROLLMENTS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    scheme_cycle_id UUID NOT NULL REFERENCES scheme_cycles(id) ON DELETE RESTRICT,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    total_principal_expected NUMERIC(10,2) NOT NULL DEFAULT 9600.00,
    total_principal_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_penalty_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    UNIQUE(customer_id, scheme_cycle_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_customer ON enrollments(customer_id);

-- -------------------------------------------------------------------------
-- 7. INSTALLMENTS (12 per customer enrollment)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    installment_number INT NOT NULL CHECK (installment_number BETWEEN 1 AND 12),
    month_name VARCHAR(50) NOT NULL, -- e.g. "Month 1 (November 2025)"
    month_year VARCHAR(20) NOT NULL, -- e.g. "2025-11"
    due_date DATE NOT NULL,
    deadline_date DATE NOT NULL, -- 15th of the month
    principal_amount NUMERIC(10,2) NOT NULL DEFAULT 800.00 CHECK (principal_amount >= 0),
    principal_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (principal_paid >= 0),
    penalty_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (penalty_amount >= 0),
    penalty_paid NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (penalty_paid >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    UNIQUE(enrollment_id, installment_number)
);

CREATE INDEX IF NOT EXISTS idx_installments_customer ON installments(customer_id);
CREATE INDEX IF NOT EXISTS idx_installments_status ON installments(status);
CREATE INDEX IF NOT EXISTS idx_installments_deadline ON installments(deadline_date);

-- -------------------------------------------------------------------------
-- 8. PAYMENTS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number VARCHAR(50) NOT NULL UNIQUE, -- e.g. SDP-REC-2026-0001
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE RESTRICT,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    principal_allocated NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    penalty_allocated NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'upi')),
    upi_reference VARCHAR(100),
    collected_by UUID REFERENCES profiles(id),
    collector_name VARCHAR(255),
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending_verification', 'confirmed', 'rejected', 'reversed')),
    idempotency_key VARCHAR(100) UNIQUE,
    reversal_reason TEXT,
    reversed_at TIMESTAMPTZ,
    reversed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

CREATE INDEX IF NOT EXISTS idx_payments_receipt ON payments(receipt_number);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- -------------------------------------------------------------------------
-- 9. PAYMENT ALLOCATIONS (Itemized breakdown to installments)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    installment_id UUID NOT NULL REFERENCES installments(id) ON DELETE RESTRICT,
    principal_allocated NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (principal_allocated >= 0),
    penalty_allocated NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (penalty_allocated >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

CREATE INDEX IF NOT EXISTS idx_allocations_payment ON payment_allocations(payment_id);
CREATE INDEX IF NOT EXISTS idx_allocations_installment ON payment_allocations(installment_id);

-- -------------------------------------------------------------------------
-- 10. PENALTIES (Separate tracking for audit)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS penalties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    installment_id UUID NOT NULL UNIQUE REFERENCES installments(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL DEFAULT 50.00 CHECK (amount > 0),
    applied_date TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    status VARCHAR(50) NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'waived')),
    waived_by UUID REFERENCES profiles(id),
    waive_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

-- -------------------------------------------------------------------------
-- 11. SUPPLIERS
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

-- -------------------------------------------------------------------------
-- 12. PRODUCTS (Inventory)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL, -- Rice, Oil, Sugar, Dal, Spices, Grocery, Household
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL, -- kg, L, pkt, bag, bottle
    purchase_price NUMERIC(10,2) NOT NULL CHECK (purchase_price >= 0),
    available_quantity NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
    reorder_level NUMERIC(10,2) NOT NULL DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

-- -------------------------------------------------------------------------
-- 13. PRODUCT PURCHASES
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100),
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

-- -------------------------------------------------------------------------
-- 14. PACKAGE PRODUCTS (Composition per Deepavali Package)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS package_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_cycle_id UUID NOT NULL REFERENCES scheme_cycles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity_per_package NUMERIC(10,2) NOT NULL CHECK (quantity_per_package > 0),
    unit VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    UNIQUE(scheme_cycle_id, product_id)
);

-- -------------------------------------------------------------------------
-- 15. DISTRIBUTIONS (Deepavali Package Distribution)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    scheme_cycle_id UUID NOT NULL REFERENCES scheme_cycles(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'not_prepared' CHECK (status IN ('not_prepared', 'preparing', 'ready', 'delivered')),
    delivered_date TIMESTAMPTZ,
    delivered_by UUID REFERENCES profiles(id),
    confirmed_by_name VARCHAR(255),
    recipient_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    UNIQUE(customer_id, scheme_cycle_id)
);

CREATE INDEX IF NOT EXISTS idx_distributions_cycle ON distributions(scheme_cycle_id);
CREATE INDEX IF NOT EXISTS idx_distributions_status ON distributions(status);

-- -------------------------------------------------------------------------
-- 16. EXPENSES
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_code VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL CHECK (category IN (
        'product_purchases', 'transportation', 'packaging',
        'staff_expenses', 'rent', 'electricity', 'other'
    )),
    description TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'upi', 'bank_transfer')),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    invoice_attachment_url TEXT,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- -------------------------------------------------------------------------
-- 17. AUDIT LOGS (Immutable security and audit trail)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL, -- e.g. 'PAYMENT_CONFIRMED', 'PAYMENT_REVERSED', 'PENALTY_APPLIED'
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('Asia/Kolkata', now())
);

CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);

-- =========================================================================
-- SECURE DATABASE FUNCTIONS (Atomic business logic)
-- =========================================================================

-- Function: Generate next unique customer ID (SDP-YYYY-XXXX)
CREATE OR REPLACE FUNCTION generate_customer_code(cycle_year INT)
RETURNS VARCHAR AS $$
DECLARE
    next_num INT;
    prefix VARCHAR(20);
    new_code VARCHAR(50);
BEGIN
    prefix := 'SDP-' || cycle_year || '-';
    SELECT COALESCE(MAX(SUBSTRING(customer_code FROM LENGTH(prefix) + 1)::INT), 0) + 1
    INTO next_num
    FROM customers
    WHERE customer_code LIKE prefix || '%';
    
    new_code := prefix || LPAD(next_num::TEXT, 4, '0');
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function: Generate next unique payment receipt number (RCP-YYYY-XXXXX)
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS VARCHAR AS $$
DECLARE
    curr_year VARCHAR(4);
    next_num INT;
    prefix VARCHAR(20);
    new_receipt VARCHAR(50);
BEGIN
    curr_year := TO_CHAR(timezone('Asia/Kolkata', now()), 'YYYY');
    prefix := 'RCP-' || curr_year || '-';
    SELECT COALESCE(MAX(SUBSTRING(receipt_number FROM LENGTH(prefix) + 1)::INT), 0) + 1
    INTO next_num
    FROM payments
    WHERE receipt_number LIKE prefix || '%';
    
    new_receipt := prefix || LPAD(next_num::TEXT, 5, '0');
    RETURN new_receipt;
END;
$$ LANGUAGE plpgsql;

-- Function: Register Customer and automatically generate 12 Installments
CREATE OR REPLACE FUNCTION register_customer_and_installments(
    p_full_name VARCHAR,
    p_mobile VARCHAR,
    p_whatsapp VARCHAR,
    p_address TEXT,
    p_scheme_cycle_id UUID,
    p_joining_date DATE,
    p_notes TEXT,
    p_created_by UUID
)
RETURNS JSONB AS $$
DECLARE
    v_cycle RECORD;
    v_scheme RECORD;
    v_customer_id UUID;
    v_customer_code VARCHAR(50);
    v_enrollment_id UUID;
    v_cycle_year INT;
    v_inst_due DATE;
    v_inst_deadline DATE;
    v_month_name VARCHAR(50);
    v_month_year VARCHAR(20);
    i INT;
BEGIN
    -- Check cycle
    SELECT * INTO v_cycle FROM scheme_cycles WHERE id = p_scheme_cycle_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Scheme cycle not found';
    END IF;

    SELECT * INTO v_scheme FROM schemes WHERE id = v_cycle.scheme_id;
    
    -- Check duplicate mobile in same cycle
    IF EXISTS (
        SELECT 1 FROM customers 
        WHERE mobile = p_mobile AND scheme_cycle_id = p_scheme_cycle_id AND status != 'inactive'
    ) THEN
        RAISE EXCEPTION 'Customer with mobile number % is already enrolled in this cycle', p_mobile;
    END IF;

    v_cycle_year := EXTRACT(YEAR FROM v_cycle.start_date)::INT;
    v_customer_code := generate_customer_code(v_cycle_year);

    -- Insert customer
    INSERT INTO customers (
        customer_code, full_name, mobile, whatsapp, address, 
        joining_date, scheme_cycle_id, status, notes, created_by
    ) VALUES (
        v_customer_code, p_full_name, p_mobile, p_whatsapp, p_address,
        p_joining_date, p_scheme_cycle_id, 'active', p_notes, p_created_by
    ) RETURNING id INTO v_customer_id;

    -- Insert enrollment
    INSERT INTO enrollments (
        customer_id, scheme_cycle_id, enrollment_date, status,
        total_principal_expected, total_principal_paid, total_penalty_paid
    ) VALUES (
        v_customer_id, p_scheme_cycle_id, p_joining_date, 'active',
        v_scheme.monthly_amount * v_scheme.duration_months, 0.00, 0.00
    ) RETURNING id INTO v_enrollment_id;

    -- Create distribution entry
    INSERT INTO distributions (customer_id, enrollment_id, scheme_cycle_id, status)
    VALUES (v_customer_id, v_enrollment_id, p_scheme_cycle_id, 'not_prepared');

    -- Generate 12 installments
    FOR i IN 1..v_scheme.duration_months LOOP
        -- due date is 1st of month, deadline is 15th
        v_inst_due := (v_cycle.start_date + ((i - 1) || ' months')::INTERVAL)::DATE;
        v_inst_due := DATE_TRUNC('month', v_inst_due)::DATE;
        v_inst_deadline := (v_inst_due + (v_scheme.deadline_day - 1) * INTERVAL '1 day')::DATE;
        v_month_name := 'Month ' || i || ' (' || TO_CHAR(v_inst_due, 'Mon YYYY') || ')';
        v_month_year := TO_CHAR(v_inst_due, 'YYYY-MM');

        INSERT INTO installments (
            enrollment_id, customer_id, installment_number, month_name, month_year,
            due_date, deadline_date, principal_amount, principal_paid,
            penalty_amount, penalty_paid, status
        ) VALUES (
            v_enrollment_id, v_customer_id, i, v_month_name, v_month_year,
            v_inst_due, v_inst_deadline, v_scheme.monthly_amount, 0.00,
            0.00, 0.00, 'pending'
        );
    END LOOP;

    RETURN jsonb_build_object(
        'customer_id', v_customer_id,
        'customer_code', v_customer_code,
        'enrollment_id', v_enrollment_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function: Apply Late Penalties (Runs idempotently for past deadlines)
CREATE OR REPLACE FUNCTION apply_late_penalties(
    p_as_of_date DATE DEFAULT timezone('Asia/Kolkata', now())::DATE,
    p_penalty_amount NUMERIC DEFAULT 50.00
)
RETURNS INT AS $$
DECLARE
    v_inst RECORD;
    v_count INT := 0;
BEGIN
    FOR v_inst IN 
        SELECT i.* 
        FROM installments i
        JOIN enrollments e ON i.enrollment_id = e.id
        WHERE e.status = 'active'
          AND i.deadline_date < p_as_of_date
          AND i.principal_paid < i.principal_amount
          AND NOT EXISTS (
              SELECT 1 FROM penalties p WHERE p.installment_id = i.id
          )
    LOOP
        -- Apply penalty only once
        INSERT INTO penalties (installment_id, customer_id, amount, applied_date, status, reason)
        VALUES (v_inst.id, v_inst.customer_id, p_penalty_amount, timezone('Asia/Kolkata', now()), 'unpaid', 'Late payment after 15th');

        -- Update installment penalty amount and status
        UPDATE installments
        SET penalty_amount = p_penalty_amount,
            status = 'overdue',
            updated_at = timezone('Asia/Kolkata', now())
        WHERE id = v_inst.id;

        v_count := v_count + 1;
    END LOOP;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Process Payment Atomically with Principal-First Allocation
CREATE OR REPLACE FUNCTION process_payment_atomic(
    p_customer_id UUID,
    p_amount NUMERIC,
    p_payment_method VARCHAR,
    p_payment_date TIMESTAMPTZ,
    p_upi_reference VARCHAR,
    p_collected_by UUID,
    p_collector_name VARCHAR,
    p_notes TEXT,
    p_idempotency_key VARCHAR
)
RETURNS JSONB AS $$
DECLARE
    v_customer RECORD;
    v_enrollment RECORD;
    v_payment_id UUID;
    v_receipt_number VARCHAR(50);
    v_remaining_amount NUMERIC := p_amount;
    v_total_principal_alloc NUMERIC := 0.00;
    v_total_penalty_alloc NUMERIC := 0.00;
    v_inst RECORD;
    v_princ_due NUMERIC;
    v_pen_due NUMERIC;
    v_princ_to_alloc NUMERIC;
    v_pen_to_alloc NUMERIC;
    v_new_status VARCHAR(50);
    v_current_ist_date DATE;
BEGIN
    -- Idempotency check
    IF p_idempotency_key IS NOT NULL THEN
        SELECT id, receipt_number INTO v_payment_id, v_receipt_number 
        FROM payments 
        WHERE idempotency_key = p_idempotency_key;
        
        IF FOUND THEN
            RETURN jsonb_build_object(
                'payment_id', v_payment_id,
                'receipt_number', v_receipt_number,
                'already_processed', true
            );
        END IF;
    END IF;

    -- Validate customer
    SELECT * INTO v_customer FROM customers WHERE id = p_customer_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Customer not found';
    END IF;

    -- Get active enrollment
    SELECT * INTO v_enrollment FROM enrollments 
    WHERE customer_id = p_customer_id AND status = 'active'
    ORDER BY created_at DESC LIMIT 1;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Active enrollment not found for customer';
    END IF;

    -- Determine payment date in IST
    v_current_ist_date := (timezone('Asia/Kolkata', p_payment_date))::DATE;

    -- Apply any due penalties first if past 15th
    PERFORM apply_late_penalties(v_current_ist_date, 50.00);

    -- Generate receipt number
    v_receipt_number := generate_receipt_number();

    -- Create payment record
    INSERT INTO payments (
        receipt_number, customer_id, enrollment_id, payment_date, amount,
        payment_method, upi_reference, collected_by, collector_name,
        notes, status, idempotency_key
    ) VALUES (
        v_receipt_number, p_customer_id, v_enrollment.id, p_payment_date, p_amount,
        p_payment_method, p_upi_reference, p_collected_by, p_collector_name,
        p_notes, 'confirmed', p_idempotency_key
    ) RETURNING id INTO v_payment_id;

    -- PASS 1: Allocate to PRINCIPAL first (in order of installment_number)
    FOR v_inst IN 
        SELECT * FROM installments 
        WHERE enrollment_id = v_enrollment.id 
          AND principal_paid < principal_amount
        ORDER BY installment_number ASC
    LOOP
        EXIT WHEN v_remaining_amount <= 0;

        v_princ_due := v_inst.principal_amount - v_inst.principal_paid;
        v_princ_to_alloc := LEAST(v_remaining_amount, v_princ_due);

        IF v_princ_to_alloc > 0 THEN
            v_remaining_amount := v_remaining_amount - v_princ_to_alloc;
            v_total_principal_alloc := v_total_principal_alloc + v_princ_to_alloc;

            -- Update installment principal
            UPDATE installments 
            SET principal_paid = principal_paid + v_princ_to_alloc,
                updated_at = timezone('Asia/Kolkata', now())
            WHERE id = v_inst.id;

            -- Insert allocation
            INSERT INTO payment_allocations (payment_id, installment_id, principal_allocated, penalty_allocated)
            VALUES (v_payment_id, v_inst.id, v_princ_to_alloc, 0.00);
        END IF;
    END LOOP;

    -- PASS 2: Allocate remaining money to OUTSTANDING PENALTIES (order by installment_number)
    IF v_remaining_amount > 0 THEN
        FOR v_inst IN 
            SELECT * FROM installments 
            WHERE enrollment_id = v_enrollment.id 
              AND penalty_amount > penalty_paid
            ORDER BY installment_number ASC
        LOOP
            EXIT WHEN v_remaining_amount <= 0;

            v_pen_due := v_inst.penalty_amount - v_inst.penalty_paid;
            v_pen_to_alloc := LEAST(v_remaining_amount, v_pen_due);

            IF v_pen_to_alloc > 0 THEN
                v_remaining_amount := v_remaining_amount - v_pen_to_alloc;
                v_total_penalty_alloc := v_total_penalty_alloc + v_pen_to_alloc;

                -- Update installment penalty
                UPDATE installments 
                SET penalty_paid = penalty_paid + v_pen_to_alloc,
                    updated_at = timezone('Asia/Kolkata', now())
                WHERE id = v_inst.id;

                -- Update penalty record status
                UPDATE penalties
                SET status = 'paid'
                WHERE installment_id = v_inst.id AND (v_inst.penalty_paid + v_pen_to_alloc) >= v_inst.penalty_amount;

                -- Check if allocation already exists for this installment in this payment
                UPDATE payment_allocations
                SET penalty_allocated = penalty_allocated + v_pen_to_alloc
                WHERE payment_id = v_payment_id AND installment_id = v_inst.id;

                IF NOT FOUND THEN
                    INSERT INTO payment_allocations (payment_id, installment_id, principal_allocated, penalty_allocated)
                    VALUES (v_payment_id, v_inst.id, 0.00, v_pen_to_alloc);
                END IF;
            END IF;
        END LOOP;
    END IF;

    -- UPDATE INSTALLMENT STATUSES FOR ALL AFFECTED INSTALLMENTS
    FOR v_inst IN SELECT * FROM installments WHERE enrollment_id = v_enrollment.id LOOP
        IF v_inst.principal_paid >= v_inst.principal_amount THEN
            v_new_status := 'paid';
        ELSIF v_inst.principal_paid > 0 THEN
            v_new_status := 'partial';
        ELSIF v_inst.deadline_date < v_current_ist_date THEN
            v_new_status := 'overdue';
        ELSE
            v_new_status := 'pending';
        END IF;

        UPDATE installments SET status = v_new_status WHERE id = v_inst.id;
    END LOOP;

    -- Update payment summary totals
    UPDATE payments 
    SET principal_allocated = v_total_principal_alloc,
        penalty_allocated = v_total_penalty_alloc
    WHERE id = v_payment_id;

    -- Update enrollment aggregate totals
    UPDATE enrollments
    SET total_principal_paid = total_principal_paid + v_total_principal_alloc,
        total_penalty_paid = total_penalty_paid + v_total_penalty_alloc,
        status = CASE 
            WHEN (total_principal_paid + v_total_principal_alloc) >= total_principal_expected THEN 'completed'
            ELSE 'active'
        END,
        updated_at = timezone('Asia/Kolkata', now())
    WHERE id = v_enrollment.id;

    -- Audit Log
    INSERT INTO audit_logs (
        user_id, action, entity_type, entity_id, new_data, notes
    ) VALUES (
        p_collected_by, 'PAYMENT_CONFIRMED', 'payment', v_payment_id::TEXT,
        jsonb_build_object(
            'receipt_number', v_receipt_number,
            'amount', p_amount,
            'principal_allocated', v_total_principal_alloc,
            'penalty_allocated', v_total_penalty_alloc,
            'payment_method', p_payment_method
        ),
        'Payment recorded and allocated'
    );

    RETURN jsonb_build_object(
        'payment_id', v_payment_id,
        'receipt_number', v_receipt_number,
        'principal_allocated', v_total_principal_alloc,
        'penalty_allocated', v_total_penalty_alloc,
        'unallocated_excess', v_remaining_amount
    );
END;
$$ LANGUAGE plpgsql;

-- Function: Reverse Payment Atomically
CREATE OR REPLACE FUNCTION reverse_payment_atomic(
    p_payment_id UUID,
    p_reason TEXT,
    p_reversed_by UUID
)
RETURNS JSONB AS $$
DECLARE
    v_payment RECORD;
    v_alloc RECORD;
    v_inst RECORD;
    v_new_status VARCHAR(50);
BEGIN
    SELECT * INTO v_payment FROM payments WHERE id = p_payment_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment not found';
    END IF;

    IF v_payment.status = 'reversed' THEN
        RAISE EXCEPTION 'Payment is already reversed';
    END IF;

    -- Unwind allocations from installments
    FOR v_alloc IN SELECT * FROM payment_allocations WHERE payment_id = p_payment_id LOOP
        SELECT * INTO v_inst FROM installments WHERE id = v_alloc.installment_id;

        UPDATE installments 
        SET principal_paid = GREATEST(0.00, principal_paid - v_alloc.principal_allocated),
            penalty_paid = GREATEST(0.00, penalty_paid - v_alloc.penalty_allocated),
            updated_at = timezone('Asia/Kolkata', now())
        WHERE id = v_alloc.installment_id;

        -- Recheck status
        SELECT * INTO v_inst FROM installments WHERE id = v_alloc.installment_id;
        IF v_inst.principal_paid >= v_inst.principal_amount THEN
            v_new_status := 'paid';
        ELSIF v_inst.principal_paid > 0 THEN
            v_new_status := 'partial';
        ELSIF v_inst.deadline_date < timezone('Asia/Kolkata', now())::DATE THEN
            v_new_status := 'overdue';
        ELSE
            v_new_status := 'pending';
        END IF;

        UPDATE installments SET status = v_new_status WHERE id = v_alloc.installment_id;

        -- Re-open penalty status if penalty paid was unwound
        IF v_alloc.penalty_allocated > 0 THEN
            UPDATE penalties SET status = 'unpaid' WHERE installment_id = v_alloc.installment_id;
        END IF;
    END LOOP;

    -- Unwind enrollment totals
    UPDATE enrollments
    SET total_principal_paid = GREATEST(0.00, total_principal_paid - v_payment.principal_allocated),
        total_penalty_paid = GREATEST(0.00, total_penalty_paid - v_payment.penalty_allocated),
        status = 'active',
        updated_at = timezone('Asia/Kolkata', now())
    WHERE id = v_payment.enrollment_id;

    -- Mark payment reversed
    UPDATE payments
    SET status = 'reversed',
        reversal_reason = p_reason,
        reversed_at = timezone('Asia/Kolkata', now()),
        reversed_by = p_reversed_by,
        updated_at = timezone('Asia/Kolkata', now())
    WHERE id = p_payment_id;

    -- Audit log
    INSERT INTO audit_logs (
        user_id, action, entity_type, entity_id, notes
    ) VALUES (
        p_reversed_by, 'PAYMENT_REVERSED', 'payment', p_payment_id::TEXT,
        'Reversed payment ' || v_payment.receipt_number || '. Reason: ' || p_reason
    );

    RETURN jsonb_build_object(
        'success', true,
        'payment_id', p_payment_id,
        'receipt_number', v_payment.receipt_number
    );
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Get Current User Role
CREATE OR REPLACE FUNCTION get_auth_role()
RETURNS VARCHAR AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES Policies
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id OR get_auth_role() IN ('admin', 'staff'));

CREATE POLICY "Admins can update profiles" ON profiles
    FOR ALL USING (get_auth_role() = 'admin');

-- BUSINESS SETTINGS Policies
CREATE POLICY "Public read business settings" ON business_settings
    FOR SELECT USING (true);

CREATE POLICY "Admin update business settings" ON business_settings
    FOR ALL USING (get_auth_role() = 'admin');

-- SCHEMES & CYCLES Policies
CREATE POLICY "Allow read schemes" ON schemes FOR SELECT USING (true);
CREATE POLICY "Admin modify schemes" ON schemes FOR ALL USING (get_auth_role() = 'admin');

CREATE POLICY "Allow read cycles" ON scheme_cycles FOR SELECT USING (true);
CREATE POLICY "Admin modify cycles" ON scheme_cycles FOR ALL USING (get_auth_role() = 'admin');

-- CUSTOMERS Policies
CREATE POLICY "Staff and Admin can see customers" ON customers
    FOR SELECT USING (
        get_auth_role() IN ('admin', 'staff') OR 
        user_id = auth.uid()
    );

CREATE POLICY "Admin and staff insert customers" ON customers
    FOR INSERT WITH CHECK (get_auth_role() IN ('admin', 'staff'));

CREATE POLICY "Admin update customers" ON customers
    FOR UPDATE USING (get_auth_role() IN ('admin', 'staff'));

-- INSTALLMENTS Policies
CREATE POLICY "View installments" ON installments
    FOR SELECT USING (
        get_auth_role() IN ('admin', 'staff') OR 
        customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    );

CREATE POLICY "Admin staff modify installments" ON installments
    FOR ALL USING (get_auth_role() IN ('admin', 'staff'));

-- PAYMENTS Policies
CREATE POLICY "View payments" ON payments
    FOR SELECT USING (
        get_auth_role() IN ('admin', 'staff') OR 
        customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    );

CREATE POLICY "Staff admin insert payments" ON payments
    FOR INSERT WITH CHECK (get_auth_role() IN ('admin', 'staff'));

CREATE POLICY "Admin update payments" ON payments
    FOR UPDATE USING (get_auth_role() = 'admin');

-- EXPENSES Policies
CREATE POLICY "Staff admin view expenses" ON expenses
    FOR SELECT USING (get_auth_role() IN ('admin', 'staff'));

CREATE POLICY "Admin insert update expenses" ON expenses
    FOR ALL USING (get_auth_role() = 'admin');

-- INVENTORY & PRODUCTS Policies
CREATE POLICY "Staff and admin view products" ON products
    FOR SELECT USING (get_auth_role() IN ('admin', 'staff'));

CREATE POLICY "Admin manage products" ON products
    FOR ALL USING (get_auth_role() = 'admin');

-- DISTRIBUTIONS Policies
CREATE POLICY "View distributions" ON distributions
    FOR SELECT USING (
        get_auth_role() IN ('admin', 'staff') OR 
        customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    );

CREATE POLICY "Staff admin manage distributions" ON distributions
    FOR ALL USING (get_auth_role() IN ('admin', 'staff'));

-- AUDIT LOGS Policies
CREATE POLICY "Admin view audit logs" ON audit_logs
    FOR SELECT USING (get_auth_role() = 'admin');

CREATE POLICY "Staff and admin append audit logs" ON audit_logs
    FOR INSERT WITH CHECK (get_auth_role() IN ('admin', 'staff'));
