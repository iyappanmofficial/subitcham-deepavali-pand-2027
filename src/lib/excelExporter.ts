import ExcelJS from 'exceljs';
import { Customer, Payment, Expense, Product } from '@/types';
import { formatISTDate } from './dateUtils';

export async function exportCustomersToExcel(customers: Customer[], companyName = 'Subitcham Deepavali Pand') {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Customers');

  // Title Row
  worksheet.mergeCells('A1:J1');
  const titleRow = worksheet.getCell('A1');
  titleRow.value = `${companyName} - Customer Directory`;
  titleRow.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0B132B' }, // Navy
  };
  titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 30;

  // Subtitle
  worksheet.mergeCells('A2:J2');
  const subRow = worksheet.getCell('A2');
  subRow.value = `Exported on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
  subRow.font = { size: 10, italic: true };
  subRow.alignment = { horizontal: 'center' };

  // Headers
  const headers = [
    'Customer Code',
    'Full Name',
    'Mobile',
    'WhatsApp',
    'Joining Date',
    'Status',
    'Principal Expected (₹)',
    'Principal Paid (₹)',
    'Principal Outstanding (₹)',
    'Penalty Outstanding (₹)',
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFB45309' }, // Gold / Amber
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Data Rows
  customers.forEach((c) => {
    const row = worksheet.addRow([
      c.customer_code,
      c.full_name,
      c.mobile,
      c.whatsapp || c.mobile,
      formatISTDate(c.joining_date),
      c.status.toUpperCase(),
      c.total_expected_principal || 9600,
      c.total_principal_paid || 0,
      c.total_principal_outstanding || 0,
      c.total_penalty_outstanding || 0,
    ]);

    // Align numbers to right
    [7, 8, 9, 10].forEach((colIdx) => {
      row.getCell(colIdx).numFmt = '₹#,##0.00';
      row.getCell(colIdx).alignment = { horizontal: 'right' };
    });
  });

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    let maxLength = 14;
    column.eachCell?.({ includeEmpty: false }, (cell) => {
      const colLength = cell.value ? cell.value.toString().length : 0;
      if (colLength > maxLength) {
        maxLength = colLength;
      }
    });
    column.width = maxLength + 3;
  });

  // Write and trigger download in browser
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `SDP_Customer_List_${formatISTDate(new Date(), 'yyyy-MM-dd')}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export async function exportPaymentsToExcel(payments: Payment[], companyName = 'Subitcham Deepavali Pand') {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Collections');

  worksheet.mergeCells('A1:I1');
  const title = worksheet.getCell('A1');
  title.value = `${companyName} - Payment Collections Report`;
  title.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  title.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0B132B' },
  };
  title.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 30;

  const headers = [
    'Receipt Number',
    'Customer Code',
    'Customer Name',
    'Payment Date',
    'Total Amount (₹)',
    'Principal Allocated (₹)',
    'Penalty Allocated (₹)',
    'Payment Method',
    'Status',
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFB45309' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  payments.forEach((p) => {
    const row = worksheet.addRow([
      p.receipt_number,
      p.customer_code || '---',
      p.customer_name || '---',
      formatISTDate(p.payment_date, 'dd-MM-yyyy hh:mm a'),
      p.amount,
      p.principal_allocated,
      p.penalty_allocated,
      p.payment_method.toUpperCase(),
      p.status.toUpperCase(),
    ]);

    [5, 6, 7].forEach((colIdx) => {
      row.getCell(colIdx).numFmt = '₹#,##0.00';
      row.getCell(colIdx).alignment = { horizontal: 'right' };
    });
  });

  worksheet.columns.forEach((col) => {
    col.width = 20;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SDP_Collections_${formatISTDate(new Date(), 'yyyy-MM-dd')}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
}

