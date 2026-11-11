import React, { useState } from 'react';
import { db } from '@/lib/db';
import { SchemeCycle } from '@/types';
import { formatINR } from '@/lib/utils';
import { formatISTDate } from '@/lib/dateUtils';
import { CalendarDays, Plus, CheckCircle, Clock, Sparkles, X, AlertCircle } from 'lucide-react';

export const SchemeManagement: React.FC = () => {
  const schemes = db.getSchemes();
  const defaultScheme = schemes[0];
  const [cycles, setCycles] = useState<SchemeCycle[]>(db.getCycles());
  const [isCreateCycleOpen, setIsCreateCycleOpen] = useState(false);

  const [cycleName, setCycleName] = useState('Deepavali 2027 Cycle');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2027-10-31');
  const [deepavaliDate, setDeepavaliDate] = useState('2027-10-29');
  const [expectedCustomers, setExpectedCustomers] = useState(100);

  const handleCreateCycle = (e: React.FormEvent) => {
    e.preventDefault();
    const created = db.createCycle({
      scheme_id: defaultScheme.id,
      cycle_name: cycleName,
      start_date: startDate,
      end_date: endDate,
      deepavali_date: deepavaliDate,
      status: 'upcoming',
      expected_customers: Number(expectedCustomers),
    });
    setCycles(db.getCycles());
    setIsCreateCycleOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">
            Scheme Configuration & Cycles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure installment parameters and create new annual Deepavali scheme cycles
          </p>
        </div>

        <button
          onClick={() => setIsCreateCycleOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-brand-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Create New Scheme Cycle</span>
        </button>
      </div>

      {/* Scheme Parameters Overview Card */}
      <div className="bg-gradient-to-br from-brand-navy via-brand-navyLight to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-brand-navyLighter space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🪔</span>
            <div>
              <h2 className="font-heading font-extrabold text-lg text-white">
                {defaultScheme.name}
              </h2>
              <p className="text-xs text-amber-300">
                Official Business Rules & Financial Model
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
            Active Scheme
          </span>
        </div>

        {/* Financial Rules Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2 border-t border-brand-navyLighter">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block mb-0.5">Monthly Contribution:</span>
            <span className="text-xl font-bold font-heading text-amber-400">₹800 / month</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block mb-0.5">Scheme Duration:</span>
            <span className="text-xl font-bold font-heading text-white">12 Months</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block mb-0.5">Total per Member:</span>
            <span className="text-xl font-bold font-heading text-emerald-400">₹9,600</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block mb-0.5">Late Payment Penalty:</span>
            <span className="text-xl font-bold font-heading text-rose-400">₹50 (after 15th)</span>
          </div>
        </div>

        {/* Scale Projections Callout */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-200 flex flex-wrap items-center justify-between gap-3">
          <span className="font-semibold">Expected Gross Principal Scale:</span>
          <div className="flex space-x-4 text-[11px]">
            <span>50 Members: <strong className="text-white">₹4,80,000</strong></span>
            <span>75 Members: <strong className="text-white">₹7,20,000</strong></span>
            <span>100 Members: <strong className="text-white">₹9,60,000</strong></span>
          </div>
        </div>
      </div>

      {/* Scheme Cycles List */}
      <div>
        <h3 className="font-heading font-bold text-slate-900 text-base mb-3">
          Annual Cycles (Historical & Active)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cycles.map((cy) => (
            <div
              key={cy.id}
              className={`p-5 rounded-2xl border transition shadow-sm bg-white ${
                cy.status === 'active' ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-5 h-5 text-amber-500" />
                  <h4 className="font-heading font-bold text-slate-900 text-base">
                    {cy.cycle_name}
                  </h4>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                    cy.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cy.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Cycle Duration:</span>
                  <span className="font-semibold text-slate-800">
                    {formatISTDate(cy.start_date)} to {formatISTDate(cy.end_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Deepavali Celebration:</span>
                  <span className="font-bold text-amber-700">
                    {formatISTDate(cy.deepavali_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Target Enrollees:</span>
                  <span className="font-semibold text-slate-800">
                    {cy.expected_customers} Members ({formatINR(cy.expected_customers * 9600)})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Create Scheme Cycle */}
      {isCreateCycleOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-brand-navy p-5 text-white flex items-center justify-between">
              <h3 className="font-heading font-bold text-base">Create New Scheme Cycle</h3>
              <button onClick={() => setIsCreateCycleOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCycle} className="p-6 space-y-4 text-xs text-slate-800">
              <div>
                <label className="block font-bold mb-1">Cycle Name</label>
                <input
                  type="text"
                  value={cycleName}
                  onChange={(e) => setCycleName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Deepavali Date</label>
                  <input
                    type="date"
                    value={deepavaliDate}
                    onChange={(e) => setDeepavaliDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Target Customers</label>
                  <input
                    type="number"
                    value={expectedCustomers}
                    onChange={(e) => setExpectedCustomers(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateCycleOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-navy text-white rounded-lg text-xs font-bold"
                >
                  Save Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
