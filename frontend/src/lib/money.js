// Prices are always stored in PKR. These helpers show them in the user's currency.

/** Must match StripeAdapter.PKR_TO_USD_RATE on the backend. */
export const PKR_PER_USD = 280

/**
 * formatPrice(45000)          → "PKR 45,000"
 * formatPrice(45000, 'USD')   → "$160.71"
 */
export function formatPrice(pkr, currency = 'PKR') {
  const amount = Number(pkr) || 0
  if (currency === 'USD') {
    return (amount / PKR_PER_USD).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
  return `PKR ${Math.round(amount).toLocaleString('en-PK')}`
}
