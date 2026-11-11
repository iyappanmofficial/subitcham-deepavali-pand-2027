import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/lib/utils';
import { formatISTDate, formatISTDateTime } from '@/lib/dateUtils';
import { ReceiptModal } from '@/components/receipt/ReceiptModal';
import { Payment } from '@/types';
import {
  Sparkles,
  Calendar,
  IndianRupee,
  Gift,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Share2,
} from 'lucide-react';

export const CustomerPortalDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeReceipt, setActiveReceipt] = useState<Payment | null>(null);

  // Get logged in customer's profile (or fallback to demo member)
  const customer = db.getCustomerByUserId(currentUser?.id || '') || db.getCustomers()[0];
  const settings = db.getSettings();
  const activeCycle = db.getActiveCycle();

  if (!customer) {
    return (
      <div className="bg-white p-8 rounded-2xl text-center text-slate-500 border">
        No active membership found for your account. Please contact the administrator.
      </div>
    );
  }

  const installments = db.getInstallmentsByCustomer(customer.id);
  const payments = db.getPayments({ customerId: customer.id, status: 'confirmed' });
  const distribution = db.getDistributions().find(d => d.customer_id === customer.id);
  const packageProducts = db.getPackageProducts();

  const totalExpected = customer.total_expected_principal || 9600;
  const totalPaid = customer.total_principal_paid || 0;
  const pct = Math.min(100, Math.round((totalPaid / totalExpected) * 100));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-navy via-brand-navyLight to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-brand-navyLighter">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🪔</span>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
                Vanakkam, {customer.full_name}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Member ID: <strong className="text-amber-400 font-mono">{customer.customer_code}</strong> • Scheme: {activeCycle.cycle_name}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-amber-300 uppercase tracking-wider block font-semibold">
              Monthly Contribution
            </span>
            <span className="text-2xl font-heading font-extrabold text-white">
              ₹800 / Month
            </span>
            <span className="text-[11px] text-slate-400 block">Due by 15th of each month</span>
          </div>
        </div>
      </div>

      {/* Account KPI Balance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500">Scheme Goal</span>
          <div className="text-2xl font-bold font-heading text-slate-900">
            {formatINR(totalExpected)}
          </div>
          <div className="text-xs text-slate-400">12 Installments @ ₹800</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500">Principal Paid</span>
          <div className="text-2xl font-bold font-heading text-emerald-700">
            {formatINR(totalPaid)}
          </div>
          <div className="text-xs text-emerald-600 font-medium">
            {customer.installments_completed_count || 0} of 12 Months Paid ({pct}%)
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500">Principal Outstanding</span>
          <div className="text-2xl font-bold font-heading text-amber-600">
            {formatINR(customer.total_principal_outstanding || 0)}
          </div>
          <div className="text-xs text-slate-400">Remaining to be paid</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500">Late Penalty Balance</span>
          <div className="text-2xl font-bold font-heading text-rose-600">
            {formatINR(customer.total_penalty_outstanding || 0)}
          </div>
          <div className="text-xs text-slate-400">Late payments after 15th</div>
        </div>

      </div>

      {/* Progress Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-800">
            Scheme Completion Status: {pct}%
          </span>
          <span className="text-slate-500">
            {totalPaid >= totalExpected ? '🎉 Completed & Eligible for Package' : `${formatINR(totalExpected - totalPaid)} remaining`}
          </span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              pct >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-amber-600'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* 12-Month Payment Schedule Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-slate-900 text-sm sm:text-base">
              12-Month Contribution Schedule
            </h3>
            <p className="text-xs text-slate-500">
              Monthly due date: 1st • Cutoff deadline: 15th (₹50 fine applies if unpaid after 15th)
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">
            12 Installments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Month / Schedule</th>
                <th className="py-3 px-4">Cutoff Deadline</th>
                <th className="py-3 px-4 text-right">Principal Due</th>
                <th className="py-3 px-4 text-right">Principal Paid</th>
                <th className="py-3 px-4 text-right">Late Penalty</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {installments.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-500">{inst.installment_number}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{inst.month_name}</td>
                  <td className="py-3 px-4 text-slate-600">{formatISTDate(inst.deadline_date)}</td>
                  <td className="py-3 px-4 text-right font-medium">{formatINR(inst.principal_amount)}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">{formatINR(inst.principal_paid)}</td>
                  <td className="py-3 px-4 text-right font-medium text-rose-600">
                    {inst.penalty_amount > 0 ? (
                      <span>₹{inst.penalty_paid} / ₹{inst.penalty_amount}</span>
                    ) : (
                      '₹0'
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                        inst.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inst.status === 'partial'
                          ? 'bg-amber-100 text-amber-800'
                          : inst.status === 'overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {inst.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deepavali Gift Hamper & Delivery Status */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-amber-200 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎁</span>
            <div>
              <h3 className="font-heading font-extrabold text-base text-amber-950">
                Your Deepavali Grocery & Gift Hamper
              </h3>
              <p className="text-xs text-amber-800">
                Delivered before Deepavali for eligible members who complete the 12 contributions
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-500 text-brand-navy rounded-full text-xs font-bold uppercase self-start">
            Status: {distribution?.status.replace('_', ' ') || 'Preparing'}
          </span>
        </div>

        {/* Package items list */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {packageProducts.map((pp) => (
            <div key={pp.id} className="bg-white/80 p-3 rounded-xl border border-amber-200/60">
              <span className="font-bold text-slate-900 block">{pp.product_name}</span>
              <span className="text-amber-800 font-semibold">{pp.quantity_per_package} {pp.unit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Receipts History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
        <h3 className="font-heading font-bold text-slate-900 text-sm sm:text-base">
          Official Contribution Receipts
        </h3>

        {payments.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No payment receipts issued yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {payments.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-mono font-bold text-brand-navy">{p.receipt_number}</div>
                  <div className="text-slate-500">{formatISTDateTime(p.payment_date)} • {p.payment_method.toUpperCase()}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{formatINR(p.amount)}</div>
                  <div className="text-[11px] text-emerald-700 font-medium">Principal: {formatINR(p.principal_allocated)}</div>
                </div>
                <button
                  onClick={() => setActiveReceipt(p)}
                  className="px-3 py-1.5 bg-brand-navy hover:bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Receipt PDF</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {activeReceipt && (
        <ReceiptModal
          payment={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}

    </div>
  );
};
