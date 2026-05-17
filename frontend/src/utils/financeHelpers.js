export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'INR',
  }).format(Number(value || 0))

export const clampPercent = (value) => Math.max(0, Math.min(Number(value || 0), 100))
