import React, { useState } from 'react';
import { db } from '@/lib/db';
import { formatISTDateTime } from '@/lib/dateUtils';
import { Settings, Shield, History, Building2, RotateCcw, CheckCircle2, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const BusinessSettingsPage: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [settings, setSettings] = useState(db.getSettings());
  const [activeTab, setActiveTab] = useState<'settings' | 'audit' | 'staff'>('settings');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const auditLogs = db.getAuditLogs();

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateSettings(settings, currentUser?.id);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset demo data back to factory defaults?')) {
      db.resetToFactory();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">
            Business Settings & Security Audit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Company branding, scheme rules, staff roles, and immutable audit logs
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleResetData}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-semibold border border-slate-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'settings'
              ? 'border-brand-navy text-brand-navy'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company & Scheme Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
            activeTab === 'audit'
              ? 'border-brand-navy text-brand-navy'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Security Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: COMPANY SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 text-xs text-slate-800">
          
          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Business settings updated successfully and saved to storage.</span>
            </div>
          )}

          <div>
            <h3 className="font-heading font-bold text-sm text-slate-900 mb-3">
              Official Company Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-1">Official Business Name</label>
                <input
                  type="text"
                  value={settings.company_name}
                  onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Company Logo URL / Asset</label>
                <input
                  type="text"
                  value={settings.company_logo_url || ''}
                  onChange={(e) => setSettings({ ...settings, company_logo_url: e.target.value })}
                  placeholder="https://... or /logo.png"
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Official Contact Phone</label>
                <input
                  type="text"
                  value={settings.company_phone}
                  onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Official Contact Email</label>
                <input
                  type="email"
                  value={settings.company_email}
                  onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                  required
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block font-bold mb-1">Business Registered Address</label>
              <textarea
                rows={2}
                value={settings.company_address}
                onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-xs"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h3 className="font-heading font-bold text-sm text-slate-900 mb-3">
              Default Financial Scheme Rules
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold mb-1">Monthly Contribution (₹)</label>
                <input
                  type="number"
                  value={settings.default_monthly_contribution}
                  onChange={(e) => setSettings({ ...settings, default_monthly_contribution: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Late Penalty Fine (₹)</label>
                <input
                  type="number"
                  value={settings.default_late_penalty}
                  onChange={(e) => setSettings({ ...settings, default_late_penalty: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Monthly Cutoff Day</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={settings.payment_deadline_day}
                  onChange={(e) => setSettings({ ...settings, payment_deadline_day: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Timezone</label>
                <input
                  type="text"
                  value={settings.timezone}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-slate-100 text-slate-600"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <label className="block font-bold mb-1">Legal Footer Text</label>
            <input
              type="text"
              value={settings.footer_text}
              onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-xs"
              required
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2.5 bg-brand-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>Save Business Settings</span>
            </button>
          </div>

        </form>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-heading font-bold text-slate-900 text-sm">
              Immutable Financial & Administrative Audit Trail
            </h3>
            <p className="text-xs text-slate-500">
              Captures confirmed collections, reversals, member enrollments, and settings changes
            </p>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                <tr>
                  <th className="py-2.5 px-3">Timestamp (IST)</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity Type</th>
                  <th className="py-2.5 px-3">User / Role</th>
                  <th className="py-2.5 px-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {formatISTDateTime(log.created_at)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-brand-navy text-[11px]">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 uppercase text-[10px] font-semibold text-slate-600">
                      {log.entity_type}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-800">{log.user_email || 'admin'}</div>
                      <div className="text-[10px] text-amber-700 capitalize">{log.user_role || 'admin'}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {log.notes || (log.new_data ? JSON.stringify(log.new_data) : '---')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
