import { format, parseISO, isAfter, isBefore, startOfMonth, addDays, addMonths } from 'date-fns';

export const TIMEZONE = 'Asia/Kolkata';

/**
 * Returns current date/time string formatted for IST display
 */
export function formatISTDate(date: string | Date, pattern = 'dd MMM yyyy'): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, pattern);
  } catch (e) {
    return String(date);
  }
}

export function formatISTDateTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd MMM yyyy, hh:mm a');
  } catch (e) {
    return String(date);
  }
}

/**
 * Given a month index (1 to 12) and cycle start date (e.g. 2025-11-01),
 * calculates:
 * - due_date: 1st of that installment month
 * - deadline_date: 15th of that installment month
 */
export function calculateInstallmentDates(
  cycleStartDate: string,
  installmentNumber: number,
  deadlineDay = 15
) {
  const start = parseISO(cycleStartDate);
  const monthDate = addMonths(startOfMonth(start), installmentNumber - 1);
  const dueDate = format(monthDate, 'yyyy-MM-01');
  const deadlineDate = format(addDays(monthDate, deadlineDay - 1), 'yyyy-MM-dd');
  const monthName = `Month ${installmentNumber} (${format(monthDate, 'MMMM yyyy')})`;
  const monthYear = format(monthDate, 'yyyy-MM');

  return {
    dueDate,
    deadlineDate,
    monthName,
    monthYear,
  };
}

/**
 * Checks if a payment date is strictly past the deadline date (15th)
 */
export function isPaymentPastDeadline(paymentDate: string | Date, deadlineDate: string | Date): boolean {
  const pDate = typeof paymentDate === 'string' ? parseISO(paymentDate) : paymentDate;
  const dDate = typeof deadlineDate === 'string' ? parseISO(deadlineDate) : deadlineDate;
  
  // Format to YYYY-MM-DD to compare date portion in local/IST
  const pStr = format(pDate, 'yyyy-MM-dd');
  const dStr = format(dDate, 'yyyy-MM-dd');
  
  return pStr > dStr;
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

