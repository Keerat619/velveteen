const fallbackCurrency = (import.meta.env.VITE_CURRENCY || 'INR').trim().toUpperCase();

export function formatMoney(amount, currency = fallbackCurrency) {
  const code = /^[A-Z]{3}$/.test(String(currency || '')) ? currency : fallbackCurrency;
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: code, maximumFractionDigits: 2 }).format(Number(amount) || 0);
}

export function availabilityLabel(availability) {
  if (availability === 'made-to-order') return 'Made to order';
  if (availability === 'unavailable') return 'Currently unavailable';
  return 'Available';
}
