import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Payment } from '@/types';
import { formatINR } from '@/lib/utils';
import { formatISTDate, formatISTDateTime } from '@/lib/dateUtils';
import { exportPaymentsToExcel } from '@/lib/excelExporter';
import {
  IndianRupee,
  Search,
  Plus,
  FileSpreadsheet,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Banknote,
} from 'lucide-react';
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal';
import { ReceiptModal } from '@/components/receipt/ReceiptModal';
import { useAuth } from '@/context/AuthContext';

export const PaymentList: React.FC = () => {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Payment | null>(null);
  const [reversalTarget, setReversalTarget] = useState<Payment | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  let payments = db.getPayments({ status: statusFilter });

  if (methodFilter !== 'all') {
    payments = payments.filter(p => p.payment_method === methodFilter);
  }
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    payments = payments.filter(
      p =>
        p.receipt_number.toLowerCase().includes(q) ||
        (p.customer_name && p.customer_name.toLowerCase().includes(q)) ||
        (p.customer_code && p.customer_code.toLowerCase().includes(q)) ||
        (p.upi_reference && p.upi_reference.toLowerCase().includes(q))
    );
  }

  const totalAmount = payments
    .filter(p => p.status === 'confirmed')
    .reduce((acc, p) => acc + p.amount, 0);
  const cashAmount = payments
    .filter(p => p.status === 'confirmed' && p.payment_method === 'cash')
    .reduce((acc, p) => acc + p.amount, 0);
  const upiAmount = payments
    .filter(p => p.status === 'confirmed' && p.payment_method === 'upi')
    .reduce((acc, p) => acc + p.amount, 0);

  const handleExport = () => {
    exportPaymentsToExcel(payments, db.getSettings().company_name);
  };

  const handleConfirmReversal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reversalTarget || !reversalReason.trim()) return;

    try {
      db.reversePayment(reversalTarget.id, reversalReason.trim());
      setReversalTarget(null);
      setReversalReason('');
    } catch (err: any) {
      alert(err.message || 'Failed to reverse payment');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">
            Payment Collections & Receipt Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Official atomic transactions for Cash and UPI payments with auto-generated receipts
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-semibold transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => setIsRecordOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-brand-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500">Total Confirmed Collections</div>
          <div className="text-2xl font-bold font-heading text-brand-navy mt-1">
            {formatINR(totalAmount)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 flex items-center space-x-1">
            <Banknote className="w-4 h-4 text-emerald-600" />
            <span>Cash Collections</span>
          </div>
          <div className="text-2xl font-bold font-heading text-emerald-700 mt-1">
            {formatINR(cashAmount)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 flex items-center space-x-1">
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span>UPI Collections</span>
          </div>
          <div className="text-2xl font-bold font-heading text-purple-700 mt-1">
            {formatINR(upiAmount)}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Receipt No (RCP-2026-XXXXX), member name, code, UPI ref..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash Only</option>
            <option value="upi">UPI Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="reversed">Reversed</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Receipt</th>
                <th className="py-3 px-4">Member Details</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-right">Principal</th>
                <th className="py-3 px-4 text-right">Late Penalty</th>
                <th className="py-3 px-4 text-right">Total Paid</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-brand-navy">
                    {p.receipt_number}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{p.customer_name}</div>
                    <div className="text-[11px] font-mono text-slate-500">{p.customer_code} • {p.customer_mobile}</div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    {formatISTDateTime(p.payment_date)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        p.payment_method === 'upi' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {p.payment_method}
                    </span>
                    {p.upi_reference && (
                      <div className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]" title={p.upi_reference}>
                        {p.upi_reference}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right font-medium text-emerald-700">
                    {formatINR(p.principal_allocated)}
                  </td>

                  <td className="py-3.5 px-4 text-right font-medium text-rose-600">
                    {p.penalty_allocated > 0 ? formatINR(p.penalty_allocated) : '₹0'}
                  </td>

                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {formatINR(p.amount)}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => setActiveReceipt(p)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded text-xs transition"
                        title="View / Print Receipt"
                      >
                        Receipt
                      </button>

                      {isAdmin && p.status === 'confirmed' && (
                        <button
                          onClick={() => setReversalTarget(p)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          title="Reverse Transaction (Atomic)"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isRecordOpen && (
        <RecordPaymentModal
          onClose={() => setIsRecordOpen(false)}
          onSuccess={(newPayment) => {
            setIsRecordOpen(false);
            setActiveReceipt(newPayment);
          }}
        />
      )}

      {/* Receipt Modal */}
      {activeReceipt && (
        <ReceiptModal
          payment={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}

      {/* Reversal Confirmation Modal */}
      {reversalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center space-x-2 text-rose-600 font-bold text-base">
              <AlertCircle className="w-5 h-5" />
              <span>Reverse Payment Transaction</span>
            </div>
            <p className="text-xs text-slate-600">
              You are about to reverse Receipt <strong>{reversalTarget.receipt_number}</strong> for amount{' '}
              <strong>{formatINR(reversalTarget.amount)}</strong>. This will atomically unwind the allocated principal and penalty from customer installments. Confirmed payments are never deleted.
            </p>

            <form onSubmit={handleConfirmReversal} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Reversal <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  placeholder="e.g. Member entered wrong UPI reference / Duplicate entry correction"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setReversalTarget(null)}
                  className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold"
                >
                  Confirm Reversal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

