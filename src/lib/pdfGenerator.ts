import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Payment, Customer, Installment } from '@/types';
import { formatISTDateTime, formatISTDate } from './dateUtils';
import { formatINRWithDecimals } from './utils';

export function generatePaymentReceiptPDF(
  payment: Payment,
  customer: Customer,
  installments?: Installment[],
  companySettings?: {
    company_name: string;
    company_phone: string;
    company_address: string;
  }
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5', // Compact professional receipt size
  });

  const companyName = companySettings?.company_name || 'Subitcham Deepavali Pand';
  const companyPhone = companySettings?.company_phone || '+91 98401 23456';
  const companyAddress = companySettings?.company_address || 'Main Road, Chennai, Tamil Nadu - 600040';

  // Festive Navy Header
  doc.setFillColor(11, 19, 41); // Navy brand
  doc.rect(0, 0, 148, 28, 'F');

  // Gold accent line
  doc.setFillColor(234, 179, 8); // Gold brand
  doc.rect(0, 28, 148, 2, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName.toUpperCase(), 74, 12, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 225, 235);
  doc.text('OFFICIAL CONTRIBUTION RECEIPT | 12-MONTH DEEPAVALI GROCERY SCHEME', 74, 18, { align: 'center' });
  doc.text(`${companyAddress} | Tel: ${companyPhone}`, 74, 23, { align: 'center' });

  // Receipt Number & Date Banner
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(8, 34, 132, 16, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(8, 34, 132, 16, 2, 2, 'D');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Receipt No:', 12, 41);
  doc.setFont('helvetica', 'normal');
  doc.text(payment.receipt_number, 34, 41);

  doc.setFont('helvetica', 'bold');
  doc.text('Date & Time:', 12, 46);
  doc.setFont('helvetica', 'normal');
  doc.text(formatISTDateTime(payment.payment_date), 34, 46);

  doc.setFont('helvetica', 'bold');
  doc.text('Status:', 92, 41);
  doc.setTextColor(22, 101, 52); // green
  doc.text(payment.status.toUpperCase(), 108, 41);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Method:', 92, 46);
  doc.setFont('helvetica', 'normal');
  doc.text(payment.payment_method.toUpperCase() + (payment.upi_reference ? ` (${payment.upi_reference})` : ''), 108, 46);

  // Customer Details Box
  doc.setFillColor(254, 252, 232); // light warm gold
  doc.roundedRect(8, 54, 132, 24, 2, 2, 'F');
  doc.setDrawColor(253, 224, 71);
  doc.roundedRect(8, 54, 132, 24, 2, 2, 'D');

  doc.setFontSize(9);
  doc.setTextColor(113, 63, 18);
  doc.setFont('helvetica', 'bold');
  doc.text('MEMBER / CUSTOMER DETAILS', 12, 60);

  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Customer ID:', 12, 66);
  doc.setFont('helvetica', 'bold');
  doc.text(customer.customer_code, 36, 66);

  doc.setFont('helvetica', 'normal');
  doc.text('Member Name:', 12, 72);
  doc.setFont('helvetica', 'bold');
  doc.text(customer.full_name, 36, 72);

  doc.setFont('helvetica', 'normal');
  doc.text('Mobile No:', 85, 66);
  doc.setFont('helvetica', 'bold');
  doc.text(customer.mobile, 104, 66);

  doc.setFont('helvetica', 'normal');
  doc.text('Scheme Cycle:', 85, 72);
  doc.setFont('helvetica', 'bold');
  doc.text(customer.cycle_name || 'Deepavali 2026', 104, 72);

  // Allocation Breakdown Table
  const tableData = (payment.allocations || []).map((alloc, idx) => [
    `Inst #${alloc.installment_number || idx + 1}`,
    alloc.month_name || `Installment ${idx + 1}`,
    formatINRWithDecimals(alloc.principal_allocated),
    alloc.penalty_allocated > 0 ? formatINRWithDecimals(alloc.penalty_allocated) : '₹0.00',
    formatINRWithDecimals(alloc.principal_allocated + alloc.penalty_allocated),
  ]);

  if (tableData.length === 0) {
    tableData.push([
      'Inst #1',
      'Scheme Contribution',
      formatINRWithDecimals(payment.principal_allocated),
      formatINRWithDecimals(payment.penalty_allocated),
      formatINRWithDecimals(payment.amount),
    ]);
  }

  autoTable(doc, {
    startY: 82,
    head: [['Item', 'Month / Schedule', 'Principal (₹)', 'Late Penalty (₹)', 'Subtotal (₹)']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [11, 19, 41],
      textColor: [255, 255, 255],
      fontSize: 8,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 20 },
      1: { halign: 'left', cellWidth: 40 },
      2: { halign: 'right', cellWidth: 24 },
      3: { halign: 'right', cellWidth: 24 },
      4: { halign: 'right', cellWidth: 24 },
    },
    margin: { left: 8, right: 8 },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 120;

  // Total Payment Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(68, finalY + 4, 72, 22, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(68, finalY + 4, 72, 22, 2, 2, 'D');

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Principal Paid:', 72, finalY + 10);
  doc.text(formatINRWithDecimals(payment.principal_allocated), 136, finalY + 10, { align: 'right' });

  doc.text('Penalty Paid:', 72, finalY + 15);
  doc.text(formatINRWithDecimals(payment.penalty_allocated), 136, finalY + 15, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Total Amount Paid:', 72, finalY + 21);
  doc.setTextColor(180, 83, 9); // amber gold
  doc.text(formatINRWithDecimals(payment.amount), 136, finalY + 21, { align: 'right' });

  // Outstanding Balances Box
  doc.setFillColor(255, 241, 242); // light red
  doc.roundedRect(8, finalY + 4, 56, 22, 2, 2, 'F');
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(8, finalY + 4, 56, 22, 2, 2, 'D');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(159, 18, 57);
  doc.text('REMAINING BALANCES', 12, finalY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Principal Bal:', 12, finalY + 15);
  doc.setFont('helvetica', 'bold');
  doc.text(formatINRWithDecimals(customer.total_principal_outstanding || 0), 60, finalY + 15, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.text('Penalty Bal:', 12, finalY + 20);
  doc.setFont('helvetica', 'bold');
  doc.text(formatINRWithDecimals(customer.total_penalty_outstanding || 0), 60, finalY + 20, { align: 'right' });

  // Collector & Signature Info
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Collected by: ${payment.collector_name || 'Authorized Staff'}`, 8, finalY + 34);
  doc.text('Computer Generated Receipt. Signature not required.', 8, finalY + 39);

  // Festive Footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Wishing you and your family a prosperous & blessed Deepavali! | Subitcham Deepavali Pand',
    74,
    200,
    { align: 'center' }
  );

  return doc;
}

