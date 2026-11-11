import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Customer, Payment } from '@/types';
import { formatINR, formatINRWithDecimals } from '@/lib/utils';
import { getTodayString, isPaymentPastDeadline } from '@/lib/dateUtils';
import { IndianRupee, AlertCircle, CheckCircle, X, ShieldCheck } from 'lucide-react';

interface RecordPaymentModalProps {
  initialCustomerId?: string;
  onClose: () => void;
  onSuccess: (payment: Payment) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  initialCustomerId,
  onClose,
  onSuccess,
}) => {
  const customers = db.getCustomers({ status: 'active' });
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initialCustomerId || (customers[0]?.id || '')
  );
  const [amount, setAmount] = useState<number>(800);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>('cash');
  const [upiReference, setUpiReference] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(getTodayString());
  const [collectorName, setCollectorName] = useState<string>('K. Senthil Kumar');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCustomer = db.getCustomerById(selectedCustomerId);
  const installments = selectedCustomer ? db.getInstallmentsByCustomer(selectedCustomer.id) : [];

  // Simulate preview of allocation
  let previewRemaining = amount;
  let previewPrincipal = 0;
  let previewPenalty = 0;

  if (selectedCustomer && installments.length > 0) {
    // 1. Pass 1: Principal
    for (const inst of installments) {
      if (previewRemaining <= 0) break;
      const due = inst.principal_amount - inst.principal_paid;
      if (due > 0) {
        const alloc = Math.min(previewRemaining, due);
        previewPrincipal += alloc;
        previewRemaining -= alloc;
      }
    }
    // 2. Pass 2: Penalty (existing penalty + check if payment date > deadline)
    for (const inst of installments) {
      if (previewRemaining <= 0) break;
      let penDue = inst.penalty_amount - inst.penalty_paid;
      // If payment date > deadline and unpaid, penalty will be 50
      if (penDue <= 0 && isPaymentPastDeadline(paymentDate, inst.deadline_date) && inst.principal_paid < inst.principal_amount) {
        penDue = 50;
      }
      if (penDue > 0) {
        const alloc = Math.min(previewRemaining, penDue);
        previewPenalty += alloc;
        previewRemaining -= alloc;
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCustomerId) {
      setError('Please select a customer');
      return;
    }
    if (amount <= 0) {
      setError('Amount must be greater than zero');
      return;
    }
    if (paymentMethod === 'upi' && !upiReference.trim()) {
      setError('UPI Transaction Reference is required for UPI payments');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = db.recordPayment({
        customer_id: selectedCustomerId,
        amount,
        payment_method: paymentMethod,
        payment_date: new Date(paymentDate + 'T12:00:00+05:30').toISOString(),
        upi_reference: paymentMethod === 'upi' ? upiReference.trim() : undefined,
        collector_name: collectorName.trim(),
        notes: notes.trim(),
      });

      setIsSubmitting(false);
      onSuccess(res.payment);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Failed to record payment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-brand-navy p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              ₹
            </div>
            <div>
              <h3 className="font-heading font-bold text-base">Record Payment Collection</h3>
              <p className="text-xs text-slate-300">Subitcham 12-Month Deepavali Grocery Scheme</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm text-slate-800">
          
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Customer</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
            >
              <option value="">-- Choose Member --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customer_code} - {c.full_name} ({c.mobile})
                </option>
              ))}
            </select>
          </div>

          {/* Customer Balance Summary Card */}
          {selectedCustomer && (
            <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Member:</span>
                <span className="font-bold text-slate-900">{selectedCustomer.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Principal Outstanding:</span>
                <span className="font-bold text-brand-navy">
                  {formatINR(selectedCustomer.total_principal_outstanding || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Penalty Outstanding (Past 15th):</span>
                <span className="font-bold text-rose-700">
                  {formatINR(selectedCustomer.total_penalty_outstanding || 0)}
                </span>
              </div>
            </div>
          )}

          {/* Amount and Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Payment Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-bold">₹</span>
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg text-base font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                placeholder="800"
                required
              />
            </div>
            <div className="flex space-x-2 mt-2">
              {[800, 850, 400, 1600].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition ${
                    amount === preset
                      ? 'bg-amber-100 border-amber-500 text-amber-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Date & Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payment Date (IST)
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
              <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-1.5 text-xs font-semibold rounded ${
                    paymentMethod === 'cash' ? 'bg-white shadow text-brand-navy' : 'text-slate-600'
                  }`}
                >
                  💵 Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`py-1.5 text-xs font-semibold rounded ${
                    paymentMethod === 'upi' ? 'bg-white shadow text-brand-navy' : 'text-slate-600'
                  }`}
                >
                  📱 UPI
                </button>
              </div>
            </div>
          </div>

          {/* UPI Reference if UPI */}
          {paymentMethod === 'upi' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                UPI Transaction Reference ID / UTR <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={upiReference}
                onChange={(e) => setUpiReference(e.target.value)}
                placeholder="e.g. UPI/531512938101 or GPay Trans ID"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>
          )}

          {/* Collector Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Collected By</label>
            <input
              type="text"
              value={collectorName}
              onChange={(e) => setCollectorName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
          </div>

          {/* Real-time Allocation Preview Card */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-1">
            <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
              Automatic Allocation Preview (Principal First):
            </span>
            <div className="flex justify-between text-slate-600">
              <span>Principal Allocation:</span>
              <span className="font-bold text-emerald-700">{formatINR(previewPrincipal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Late Penalty Allocation:</span>
              <span className="font-bold text-amber-700">{formatINR(previewPenalty)}</span>
            </div>
            {previewRemaining > 0 && (
              <div className="flex justify-between text-slate-500 italic">
                <span>Advance / Unallocated:</span>
                <span>{formatINR(previewRemaining)}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Collected at member residence"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-brand-navy hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{isSubmitting ? 'Recording...' : 'Confirm & Generate Receipt'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
