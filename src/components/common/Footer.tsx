import React from 'react';
import { db } from '@/lib/db';

export const Footer: React.FC = () => {
  const settings = db.getSettings();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-amber-400 text-lg">🪔</span>
          <span className="font-semibold text-slate-200">{settings.company_name}</span>
          <span className="text-xs text-slate-500">• Chennai, Tamil Nadu (Asia/Kolkata)</span>
        </div>
        <div className="text-xs text-slate-400">
          © 2026 Subitcham Deepavali Pand. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};
