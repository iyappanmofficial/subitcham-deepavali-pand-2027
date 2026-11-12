import React, { useState } from 'react';
import { db } from '@/lib/db';
import { formatINR } from '@/lib/utils';
import { formatISTDate, formatISTDateTime } from '@/lib/dateUtils';
import { Gift, Package, CheckCircle2, Clock, AlertCircle, Truck, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const DeepavaliPackageManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'composition' | 'distribution'>('composition');

  const activeCycle = db.getActiveCycle();
  const packageProducts = db.getPackageProducts();
  const distributions = db.getDistributions({ status: statusFilter });
  const allDistributions = db.getDistributions();
  const products = db.getProducts();
  const customers = db.getCustomers();

  // Unit Cost of one package
  const unitPackageCost = packageProducts.reduce((acc, pp) => {
    return acc + (pp.purchase_price || 0) * pp.quantity_per_package;
  }, 0);

  // Eligible / Active customers count
  const eligibleCustomerCount = customers.filter(c => (c.total_principal_paid || 0) >= (c.total_expected_principal || 9600)).length;
  const totalEnrolled = customers.length || 1;

  const handleUpdateStatus = (distId: string, newStatus: any) => {
    db.updateDistributionStatus(distId, newStatus, currentUser?.full_name || 'Staff');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">
          Deepavali Grocery Package & Distribution
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Package recipe composition, automatic wholesale inventory demand calculation, and delivery fulfillment
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('composition')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'composition'
              ? 'border-brand-navy text-brand-navy'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Package Composition & Stock Demand</span>
        </button>

        <button
          onClick={() => setActiveTab('distribution')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'distribution'
              ? 'border-brand-navy text-brand-navy'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Member Distribution Roster ({distributions.length})</span>
        </button>
      </div>

      {/* TAB 1: PACKAGE COMPOSITION & DEMAND CALCULATOR */}
      {activeTab === 'composition' && (
        <div className="space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-brand-navy to-slate-900 text-white p-5 rounded-2xl border border-brand-navyLighter shadow-lg">
              <span className="text-xs text-amber-300 block">Single Package Cost</span>
              <div className="text-3xl font-heading font-extrabold text-white mt-1">
                {formatINR(unitPackageCost)}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">Sum of wholesale items per member</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 block">Eligible Members (Completed)</span>
              <div className="text-3xl font-heading font-extrabold text-emerald-700 mt-1">
                {eligibleCustomerCount} / {totalEnrolled}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">Paid ₹9,600 in full</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 block">Total Packaging Cost Projection</span>
              <div className="text-3xl font-heading font-extrabold text-amber-600 mt-1">
                {formatINR(unitPackageCost * totalEnrolled)}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">For {totalEnrolled} active scheme enrollees</span>
            </div>
          </div>

          {/* Composition Table with Automatic Demand Calculation */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-slate-900 text-sm sm:text-base">
                  Deepavali Gift Hamper Composition
                </h3>
                <p className="text-xs text-slate-500">
                  Itemized items included in each eligible member's festive hamper
                </p>
              </div>
              <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-bold">
                Demand for {totalEnrolled} Members
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Hamper Item</th>
                    <th className="py-3 px-4 text-center">Qty / Package</th>
                    <th className="py-3 px-4 text-right">Wholesale Price</th>
                    <th className="py-3 px-4 text-right">Cost / Package</th>
                    <th className="py-3 px-4 text-right">Total Demand ({totalEnrolled} members)</th>
                    <th className="py-3 px-4 text-right">Stock in Godown</th>
                    <th className="py-3 px-4 text-center">Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {packageProducts.map((pp) => {
                    const itemCost = (pp.purchase_price || 0) * pp.quantity_per_package;
                    const totalDemand = pp.quantity_per_package * totalEnrolled;
                    const stock = products.find(p => p.id === pp.product_id)?.available_quantity || 0;
                    const hasSufficient = stock >= totalDemand;

                    return (
                      <tr key={pp.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {pp.product_name}
                          {pp.notes && <div className="text-[11px] text-slate-500 font-normal">{pp.notes}</div>}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                          {pp.quantity_per_package} {pp.unit}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium">
                          {formatINR(pp.purchase_price || 0)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-brand-navy">
                          {formatINR(itemCost)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                          {totalDemand} {pp.unit}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium">
                          {stock} {pp.unit}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                              hasSufficient
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {hasSufficient ? 'Stock Ready' : `Shortage (${totalDemand - stock} ${pp.unit})`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: MEMBER DISTRIBUTION ROSTER */}
      {activeTab === 'distribution' && (
        <div className="space-y-4">
          
          {/* Status Filter */}
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-700">Filter Distribution State:</span>
            <div className="flex space-x-1">
              {(['all', 'not_prepared', 'preparing', 'ready', 'delivered'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg capitalize font-medium transition ${
                    statusFilter === st
                      ? 'bg-brand-navy text-white font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Roster Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4 text-right">Scheme Contribution</th>
                    <th className="py-3 px-4 text-center">Eligibility</th>
                    <th className="py-3 px-4 text-center">Package Status</th>
                    <th className="py-3 px-4">Delivery Details</th>
                    <th className="py-3 px-4 text-center">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {distributions.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{d.customer_name}</div>
                        <div className="text-[11px] font-mono text-slate-500">{d.customer_code}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">{d.customer_mobile}</td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatINR(d.total_principal_paid || 0)} / ₹9,600
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                            d.is_eligible
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {d.is_eligible ? 'Eligible' : 'Pending Dues'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                            d.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : d.status === 'ready'
                              ? 'bg-blue-100 text-blue-800'
                              : d.status === 'preparing'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {d.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                        {d.delivered_date ? (
                          <div>
                            <div className="font-bold text-slate-900">{formatISTDateTime(d.delivered_date)}</div>
                            <div className="text-slate-500">Delivered by: {d.confirmed_by_name || 'Staff'}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not yet delivered</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={d.status}
                          onChange={(e) => handleUpdateStatus(d.id, e.target.value)}
                          className="px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-700"
                        >
                          <option value="not_prepared">Not Prepared</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready for Distribution</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

