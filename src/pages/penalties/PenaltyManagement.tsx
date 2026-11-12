import React, { useState } from 'react';
import { db } from '@/lib/db';
import { formatINR } from '@/lib/utils';
import { formatISTDate } from '@/lib/dateUtils';
import { AlertTriangle, CheckCircle, Clock, ShieldCheck, RefreshCw } from 'lucide-react';

export const PenaltyManagement: React.FC = () => {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().slice(0, 10));
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const penalties = db.getPenalties();
  const totalApplied = penalties.reduce((acc, p) => acc + p.amount, 0);
  const totalPaid = penalties.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0);
  const totalOutstanding = Math.max(0, totalApplied - totalPaid);

  const handleScanAndApply = () => {
    const count = db.applyLatePenalties(asOfDate, 50);
    setAppliedNotice(
      count > 0
        ? `Applied late fine of ₹50 to ${count} overdue installment(s) past the 15th.`
        : `All installments past ${asOfDate} already evaluated. No duplicate penalties generated.`
    );
    setTimeout(() => setAppliedNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">
          Late Payment Penalty Management (₹50)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Enforce the 15th monthly cutoff rule with strict principal-first separation
        </p>
      </div>

      {/* Rules Explainer Card */}
      <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl text-xs text-amber-950 space-y-2">
        <div className="flex items-center space-x-2 font-bold text-sm text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Official Business Penalty & Accounting Rules</span>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-disc pl-4 text-slate-700">
          <li><strong>Deadline:</strong> 15th of every month (calculated strictly in Asia/Kolkata timezone).</li>
          <li><strong>Penalty Amount:</strong> Flat ₹50 per installment when unpaid after the 15th has passed.</li>
          <li><strong>Idempotency:</strong> Penalty must be applied only once per installment. No duplicates.</li>
          <li><strong>Separation:</strong> Penalty is separately recorded. Never added to principal balance.</li>
          <li><strong>Principal-First Priority:</strong> Every payment allocates to principal before late penalty.</li>
          <li><strong>Revenue Integrity:</strong> Uncollected penalties are never counted as revenue until paid.</li>
        </ul>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500">Total Penalties Applied</div>
          <div className="text-2xl font-bold font-heading text-slate-900 mt-1">
            {formatINR(totalApplied)}
          </div>
          <div className="text-xs text-slate-400 mt-1">{penalties.length} occurrences</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Penalties Collected (Revenue)</span>
          </div>
          <div className="text-2xl font-bold font-heading text-emerald-700 mt-1">
            {formatINR(totalPaid)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Confirmed with receipts</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 flex items-center space-x-1">
            <Clock className="w-4 h-4 text-rose-600" />
            <span>Penalties Outstanding</span>
          </div>
          <div className="text-2xl font-bold font-heading text-rose-600 mt-1">
            {formatINR(totalOutstanding)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Pending member settlement</div>
        </div>
      </div>

      {/* Manual / Automated Penalty Engine Trigger */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            Scan & Apply 15th Deadline Penalties
          </h3>
          <p className="text-xs text-slate-500">
            Scans active members with unpaid installments past cutoff date and applies ₹50 fine idempotently
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
          />
          <button
            onClick={handleScanAndApply}
            className="flex items-center space-x-1 px-4 py-2 bg-brand-navy hover:bg-slate-800 text-white font-bold rounded-lg text-xs shadow"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Run Penalty Engine</span>
          </button>
        </div>
      </div>

      {appliedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-medium">
          {appliedNotice}
        </div>
      )}

      {/* Penalties Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Installment #</th>
                <th className="py-3 px-4">Month / Schedule</th>
                <th className="py-3 px-4">Applied Date</th>
                <th className="py-3 px-4 text-right">Fine Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {penalties.map((pen) => (
                <tr key={pen.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{pen.customer_name}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{pen.customer_code}</td>
                  <td className="py-3 px-4">Inst #{pen.installment_number}</td>
                  <td className="py-3 px-4 text-slate-600">{pen.month_name}</td>
                  <td className="py-3 px-4 text-slate-500">{formatISTDate(pen.applied_date)}</td>
                  <td className="py-3 px-4 text-right font-bold text-rose-600">
                    {formatINR(pen.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        pen.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {pen.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

