# Subitcham Deepavali Pand – Business Management Portal

A full-stack, production-grade business management web application engineered for **Subitcham Deepavali Pand**.

---

## 🪔 Business Overview

- **Company Name:** Subitcham Deepavali Pand
- **Business Model:** 12-Month recurring grocery savings scheme
- **Monthly Contribution:** ₹800 per customer
- **Scheme Duration:** 12 Months
- **Total Principal per Customer:** ₹9,600
- **Monthly Cutoff Deadline:** 15th of every month (Calculated in `Asia/Kolkata` timezone)
- **Late Payment Penalty:** ₹50 flat per installment when paid after the 15th
- **Member Benefit:** Premium Deepavali grocery/sweets hamper upon completing 12 installments
- **Expected Customer Scale:** 50–100 members
  - **50 members:** ₹4,80,000 expected gross principal collection
  - **75 members:** ₹7,20,000 expected gross principal collection
  - **100 members:** ₹9,60,000 expected gross principal collection

---

## 🚀 Key Features

### 1. Role-Based Access Control (RBAC)
- **Admin:** Full authority over dashboard, scheme cycles, members, atomic payments, reversals, inventory, expenses, suppliers, 12 downloadable reports, staff management, and audit logs.
- **Staff:** Field collection mode: enroll members, record cash & UPI payments, print/share receipts, track deliveries. Restricted from modifying scheme terms or deleting confirmed payments.
- **Customer:** Dedicated customer portal with real-time 12-month installment schedule, paid vs. outstanding balances, instant PDF receipt downloads, and gift hamper delivery tracking.

### 2. Strict Financial & Accounting Integrity
- **Principal-First Allocation:** All payments allocate to outstanding principal first. Any remaining balance is applied to late penalties.
- **Late Penalty Separation:** Late fines (₹50) are tracked separately and **never added to principal**.
- **No Duplicate Fines:** Penalties are applied **only once per installment** after the 15th has passed.
- **Revenue Recognition:** Uncollected penalties are tracked as receivables and **never counted as revenue** until confirmed.
- **Atomic Reversals:** Confirmed payments cannot be silently deleted. Reversals atomically unwind principal and penalty allocations with audit logging.

### 3. Deepavali Package & Inventory Demand
- Real-time calculation of grocery hamper inventory needs based on enrolled members (e.g. 100 members × 10 kg rice = 1,000 kg).
- Compares required stock with godown stock levels to highlight procurement shortages.

### 4. Official Receipts & 12 Reports
- **A5 PDF Receipts:** Generated using `jsPDF` with company branding, unique receipt number (`RCP-YYYY-XXXXX`), payment allocation breakdown, and remaining balances.
- **WhatsApp Share:** One-click WhatsApp link with pre-formatted receipt message for customers.
- **Excel Exports:** Formatted Excel spreadsheets with auto-fitting, borders, and currency styling using `exceljs`.
- **12 Reports:** Daily collection, monthly collection, customer-wise payment, pending installments, overdue installments, penalty audit, outstanding balances, expenses, product procurement, inventory stock, package distribution, and annual business summary.

### 5. Automated Verification Suite
- Built-in automated test runner (`/tests`) that tests all 16 business and accounting scenarios with 1-click execution.

---

## 🛠 Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React, React Router v6
- **Charts:** Recharts
- **PDF & Excel:** jsPDF, jspdf-autotable, ExcelJS
- **Date & Timezone:** date-fns (`Asia/Kolkata` timezone aware)
- **Backend & Database:** PostgreSQL, Supabase (with full RLS and atomic database RPC functions)

---

## 📦 Project Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_NAME="Subitcham Deepavali Pand"
VITE_MONTHLY_CONTRIBUTION=800
VITE_LATE_PENALTY=50
VITE_SCHEME_DURATION_MONTHS=12
VITE_PAYMENT_DEADLINE_DAY=15
VITE_TIMEZONE="Asia/Kolkata"
VITE_COMPANY_PHONE="+91 98401 23456"
VITE_COMPANY_ADDRESS="No. 45, Bazaar Street, Anna Nagar, Chennai, Tamil Nadu - 600040"
```

*Note: The application has a resilient dual-mode architecture. If Supabase credentials are not provided initially, it automatically runs in an interactive Offline/Demo mode with full localStorage persistence and realistic pre-seeded test data, allowing immediate testing!*

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 🗄 Database Setup (Supabase PostgreSQL)

1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Run the migration script in [`supabase/schema.sql`](supabase/schema.sql).
   - Creates all 17 tables (`profiles`, `customers`, `schemes`, `scheme_cycles`, `enrollments`, `installments`, `payments`, `payment_allocations`, `penalties`, `products`, `suppliers`, `product_purchases`, `package_products`, `distributions`, `expenses`, `business_settings`, `audit_logs`).
   - Configures Row Level Security (RLS) policies.
   - Installs atomic PostgreSQL functions:
     - `register_customer_and_installments()`
     - `apply_late_penalties()`
     - `process_payment_atomic()`
     - `reverse_payment_atomic()`
3. Optionally run [`supabase/seed.sql`](supabase/seed.sql) to populate initial product recipes, suppliers, and active scheme cycles.

---

## 🧪 Verification & Test Suite

Navigate to `/tests` in the running application and click **"Run Full Test Suite"** to verify:
1. Register a new customer
2. Generate 12 installments automatically
3. Record ₹800 payment before the 15th (Scenario 1)
4. Record ₹800 payment after the 15th (Scenario 2 & 3)
5. Apply the ₹50 penalty only once (Idempotency)
6. Record partial payments (Scenario 5)
7. Verify principal-first payment allocation (Scenario 6)
8. Verify penalty outstanding does not count as revenue
9. Generate a payment receipt PDF
10. Reverse an incorrect payment atomically
11. Confirm customer data isolation (RLS)
12. Confirm staff permissions
13. Verify dashboard financial calculations
14. Verify product stock & package demand calculations
15. Verify package distribution status tracking
16. Verify PDF, Excel exports & Asia/Kolkata timezone cutoffs

---

## 📄 License & Attribution

© 2026 Subitcham Deepavali Pand. All Rights Reserved.

