import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Customer } from '@/types';
import { getTodayString } from '@/lib/dateUtils';
import { UserPlus, AlertCircle, X, CheckCircle2 } from 'lucide-react';

interface AddCustomerModalProps {
  onClose: () => void;
  onSuccess: (customer: Customer) => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ onClose, onSuccess }) => {
  const activeCycle = db.getActiveCycle();
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [joiningDate, setJoiningDate] = useState(getTodayString());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Full Name is required');
      return;
    }
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setError('Please provide a valid 10-digit mobile number');
      return;
    }
    if (!address.trim()) {
      setError('Residential address is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = db.registerCustomer({
        full_name: fullName.trim(),
        mobile: cleanMobile,
        whatsapp: whatsapp ? whatsapp.replace(/\D/g, '') : cleanMobile,
        address: address.trim(),
        scheme_cycle_id: activeCycle.id,
        joining_date: joiningDate,
        notes: notes.trim(),
      });

      const customer = db.getCustomerById(res.customer_id);
      setIsSubmitting(false);
      if (customer) onSuccess(customer);
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Failed to register customer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-brand-navy p-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base">Enroll New Customer</h3>
              <p className="text-xs text-slate-300">Auto-generates 12 monthly installments (₹800/mo)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm text-slate-800">
          
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Member Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. S. Karthikeyan"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  if (!whatsapp) setWhatsapp(e.target.value);
                }}
                placeholder="10-digit mobile"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="For instant receipt send"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Address & Godown Delivery Area <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Plot 12, Sri Ram Nagar, Anna Nagar, Chennai - 600040"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Joining Date
              </label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Scheme Cycle
              </label>
              <div className="px-3 py-2 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200">
                {activeCycle.cycle_name}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Recommended by Srinivasan"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 space-y-1">
            <span className="font-bold block">✨ Automated Generation Summary:</span>
            <div>• Unique Customer Code: Auto-assigned (SDP-2026-XXXX)</div>
            <div>• 12 Monthly installments @ ₹800/mo created</div>
            <div>• Cutoff date set to 15th of each month (Asia/Kolkata)</div>
            <div>• Linked to Deepavali Package distribution list</div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-brand-navy hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>{isSubmitting ? 'Enrolling...' : 'Enroll Customer'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

