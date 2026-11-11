import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  IndianRupee,
  AlertTriangle,
  Package,
  Gift,
  ReceiptText,
  BarChart3,
  ShieldCheck,
  Settings,
  UserCheck,
  CheckCircle,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { role, isAdmin, isStaff, isCustomer } = useAuth();

  const adminLinks = [
    { to: '/', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/customers', label: 'Customer Directory', icon: Users },
    { to: '/schemes', label: 'Schemes & Cycles', icon: CalendarDays },
    { to: '/payments', label: 'Payment Collections', icon: IndianRupee },
    { to: '/penalties', label: 'Late Penalties (₹50)', icon: AlertTriangle },
    { to: '/products', label: 'Products & Suppliers', icon: Package },
    { to: '/packages', label: 'Deepavali Packages', icon: Gift },
    { to: '/expenses', label: 'Business Expenses', icon: ReceiptText },
    { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/tests', label: 'Automated Test Suite', icon: CheckCircle },
    { to: '/settings', label: 'Settings & Audit Logs', icon: Settings },
  ];

  const staffLinks = [
    { to: '/', label: 'Staff Dashboard', icon: LayoutDashboard },
    { to: '/customers', label: 'Customer Directory', icon: Users },
    { to: '/payments', label: 'Collect Cash / UPI', icon: IndianRupee },
    { to: '/packages', label: 'Package Delivery', icon: Gift },
    { to: '/tests', label: 'Verification Tests', icon: CheckCircle },
  ];

  const customerLinks = [
    { to: '/portal', label: 'My Scheme Dashboard', icon: LayoutDashboard },
    { to: '/portal/installments', label: '12-Month Schedule', icon: CalendarDays },
    { to: '/portal/receipts', label: 'My Payment Receipts', icon: IndianRupee },
    { to: '/portal/package', label: 'Deepavali Gift Package', icon: Gift },
  ];

  const links = isCustomer ? customerLinks : isStaff ? staffLinks : adminLinks;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Role Pill Banner */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
          <span className="text-xs uppercase tracking-wider font-bold text-amber-300">
            {role === 'admin' ? 'Administrator Console' : role === 'staff' ? 'Staff Field Portal' : 'Member Portal'}
          </span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/' || link.to === '/portal'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-brand-navy font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 bg-slate-950/50">
        <div className="font-semibold text-slate-300 mb-1">Subitcham Deepavali Pand</div>
        <div className="text-[11px] text-slate-400">Monthly: ₹800 • Duration: 12 Mo</div>
        <div className="text-[11px] text-amber-400/90 font-medium">Cutoff: 15th (₹50 late penalty)</div>
      </div>
    </aside>
  );
};
