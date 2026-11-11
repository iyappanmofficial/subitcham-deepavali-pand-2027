-- =========================================================================
-- Subitcham Deepavali Pand - Seed Data
-- =========================================================================

-- Business Settings
INSERT INTO business_settings (
    id, company_name, company_phone, company_email, company_address,
    default_monthly_contribution, default_late_penalty, payment_deadline_day,
    timezone, currency_symbol, currency_code, footer_text
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Subitcham Deepavali Pand',
    '+91 98401 23456',
    'admin@subitchampand.com',
    'No. 45, Bazaar Street, Anna Nagar, Chennai, Tamil Nadu - 600040',
    800.00,
    50.00,
    15,
    'Asia/Kolkata',
    '₹',
    'INR',
    '© 2026 Subitcham Deepavali Pand. All Rights Reserved.'
) ON CONFLICT (id) DO NOTHING;

-- Default Scheme
INSERT INTO schemes (
    id, name, description, monthly_amount, duration_months,
    deadline_day, default_penalty_amount, currency, is_active
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Subitcham 12-Month Deepavali Grocery Scheme',
    'Monthly ₹800 contribution for 12 months with festive Deepavali grocery package delivery',
    800.00,
    12,
    15,
    50.00,
    'INR',
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- Active Scheme Cycle (Deepavali 2026 Cycle)
INSERT INTO scheme_cycles (
    id, scheme_id, cycle_name, start_date, end_date, deepavali_date,
    status, expected_customers
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Deepavali 2026 Cycle',
    '2025-11-01',
    '2026-10-31',
    '2026-11-08',
    'active',
    100
) ON CONFLICT (id) DO NOTHING;

-- Suppliers
INSERT INTO suppliers (id, name, contact_person, phone, email, address, notes) VALUES
('33333333-3333-3333-3333-000000000001', 'Sri Meenakshi Rice Mills', 'Sundar Rajan', '+91 98410 11223', 'sundar@meenakshirice.com', 'Kumbakonam Main Road, Thanjavur', 'Wholesale Grade-A Ponni boiled rice supplier'),
('33333333-3333-3333-3333-000000000002', 'Vasantham Agro & Oils', 'K. Murugan', '+91 94440 33445', 'murugan@vasanthamoils.com', 'APMC Market Yard, Erode', 'Cold pressed and refined edible oils'),
('33333333-3333-3333-3333-000000000003', 'Lakshmi Spices & Groceries', 'Ramesh Kumar', '+91 98840 55667', 'ramesh@lakshmispices.com', 'Kothawalchavadi, George Town, Chennai', 'Direct wholesale pulses, sugar and spices')
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO products (id, category, name, unit, purchase_price, available_quantity, reorder_level, is_active) VALUES
('44444444-4444-4444-4444-000000000001', 'Rice', 'Ponni Boiled Rice (Premium)', 'kg', 58.00, 1200.00, 200.00, TRUE),
('44444444-4444-4444-4444-000000000002', 'Oil', 'Gold Winner Refined Sunflower Oil', 'L', 115.00, 150.00, 50.00, TRUE),
('44444444-4444-4444-4444-000000000003', 'Sugar', 'Pure White Crystal Sugar', 'kg', 42.00, 300.00, 50.00, TRUE),
('44444444-4444-4444-4444-000000000004', 'Dal', 'First Grade Toor Dal (Oorai)', 'kg', 145.00, 200.00, 40.00, TRUE),
('44444444-4444-4444-4444-000000000005', 'Spices', 'Deepavali Special Masala & Spices Combo', 'pkt', 180.00, 100.00, 20.00, TRUE),
('44444444-4444-4444-4444-000000000006', 'Grocery', 'Deepavali Sweets & Mixture Gift Pack', 'box', 220.00, 100.00, 20.00, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Package Products (Deepavali Package Composition)
INSERT INTO package_products (id, scheme_cycle_id, product_id, quantity_per_package, unit, notes) VALUES
('55555555-5555-5555-5555-000000000001', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-000000000001', 10.00, 'kg', '10kg Ponni rice bag per member'),
('55555555-5555-5555-5555-000000000002', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-000000000002', 1.00, 'L', '1 Litre pouch'),
('55555555-5555-5555-5555-000000000003', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-000000000003', 2.00, 'kg', '2kg pure sugar'),
('55555555-5555-5555-5555-000000000004', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-000000000004', 1.00, 'kg', '1kg Toor dal'),
('55555555-5555-5555-5555-000000000005', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-000000000005', 1.00, 'pkt', 'Festive spice combo'),
('55555555-5555-5555-5555-000000000006', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-000000000006', 1.00, 'box', 'Sweets & Savory festive box')
ON CONFLICT (id) DO NOTHING;
