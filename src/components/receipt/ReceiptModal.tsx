import React, { useRef } from 'react';
import { Payment, Customer } from '@/types';
import { db } from '@/lib/db';
import { generatePaymentReceiptPDF } from '@/lib/pdfGenerator';
import { formatISTDate, formatISTDateTime } from '@/lib/dateUtils';
import { formatINR, formatINRWithDecimals } from '@/lib/utils';
import { Download, Printer, Share2, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReceiptModalProps {
  payment: Payment;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ payment, onClose }) => {
  const customer = db.getCustomerById(payment.customer_id);
  const settings = db.getSettings();
  const printableRef = useRef<HTMLDivElement>(null);

  if (!customer) return null;

  const handleDownloadPDF = () => {
    const doc = generatePaymentReceiptPDF(payment, customer, undefined, settings);
    doc.save(`${payment.receipt_number}_${customer.customer_code}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = 
`🪔 *${settings.company_name}* 🪔
*OFFICIAL PAYMENT RECEIPT*

*Receipt No:* ${payment.receipt_number}
*Member:* ${customer.full_name} (${customer.customer_code})
*Date:* ${formatISTDateTime(payment.payment_date)}
*Payment Method:* ${payment.payment_method.toUpperCase()}${payment.upi_reference ? ` (${payment.upi_reference})` : ''}

*Amount Paid:* ${formatINR(payment.amount)}
• Principal Allocated: ${formatINR(payment.principal_allocated)}
• Penalty Allocated: ${formatINR(payment.penalty_allocated)}

*Remaining Balances:*
• Principal Outstanding: ${formatINR(customer.total_principal_outstanding || 0)}
• Penalty Outstanding: ${formatINR(customer.total_penalty_outstanding || 0)}

*Collected by:* ${payment.collector_name || 'Staff'}

_Thank you for your timely contribution towards your Deepavali grocery package!_`;

    const encoded = encodeURIComponent(text);
    const cleanMobile = customer.whatsapp?.replace(/\D/g, '') || customer.mobile.replace(/\D/g, '');
    const mobileWithCountry = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    window.open(`https://wa.me/${mobileWithCountry}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Action Bar */}
        <div className="bg-brand-navy p-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🪔</span>
            <div>
              <h3 className="font-bold text-sm tracking-wide">OFFICIAL RECEIPT</h3>
              <p className="text-xs text-amber-300 font-mono">{payment.receipt_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div ref={printableRef} className="p-6 text-slate-800 space-y-4 text-sm bg-white">
          
          {/* Company Branding */}
          <div className="text-center border-b border-amber-200 pb-3">
            <h2 className="font-heading font-extrabold text-lg text-brand-navy">
              {settings.company_name}
            </h2>
            <p className="text-xs text-slate-600">
              12-Month Deepavali Grocery Scheme • Monthly ₹800
            </p>
            <p className="text-[11px] text-slate-500">
              {settings.company_address} • Ph: {settings.company_phone}
            </p>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block">Receipt No:</span>
              <span className="font-bold font-mono text-slate-900">{payment.receipt_number}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Date & Time:</span>
              <span className="font-medium text-slate-900">{formatISTDateTime(payment.payment_date)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Payment Method:</span>
              <span className="font-bold text-slate-900 uppercase">
                {payment.payment_method} {payment.upi_reference && `(${payment.upi_reference})`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Status:</span>
              <span className="inline-flex items-center text-emerald-700 font-bold uppercase">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                {payment.status}
              </span>
            </div>
          </div>

          {/* Customer Details Box */}
          <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200 text-xs">
            <div className="font-bold text-amber-900 mb-1">MEMBER DETAILS:</div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-600">Customer ID:</span>
              <span className="font-bold font-mono text-slate-900">{customer.customer_code}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-600">Member Name:</span>
              <span className="font-bold text-slate-900">{customer.full_name}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-600">Mobile:</span>
              <span className="font-medium text-slate-900">{customer.mobile}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-600">Scheme Cycle:</span>
              <span className="font-medium text-slate-900">{customer.cycle_name || 'Deepavali 2026'}</span>
            </div>
          </div>

          {/* Allocation Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 text-left">Installment / Description</th>
                  <th className="py-2 px-3 text-right">Principal</th>
                  <th className="py-2 px-3 text-right">Penalty</th>
                  <th className="py-2 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(payment.allocations || []).map((alloc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3">
                      <div className="font-medium text-slate-900">
                        Inst #{alloc.installment_number || idx + 1}
                      </div>
                      <div className="text-[11px] text-slate-500">{alloc.month_name}</div>
                    </td>
                    <td className="py-2 px-3 text-right font-medium">
                      {formatINRWithDecimals(alloc.principal_allocated)}
                    </td>
                    <td className="py-2 px-3 text-right text-rose-600 font-medium">
                      {alloc.penalty_allocated > 0 ? formatINRWithDecimals(alloc.penalty_allocated) : '₹0.00'}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {formatINRWithDecimals(alloc.principal_allocated + alloc.penalty_allocated)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment Summary Box */}
          <div className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-lg">
            <div>
              <span className="text-xs text-amber-300 font-medium block">Total Amount Received</span>
              <span className="text-xs text-slate-400">
                (Principal: {formatINR(payment.principal_allocated)} + Penalty: {formatINR(payment.penalty_allocated)})
              </span>
            </div>
            <div className="text-xl font-bold font-heading text-amber-400">
              {formatINRWithDecimals(payment.amount)}
            </div>
          </div>

          {/* Remaining Balances Box */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              <span className="text-rose-700 font-semibold block">Principal Outstanding:</span>
              <span className="text-base font-bold text-rose-900">
                {formatINR(customer.total_principal_outstanding || 0)}
              </span>
            </div>
            <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              <span className="text-amber-700 font-semibold block">Penalty Outstanding:</span>
              <span className="text-base font-bold text-amber-900">
                {formatINR(customer.total_penalty_outstanding || 0)}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between items-center">
            <span>Collected By: <strong className="text-slate-700">{payment.collector_name || 'Staff'}</strong></span>
            <span className="italic">Computer Generated Receipt</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-brand-navy text-white hover:bg-slate-800 transition shadow"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>

          <button
            onClick={handleWhatsAppShare}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow"
          >
            <Share2 className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
};
