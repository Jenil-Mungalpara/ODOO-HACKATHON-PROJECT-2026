/**
 * Format a number as Indian Rupee currency.
 */
export function formatCurrency(value, symbol = '₹') {
  if (value == null || isNaN(value)) return '—';
  return `${symbol}${Number(value).toLocaleString('en-IN')}`;
}

/**
 * Format a date string to locale date.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

/**
 * Format a date string to locale date + time.
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

/**
 * Format a number with comma separators.
 */
export function formatNumber(value, suffix = '') {
  if (value == null || isNaN(value)) return '—';
  return `${Number(value).toLocaleString()}${suffix}`;
}

/**
 * Calculate percentage and format.
 */
export function formatPercent(value, total) {
  if (!total || total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

/**
 * Truncate a string to maxLen characters.
 */
export function truncate(str, maxLen = 50) {
  if (!str) return '—';
  return str.length > maxLen ? str.substring(0, maxLen) + '…' : str;
}

/**
 * Check if a date is in the past.
 */
export function isExpired(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

/**
 * Get days until a date (negative if past).
 */
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
