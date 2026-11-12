import React, { useState } from 'react';
import { db } from '@/lib/db';
import { formatINR } from '@/lib/utils';
import { formatISTDate } from '@/lib/dateUtils';
import { exportCustomersToExcel, exportPaymentsToExcel } from '@/lib/excelExporter';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Users,
  IndianRupee,
  AlertTriangle,
  Gift,
  Package,
  Receipt,
  CheckCircle,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const ReportCenter: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<number>(1);
  const settings = db.getSettings();

  const reportsList = [
    { id: 1, title: '1. Daily Collection Report', desc: 'Itemized collections grouped by day', icon: Calendar },
    { id: 2, title: '2. Monthly Collection Report', desc: 'Monthly principal & penalty collection summary', icon: BarChart3 },
    { id: 3, title: '3. Customer-wise Payment Report', desc: 'Complete breakdown per registered member', icon: Users },
    { id: 4, title: '4. Pending Installment Report', desc: 'Upcoming unpaid installments for active cycle', icon: IndianRupee },
    { id: 5, title: '5. Overdue Installment Report', desc: 'Installments past the 15th cutoff with late fines', icon: AlertTriangle },
    { id: 6, title: '6. Penalty Collection Report', desc: '₹50 late fine recovery audit', icon: AlertTriangle },
    { id: 7, title: '7. Outstanding Balance Report', desc: 'Net principal and penalty balances pending', icon: IndianRupee },
    { id: 8, title: '8. Business Expense Report', desc: 'Operational and capital expenditure log', icon: Receipt },
    { id: 9, title: '9. Product Purchase Report', desc: 'Procurement bills from wholesale suppliers', icon: Package },
    { id: 10, title: '10. Inventory Stock Report', desc: 'Available godown inventory and reorder alerts', icon: Package },
    { id: 11, title: '11. Package Distribution Report', desc: 'Status of Deepavali grocery hamper deliveries', icon: Gift },
    { id: 12, title: '12. Annual Business Summary', desc: 'Comprehensive financial health and cashflow', icon: CheckCircle },
  ];

  const customers = db.getCustomers();
  const payments = db.getPayments();
  const installments = db.getCustomers().flatMap(c => db.getInstallmentsByCustomer(c.id));
  const expenses = db.getExpenses();
  const products = db.getProducts();
  const distributions = db.getDistributions();
  const penalties = db.getPenalties();
  const summary = db.getDashboardSummary();

  const downloadPDFReport = (title: string, headers: string[], data: (string | number)[][]) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    
    // Header
    doc.setFillColor(11, 19, 41);
    doc.rect(0, 0, 297, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.company_name.toUpperCase(), 148, 11, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${title.toUpperCase()} | Generated: ${new Date().toLocaleString('en-IN')}`, 148, 18, { align: 'center' });

    autoTable(doc, {
      startY: 30,
      head: [headers],
      body: data,
      theme: 'grid',
      headStyles: { fillColor: [180, 83, 9], textColor: [255, 255, 255], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: 10, right: 10 },
    });

    doc.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  const handleExportPDF = () => {
    if (selectedReport === 1 || selectedReport === 2) {
      const headers = ['Receipt #', 'Member Name', 'Customer ID', 'Date', 'Principal (₹)', 'Penalty (₹)', 'Total (₹)', 'Method'];
      const data = payments.map(p => [
        p.receipt_number,
        p.customer_name || '---',
        p.customer_code || '---',
        formatISTDate(p.payment_date),
        p.principal_allocated,
        p.penalty_allocated,
        p.amount,
        p.payment_method.toUpperCase(),
      ]);
      downloadPDFReport('Daily_Monthly_Collections_Report', headers, data);
    } else if (selectedReport === 3 || selectedReport === 7) {
      const headers = ['Customer Code', 'Member Name', 'Mobile', 'Principal Expected', 'Principal Paid', 'Principal Due', 'Penalty Due', 'Status'];
      const data = customers.map(c => [
        c.customer_code,
        c.full_name,
        c.mobile,
        c.total_expected_principal || 9600,
        c.total_principal_paid || 0,
        c.total_principal_outstanding || 0,
        c.total_penalty_outstanding || 0,
        c.status.toUpperCase(),
      ]);
      downloadPDFReport('Customer_Balances_Report', headers, data);
    } else if (selectedReport === 5 || selectedReport === 6) {
      const headers = ['Member Name', 'Code', 'Inst #', 'Month', 'Cutoff Date', 'Fine Amount', 'Status'];
      const data = penalties.map(p => [
        p.customer_name || '---',
        p.customer_code || '---',
        p.installment_number || 1,
        p.month_name || '---',
        formatISTDate(p.applied_date),
        p.amount,
        p.status.toUpperCase(),
      ]);
      downloadPDFReport('Overdue_Penalties_Report', headers, data);
    } else {
      const headers = ['Category', 'Description', 'Date', 'Method', 'Supplier', 'Amount (₹)'];
      const data = expenses.map(e => [
        e.category.toUpperCase(),
        e.description,
        formatISTDate(e.expense_date),
        e.payment_method.toUpperCase(),
        e.supplier_name || 'Direct',
        e.amount,
      ]);
      downloadPDFReport('Business_Expenses_Report', headers, data);
    }
  };

  const handleExportExcel = () => {
    if (selectedReport === 3 || selectedReport === 7 || selectedReport === 4) {
      exportCustomersToExcel(customers, settings.company_name);
    } else {
      exportPaymentsToExcel(payments, settings.company_name);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900">
            Reports & Financial Statements Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Official downloadable reports in PDF and Excel formats with strict principal & penalty accounting
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-brand-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Reports Directory Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {reportsList.map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedReport === rep.id;
          return (
            <button
              key={rep.id}
              onClick={() => setSelectedReport(rep.id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-brand-navy text-white border-amber-400 shadow-md ring-2 ring-amber-400/20'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                  REP-0{rep.id}
                </span>
              </div>
              <div className="font-bold text-xs truncate">{rep.title}</div>
              <div className={`text-[11px] mt-0.5 truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                {rep.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Report Preview Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              {reportsList.find(r => r.id === selectedReport)?.title}
            </h3>
            <p className="text-xs text-slate-500">
              {reportsList.find(r => r.id === selectedReport)?.desc}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleExportPDF}
              className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
            >
              Save PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-lg"
            >
              Export Excel
            </button>
          </div>
        </div>

        {/* Dynamic Table Preview based on selectedReport */}
        <div className="overflow-x-auto text-xs">
          {(selectedReport === 1 || selectedReport === 2) && (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                <tr>
                  <th className="py-2.5 px-3">Receipt</th>
                  <th className="py-2.5 px-3">Member</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Principal Collected</th>
                  <th className="py-2.5 px-3 text-right">Late Fine (₹50)</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-brand-navy">{p.receipt_number}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{p.customer_name}</td>
                    <td className="py-2 px-3 text-slate-600">{formatISTDate(p.payment_date)}</td>
                    <td className="py-2 px-3 text-right font-medium text-emerald-700">{formatINR(p.principal_allocated)}</td>
                    <td className="py-2 px-3 text-right font-medium text-rose-600">{formatINR(p.penalty_allocated)}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">{formatINR(p.amount)}</td>
                    <td className="py-2 px-3 uppercase text-[10px] font-bold">{p.payment_method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(selectedReport === 3 || selectedReport === 4 || selectedReport === 7) && (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                <tr>
                  <th className="py-2.5 px-3">Customer ID</th>
                  <th className="py-2.5 px-3">Member Name</th>
                  <th className="py-2.5 px-3">Mobile</th>
                  <th className="py-2.5 px-3 text-right">Principal Expected</th>
                  <th className="py-2.5 px-3 text-right">Principal Paid</th>
                  <th className="py-2.5 px-3 text-right">Principal Outstanding</th>
                  <th className="py-2.5 px-3 text-right">Penalty Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-amber-700">{c.customer_code}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{c.full_name}</td>
                    <td className="py-2 px-3 text-slate-600">{c.mobile}</td>
                    <td className="py-2 px-3 text-right font-medium">{formatINR(c.total_expected_principal || 9600)}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700">{formatINR(c.total_principal_paid || 0)}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-800">{formatINR(c.total_principal_outstanding || 0)}</td>
                    <td className="py-2 px-3 text-right font-bold text-rose-600">{formatINR(c.total_penalty_outstanding || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(selectedReport === 5 || selectedReport === 6) && (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                <tr>
                  <th className="py-2.5 px-3">Member</th>
                  <th className="py-2.5 px-3">Customer ID</th>
                  <th className="py-2.5 px-3">Installment</th>
                  <th className="py-2.5 px-3">Cutoff Date</th>
                  <th className="py-2.5 px-3 text-right">Penalty Amount</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {penalties.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-900">{p.customer_name}</td>
                    <td className="py-2 px-3 font-mono text-slate-600">{p.customer_code}</td>
                    <td className="py-2 px-3">Inst #{p.installment_number} ({p.month_name})</td>
                    <td className="py-2 px-3 text-slate-500">{formatISTDate(p.applied_date)}</td>
                    <td className="py-2 px-3 text-right font-bold text-rose-600">{formatINR(p.amount)}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(selectedReport === 8 || selectedReport === 9) && (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                <tr>
                  <th className="py-2.5 px-3">Expense Code</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">{e.expense_code}</td>
                    <td className="py-2 px-3 uppercase text-[10px] font-semibold">{e.category.replace('_', ' ')}</td>
                    <td className="py-2 px-3 text-slate-800">{e.description}</td>
                    <td className="py-2 px-3 text-slate-600">{e.supplier_name || 'Direct'}</td>
                    <td className="py-2 px-3 text-slate-500">{formatISTDate(e.expense_date)}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">{formatINR(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 10 && (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                <tr>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3 text-right">Purchase Price</th>
                  <th className="py-2.5 px-3 text-right">Stock in Godown</th>
                  <th className="py-2.5 px-3 text-right">Total Inventory Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-900">{p.name}</td>
                    <td className="py-2 px-3 text-slate-600">{p.category}</td>
                    <td className="py-2 px-3 text-slate-600">{p.unit}</td>
                    <td className="py-2 px-3 text-right font-medium">{formatINR(p.purchase_price)}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">{p.available_quantity} {p.unit}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700">{formatINR(p.purchase_price * p.available_quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 11 && (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                <tr>
                  <th className="py-2.5 px-3">Member</th>
                  <th className="py-2.5 px-3">Customer ID</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3 text-right">Scheme Contribution</th>
                  <th className="py-2.5 px-3 text-center">Package Status</th>
                  <th className="py-2.5 px-3">Delivery Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {distributions.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-900">{d.customer_name}</td>
                    <td className="py-2 px-3 font-mono text-slate-600">{d.customer_code}</td>
                    <td className="py-2 px-3 text-slate-600">{d.customer_mobile}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-800">{formatINR(d.total_principal_paid || 0)}</td>
                    <td className="py-2 px-3 text-center uppercase font-bold text-[10px]">{d.status.replace('_', ' ')}</td>
                    <td className="py-2 px-3 text-slate-500">{d.delivered_date ? formatISTDate(d.delivered_date) : 'Pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 12 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border">
                <div>
                  <span className="text-slate-500 block">Total Expected Principal:</span>
                  <span className="font-bold text-base text-slate-900">{formatINR(summary.totalExpectedPrincipal)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Principal Collected:</span>
                  <span className="font-bold text-base text-emerald-700">{formatINR(summary.totalPrincipalCollected)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Penalties Collected:</span>
                  <span className="font-bold text-base text-amber-700">{formatINR(summary.totalPenaltiesCollected)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Expenses:</span>
                  <span className="font-bold text-base text-rose-700">{formatINR(summary.totalBusinessExpenses)}</span>
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-950 flex justify-between items-center">
                <div>
                  <span className="font-bold text-sm block">Net Cash Realization (Collected - Expenses)</span>
                  <span className="text-xs text-emerald-800">Based strictly on actual confirmed collections and recorded expenditures</span>
                </div>
                <div className="text-2xl font-bold font-heading text-emerald-800">
                  {formatINR(summary.totalPrincipalCollected + summary.totalPenaltiesCollected - summary.totalBusinessExpenses)}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

