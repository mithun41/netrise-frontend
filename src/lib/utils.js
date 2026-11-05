import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge multiple Tailwind CSS class names safely
 * @param {...any} inputs 
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string
 * @param {string|Date} date 
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Truncate a string with ellipsis
 * @param {string} str 
 * @param {number} length 
 * @returns {string}
 */
export function truncate(str, length = 50) {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

export function formatTaka(value) {
  const amount = Number(value || 0);
  return `৳${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_VARIANTS = {
  APPROVED: "success",
  DELIVERED: "success",
  PENDING: "warning",
  FORWARDED: "info",
  REJECTED: "error",
  CANCELLED: "error",
  SUSPENDED: "error",
};

export function statusVariant(status) {
  return STATUS_VARIANTS[status] || "default";
}
