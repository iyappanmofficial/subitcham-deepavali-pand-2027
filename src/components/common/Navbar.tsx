import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { Sparkles, Shield, User, LogOut, Database, RefreshCw, CheckCircle2 } from 'lucide-react';
import { UserRole } from '@/types';

export const Navbar: React.FC = () => {
  const { currentUser, role, switchRole, logout, isSupabaseConnected } = useAuth();
  const settings = db.getSettings();

  return (
    <header className="bg-brand-navy border-b border-brand-navyLighter sticky top-0 z-40 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-brand-navy font-black text-xl">
              🪔
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading font-bold text-lg text-white tracking-wide">
                  {settings.company_name}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Sparkles className="w-3 h-3 mr-1 text-amber-400" />
                  12-Mo Scheme
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                ₹800/mo • ₹9,600 Total • 15th Deadline • Deepavali Grocery Package
              </p>
            </div>
          </div>

          {/* Right Section: DB Status, Role Switcher, Profile */}
          <div className="flex items-center space-x-3">
            
            {/* Supabase / Local indicator */}
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-800/70 border border-slate-700 text-slate-300">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>{isSupabaseConnected ? 'Supabase Live' : 'Offline / Local DB'}</span>
              <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}></span>
            </div>

            {/* Quick Role Switcher for Pair-Programming & Verification */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400 px-2 font-medium hidden lg:inline">Role:</span>
              {(['admin', 'staff', 'customer'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
                    role === r
                      ? 'bg-amber-500 text-brand-navy font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title={`Switch view to ${r}`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-200">{currentUser?.full_name}</div>
                <div className="text-[10px] text-amber-400 capitalize">{currentUser?.role} Mode</div>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
