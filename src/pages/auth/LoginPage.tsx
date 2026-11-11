import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { Sparkles, Shield, User, Lock, Mail, ArrowRight } from 'lucide-react';
import { UserRole } from '@/types';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const settings = db.getSettings();
  const [email, setEmail] = useState('admin@subitchampand.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('admin');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await login(email, role);
    setIsLoading(false);
  };

  const handleQuickSelect = (chosenRole: UserRole) => {
    setRole(chosenRole);
    if (chosenRole === 'admin') setEmail('admin@subitchampand.com');
    else if (chosenRole === 'staff') setEmail('staff@subitchampand.com');
    else setEmail('customer@subitchampand.com');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-navyLight to-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 items-center justify-center shadow-xl shadow-amber-500/20 text-3xl font-black mb-3">
          🪔
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-wide">
          {settings.company_name}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-amber-300 font-medium">
          12-Month Deepavali Grocery Scheme Management Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-200 text-slate-900">
          
          {/* Quick Role Switcher Banner */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-600 mb-2">
              Select Demo Role to Sign In:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['admin', 'staff', 'customer'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleQuickSelect(r)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition border ${
                    role === r
                      ? 'bg-amber-500 text-brand-navy border-amber-600 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-brand-navy hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition text-xs sm:text-sm"
            >
              <span>{isLoading ? 'Signing In...' : `Sign In as ${role.toUpperCase()}`}</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </form>

          {/* Scheme Quick Specs */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Contribution:</span>
              <strong className="text-slate-800">₹800 / month (12 Months)</strong>
            </div>
            <div className="flex justify-between">
              <span>Due Date:</span>
              <strong className="text-slate-800">15th of each month</strong>
            </div>
            <div className="flex justify-between">
              <span>Late Penalty:</span>
              <strong className="text-rose-600">₹50 (after 15th)</strong>
            </div>
            <div className="flex justify-between">
              <span>Customer Benefit:</span>
              <strong className="text-amber-700">Deepavali Grocery Hamper</strong>
            </div>
          </div>

        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-400">
          © 2026 Subitcham Deepavali Pand. All Rights Reserved.
        </p>
      </div>

    </div>
  );
};
