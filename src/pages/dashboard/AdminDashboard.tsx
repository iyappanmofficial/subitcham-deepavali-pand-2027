import React, { useState } from 'react';
import { db } from '@/lib/db';
import { formatINR } from '@/lib/utils';
import {
  Users,
  IndianRupee,
  AlertTriangle,
  Receipt,
  Package,
  TrendingUp,
  Gift,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal';
import { AddCustomerModal } from '@/components/customers/AddCustomerModal';
import { ReceiptModal } from '@/components/receipt/ReceiptModal';
import { Payment } from '@/types';

export const AdminDashboard: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Payment | null>(null);

  const summary = db.getDashboardSummary(filter);
  const activeCycle = db.getActiveCycle();
  const customers = db.getCustomers();
  const payments = db.getPayments();
  const expenses = db.getExpenses();

  // Chart 1: Monthly Collection Breakdown (Principal vs Penalty)
  const monthlyMap: Record<string, { month: string; principal: number; penalty: number }> = {};
  payments.forEach((p) => {
    if (p.status !== 'confirmed') return;
    const m = p.payment_date.slice(0, 7); // YYYY-MM
    if (!monthlyMap[m]) {
      monthlyMap[m] = { month: m, principal: 0, penalty: 0 };
    }
    monthlyMap[m].principal += p.principal_allocated;
    monthlyMap[m].penalty += p.penalty_allocated;
  });
  const monthlyChartData = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));
  if (monthlyChartData.length === 0) {
    monthlyChartData.push({ month: '2025-11', principal: 1600, penalty: 0 });
    monthlyChartData.push({ month: '2025-12', principal: 800, penalty: 0 });
  }

  // Chart 2: Collection vs Outstanding Pie Chart
  const pieData = [
    { name: 'Collected Principal', value: summary.totalPrincipalCollected, color: '#10B981' },
    { name: 'Outstanding Principal', value: summary.totalPrincipalOutstanding, color: '#F59E0B' },
  ];

  // Chart 3: Customer Performance
  const onTimeCount = customers.filter(c => (c.total_penalty_applied || 0) === 0 && (c.total_principal_paid || 0) > 0).length;
  const lateCount = customers.filter(c => (c.total_penalty_applied || 0) > 0).length;
  const pendingCount = customers.filter(c => (c.total_principal_paid || 0) === 0).length;

  const performancePieData = [
    { name: 'On-Time Payers', value: onTimeCount || 1, color: '#10B981' },
    { name: 'Late Payers (Fine applied)', value: lateCount || 1, color: '#EF4444' },
    { name: 'Pending / New', value: pendingCount || 1, color: '#94A3B8' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-brand-navy via-brand-navyLight to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-brand-navyLighter">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🪔</span>
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
              Business Overview & Financial Health
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Active Cycle: <strong className="text-amber-400">{activeCycle.cycle_name}</strong> (Nov 2025 – Oct 2026) • 12-Month ₹800 Grocery Scheme
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-brand-navy font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment (Cash/UPI)</span>
          </button>

          <button
            onClick={() => setIsAddCustomerOpen(true)}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs sm:text-sm transition"
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Enroll Member</span>
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-xs">
        <div className="flex items-center space-x-1.5 text-slate-500 font-medium">
          <Calendar className="w-4 h-4 text-amber-500" />
          <span>Filter Metric Periods:</span>
        </div>
        <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
          {(['all', 'today', 'week', 'month'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setFilter(period)}
              className={`px-3 py-1 rounded-md capitalize font-medium transition ${
                filter === period ? 'bg-white text-brand-navy font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {period === 'all' ? 'All Time' : period}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Customers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Customer Roster</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-slate-900">
            {summary.totalCustomers}
            <span className="text-xs font-normal text-slate-400 ml-1">/ 100 Target</span>
          </div>
          <div className="text-xs text-emerald-600 font-medium flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            {summary.activeCustomers} Active • {summary.completedCustomers} Completed
          </div>
        </div>

        {/* Principal Collected */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Principal Collected</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-emerald-700">
            {formatINR(summary.totalPrincipalCollected)}
          </div>
          <div className="text-xs text-slate-500">
            Target: <strong>{formatINR(summary.totalExpectedPrincipal)}</strong>
          </div>
        </div>

        {/* Principal Outstanding */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Principal Outstanding</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-amber-600">
            {formatINR(summary.totalPrincipalOutstanding)}
          </div>
          <div className="text-xs text-slate-500">
            To be collected across 12 installments
          </div>
        </div>

        {/* Penalties Collected & Outstanding */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Late Penalties (₹50)</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-heading text-rose-600">
            {formatINR(summary.totalPenaltiesCollected)}
          </div>
          <div className="text-xs text-rose-700 font-medium">
            Outstanding: {formatINR(summary.totalPenaltiesOutstanding)} (not revenue until collected)
          </div>
        </div>

      </div>

      {/* Secondary Metrics: Expenses & Deepavali Packages */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Business Expenses</span>
            <Receipt className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold font-heading text-purple-900">
            {formatINR(summary.totalBusinessExpenses)}
          </div>
          <div className="text-xs text-slate-500">
            Packaging, logistics, wholesale
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Wholesale Grocery Purchases</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold font-heading text-blue-900">
            {formatINR(summary.totalProductPurchasingCosts)}
          </div>
          <div className="text-xs text-slate-500">
            Rice, Sugar, Oils, Dal inventory
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Net Operating Cash Flow</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-heading text-emerald-800">
            {formatINR(summary.totalPrincipalCollected + summary.totalPenaltiesCollected - summary.totalBusinessExpenses)}
          </div>
          <div className="text-xs text-slate-500">
            Actual collected minus actual expenses
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Deepavali Gift Packages</span>
            <Gift className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-heading text-amber-700">
            {summary.pendingPackageDistributions} Pending
          </div>
          <div className="text-xs text-emerald-600 font-medium">
            {summary.deliveredPackageDistributions} Distributed
          </div>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Collections Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-slate-900 text-sm">
                Monthly Collections (Principal vs Late Fine)
              </h3>
              <p className="text-xs text-slate-500">Aggregated by month in Asia/Kolkata timezone</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
              ₹800/mo Baseline
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(value: number) => formatINR(value)} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="principal" name="Principal (₹)" fill="#0B132B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="penalty" name="Late Penalty (₹)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Collection vs Outstanding Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-slate-900 text-sm">
                Scheme Principal Realization
              </h3>
              <p className="text-xs text-slate-500">Collected vs Remaining Principal</p>
            </div>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => formatINR(val)} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-slate-900 text-sm sm:text-base">
              Recent Confirmed Collections
            </h3>
            <p className="text-xs text-slate-500">Atomic server-side principal & penalty ledger</p>
          </div>
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center space-x-1"
          >
            <span>+ Record New</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Receipt</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Principal</th>
                <th className="py-3 px-4 text-right">Penalty</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.slice(0, 5).map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-brand-navy">
                    {p.receipt_number}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{p.customer_name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{p.customer_code}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {p.payment_date.slice(0, 10)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                      p.payment_method === 'upi' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {p.payment_method}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-emerald-700">
                    {formatINR(p.principal_allocated)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-rose-600">
                    {p.penalty_allocated > 0 ? formatINR(p.penalty_allocated) : '₹0'}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {formatINR(p.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setActiveReceipt(p)}
                      className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-brand-navy font-semibold rounded-lg transition"
                    >
                      View / Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isRecordModalOpen && (
        <RecordPaymentModal
          onClose={() => setIsRecordModalOpen(false)}
          onSuccess={(newPayment) => {
            setIsRecordModalOpen(false);
            setActiveReceipt(newPayment);
          }}
        />
      )}

      {isAddCustomerOpen && (
        <AddCustomerModal
          onClose={() => setIsAddCustomerOpen(false)}
          onSuccess={() => {
            setIsAddCustomerOpen(false);
          }}
        />
      )}

      {activeReceipt && (
        <ReceiptModal
          payment={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}

    </div>
  );
};
