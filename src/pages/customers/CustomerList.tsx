import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Customer, Installment, Payment } from '@/types';
import { formatINR } from '@/lib/utils';
import { formatISTDate } from '@/lib/dateUtils';
import { exportCustomersToExcel } from '@/lib/excelExporter';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  IndianRupee,
  Phone,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { AddCustomerModal } from '@/components/customers/AddCustomerModal';
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal';
import { ReceiptModal } from '@/components/receipt/ReceiptModal';

export const CustomerList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<string | null>(null);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<Customer | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<Payment | null>(null);

  const customers = db.getCustomers({ search, status: statusFilter });

  const handleExport = () => {
    exportCustomersToExcel(customers, db.getSettings().company_name);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">
            Customer Directory & Enrollments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage scheme members, 12-month installment schedules, and payment balances
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
            onClick={() => setIsAddOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-brand-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Add Member</span>
          </button>
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
            placeholder="Search by name, customer code (SDP-2026-XXXX), mobile number..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-slate-700 w-full sm:w-auto"
          >
            <option value="all">All Statuses ({db.getCustomers().length})</option>
            <option value="active">Active Members</option>
            <option value="completed">Completed (₹9,600 Paid)</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Member / Code</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Joining Date</th>
                <th className="py-3 px-4">Schedule Progress</th>
                <th className="py-3 px-4 text-right">Principal Paid</th>
                <th className="py-3 px-4 text-right">Principal Due</th>
                <th className="py-3 px-4 text-right">Penalty Due</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((c) => {
                const paid = c.total_principal_paid || 0;
                const expected = c.total_expected_principal || 9600;
                const pct = Math.round((paid / expected) * 100);

                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{c.full_name}</div>
                      <div className="text-[11px] font-mono text-amber-700 font-semibold">{c.customer_code}</div>
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center space-x-1 text-slate-700">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{c.mobile}</span>
                      </div>
                      {c.whatsapp && (
                        <div className="flex items-center space-x-1 text-emerald-600 text-[11px]">
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp available</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {formatISTDate(c.joining_date)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="w-36">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span>{c.installments_completed_count || 0} / 12 Months</span>
                          <span className="font-bold text-slate-700">{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct >= 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-500' : 'bg-slate-300'
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                      {formatINR(paid)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                      {formatINR(c.total_principal_outstanding || 0)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                      {(c.total_penalty_outstanding || 0) > 0 ? (
                        <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                          {formatINR(c.total_penalty_outstanding || 0)}
                        </span>
                      ) : (
                        <span className="text-slate-400">₹0</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => setSelectedCustomerDetail(c)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          title="View 12-Month Schedule & Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setSelectedCustomerForPayment(c.id)}
                          className="px-2.5 py-1.5 bg-brand-navy hover:bg-slate-800 text-white font-bold rounded-lg transition flex items-center space-x-1"
                          title="Record Payment"
                        >
                          <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[11px]">Pay</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer 12-Month Profile Modal */}
      {selectedCustomerDetail && (
        <CustomerDetailModal
          customer={selectedCustomerDetail}
          onClose={() => setSelectedCustomerDetail(null)}
          onCollectPayment={(cid) => {
            setSelectedCustomerDetail(null);
            setSelectedCustomerForPayment(cid);
          }}
          onViewReceipt={(p) => setActiveReceipt(p)}
        />
      )}

      {/* Record Payment Modal */}
      {selectedCustomerForPayment && (
        <RecordPaymentModal
          initialCustomerId={selectedCustomerForPayment}
          onClose={() => setSelectedCustomerForPayment(null)}
          onSuccess={(p) => {
            setSelectedCustomerForPayment(null);
            setActiveReceipt(p);
          }}
        />
      )}

      {/* Add Customer Modal */}
      {isAddOpen && (
        <AddCustomerModal
          onClose={() => setIsAddOpen(false)}
          onSuccess={(c) => {
            setIsAddOpen(false);
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

    </div>
  );
};

// Customer Detail & 12-Month Schedule Modal Component
const CustomerDetailModal: React.FC<{
  customer: Customer;
  onClose: () => void;
  onCollectPayment: (cid: string) => void;
  onViewReceipt: (p: Payment) => void;
}> = ({ customer, onClose, onCollectPayment, onViewReceipt }) => {
  const installments = db.getInstallmentsByCustomer(customer.id);
  const payments = db.getPayments({ customerId: customer.id });
  const distribution = db.getDistributions().find(d => d.customer_id === customer.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-brand-navy p-5 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">🪔</span>
              <h3 className="font-heading font-bold text-lg">{customer.full_name}</h3>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/30">
                {customer.customer_code}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {customer.address} • Phone: {customer.mobile}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-800 max-h-[75vh] overflow-y-auto">
          
          {/* Financial Balances Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block">Total Principal Paid:</span>
              <span className="text-base font-bold text-emerald-700">
                {formatINR(customer.total_principal_paid || 0)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Principal Outstanding:</span>
              <span className="text-base font-bold text-slate-800">
                {formatINR(customer.total_principal_outstanding || 0)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Late Penalties (₹50):</span>
              <span className="text-base font-bold text-rose-600">
                {formatINR(customer.total_penalty_outstanding || 0)} Due
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Deepavali Package:</span>
              <span className="text-xs font-bold text-amber-700 uppercase">
                {distribution?.status.replace('_', ' ') || 'Not Prepared'}
              </span>
            </div>
          </div>

          {/* 12-Month Installment Ledger */}
          <div>
            <h4 className="font-heading font-bold text-sm text-slate-900 mb-2">
              12-Month Installment Schedule (15th Deadline, ₹50 Fine)
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3">Cutoff Date</th>
                    <th className="py-2.5 px-3 text-right">Principal</th>
                    <th className="py-2.5 px-3 text-right">Paid</th>
                    <th className="py-2.5 px-3 text-right">Late Fine</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {installments.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-slate-500">{inst.installment_number}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{inst.month_name}</td>
                      <td className="py-2 px-3 text-slate-600">{formatISTDate(inst.deadline_date)}</td>
                      <td className="py-2 px-3 text-right font-medium">{formatINR(inst.principal_amount)}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700">{formatINR(inst.principal_paid)}</td>
                      <td className="py-2 px-3 text-right font-medium text-rose-600">
                        {inst.penalty_amount > 0 ? (
                          <span>₹{inst.penalty_paid} / ₹{inst.penalty_amount}</span>
                        ) : (
                          '₹0'
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          inst.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                          inst.status === 'partial' ? 'bg-amber-100 text-amber-800' :
                          inst.status === 'overdue' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {inst.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment History */}
          <div>
            <h4 className="font-heading font-bold text-sm text-slate-900 mb-2">
              Payment Transactions & Receipts
            </h4>
            {payments.length === 0 ? (
              <p className="text-slate-400 italic">No payments recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <div>
                      <div className="font-bold text-brand-navy font-mono">{p.receipt_number}</div>
                      <div className="text-slate-500">{formatISTDate(p.payment_date, 'dd MMM yyyy, hh:mm a')} • {p.payment_method.toUpperCase()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{formatINR(p.amount)}</div>
                      <div className="text-[10px] text-slate-500">
                        Principal: {formatINR(p.principal_allocated)} | Fine: {formatINR(p.penalty_allocated)}
                      </div>
                    </div>
                    <button
                      onClick={() => onViewReceipt(p)}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold transition"
                    >
                      Receipt
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
          <button
            onClick={() => onCollectPayment(customer.id)}
            className="px-5 py-2 bg-brand-navy hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow"
          >
            <IndianRupee className="w-4 h-4 text-amber-400" />
            <span>Record Payment</span>
          </button>
        </div>

      </div>
    </div>
  );
};
