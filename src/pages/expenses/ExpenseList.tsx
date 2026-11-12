import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Expense, ExpenseCategory } from '@/types';
import { formatINR } from '@/lib/utils';
import { formatISTDate } from '@/lib/dateUtils';
import { ReceiptText, Plus, X, IndianRupee, PieChart, Tag, Truck } from 'lucide-react';
import { ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Tooltip } from 'recharts';

export const ExpenseList: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(db.getExpenses());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const suppliers = db.getSuppliers();

  // Form State
  const [category, setCategory] = useState<ExpenseCategory>('packaging');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(1000);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'bank_transfer'>('cash');
  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');

  const filteredExpenses = categoryFilter === 'all'
    ? expenses
    : expenses.filter(e => e.category === categoryFilter);

  const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);
  const productPurchaseCost = expenses
    .filter(e => e.category === 'product_purchases')
    .reduce((acc, e) => acc + e.amount, 0);

  // Category Breakdown for Chart
  const categoryMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });
  const categoryChartData = Object.entries(categoryMap).map(([cat, val]) => ({
    name: cat.replace('_', ' ').toUpperCase(),
    value: val,
  }));
  const COLORS = ['#0B132B', '#EAB308', '#10B981', '#EC4899', '#8B5CF6', '#F97316'];

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const supp = suppliers.find(s => s.id === supplierId);
    db.addExpense({
      category,
      description: description.trim(),
      amount: Number(amount),
      expense_date: expenseDate,
      payment_method: paymentMethod,
      supplier_id: supplierId || undefined,
      supplier_name: supp?.name,
      notes: notes.trim(),
    });

    setExpenses(db.getExpenses());
    setIsAddOpen(false);
    setDescription('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">
            Business Expenses & Procurement Costs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track operational expenses, packing costs, logistics, and wholesale stock payments
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-brand-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Record Business Expense</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500">Total Business Expenses</span>
          <div className="text-2xl font-heading font-extrabold text-slate-900">
            {formatINR(totalExpense)}
          </div>
          <span className="text-xs text-slate-400">{expenses.length} expense entries recorded</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500">Wholesale Product Purchases</span>
          <div className="text-2xl font-heading font-extrabold text-blue-800">
            {formatINR(productPurchaseCost)}
          </div>
          <span className="text-xs text-slate-400">Rice, Oil, Sugar, Spices inventory</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500">Operational & Packaging Costs</span>
          <div className="text-2xl font-heading font-extrabold text-amber-700">
            {formatINR(totalExpense - productPurchaseCost)}
          </div>
          <span className="text-xs text-slate-400">Jute bags, tempo rent, staff transport</span>
        </div>
      </div>

      {/* Category Breakdown & Filter Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="font-heading font-bold text-slate-900 text-sm mb-2">
            Expense Allocation by Category
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="value"
                  label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatINR(v)} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-heading font-bold text-slate-900 text-sm">
              Expense Transactions Ledger
            </h3>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1 text-xs border rounded-lg bg-white"
            >
              <option value="all">All Categories</option>
              <option value="product_purchases">Product Purchases</option>
              <option value="packaging">Packaging</option>
              <option value="transportation">Transportation</option>
              <option value="staff_expenses">Staff Expenses</option>
              <option value="rent">Rent</option>
              <option value="electricity">Electricity</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Code / Date</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Payment Method</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-slate-900">{exp.expense_code}</div>
                      <div className="text-[10px] text-slate-500">{formatISTDate(exp.expense_date)}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded font-semibold text-[10px] uppercase bg-slate-100 text-slate-700">
                        {exp.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      <div>{exp.description}</div>
                      {exp.supplier_name && (
                        <div className="text-[10px] text-amber-800">Supplier: {exp.supplier_name}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 uppercase text-[10px] font-semibold text-slate-600">
                      {exp.payment_method.replace('_', ' ')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatINR(exp.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add Expense Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-heading font-bold text-base">Record Business Expense</h3>
              <button onClick={() => setIsAddOpen(false)}><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="product_purchases">Product Purchases (Wholesale)</option>
                  <option value="packaging">Packaging (Bags, Boxes)</option>
                  <option value="transportation">Transportation / Tempo</option>
                  <option value="staff_expenses">Staff Expenses</option>
                  <option value="rent">Rent / Godown</option>
                  <option value="electricity">Electricity</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Purchase of 100 printed Deepavali non-woven bags"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Date</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Linked Supplier (Optional)</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="">-- None --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Notes / Bill Number</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Invoice #9284 / Cash voucher attached"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 border rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-navy text-white font-bold rounded-lg"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

