import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isYesterday, isTomorrow } from "date-fns";
import { id } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format mata uang Rupiah (IDR)
 * Contoh: formatCurrency(1500000) => "Rp 1.500.000"
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "Rp 0";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format tanggal dalam Bahasa Indonesia
 */
export function formatDateID(date: Date | string | number | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";

  if (isToday(d)) {
    return `Hari ini, ${format(d, "d MMM yyyy", { locale: id })}`;
  }
  if (isYesterday(d)) {
    return `Kemarin, ${format(d, "d MMM yyyy", { locale: id })}`;
  }
  if (isTomorrow(d)) {
    return `Besok, ${format(d, "d MMM yyyy", { locale: id })}`;
  }

  return format(d, "EEEE, d MMMM yyyy", { locale: id });
}

/**
 * Format tanggal ringkas (e.g. "27 Okt 2026")
 */
export function formatShortDateID(date: Date | string | number | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return format(d, "d MMM yyyy", { locale: id });
}

/**
 * Format tanggal dan waktu (e.g. "27 Okt 2026, 14:30")
 */
export function formatDateTimeID(date: Date | string | number | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  return format(d, "d MMM yyyy, HH:mm", { locale: id });
}

/**
 * Ambil tanggal format YYYY-MM-DD
 */
export function toISODateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

