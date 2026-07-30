/** Shared commerce pricing rules (cart, checkout, orders) */
export const FREE_SHIPPING_THRESHOLD = 75;
export const SHIPPING_FLAT = 9.99;
export const TAX_RATE = 0.08;

export function calcShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
}

export function calcTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE * 100) / 100;
}

export function calcTotals(subtotal: number) {
  const shipping = calcShipping(subtotal);
  const tax = calcTax(subtotal);
  const total = Math.round((subtotal + shipping + tax) * 100) / 100;
  return { subtotal, shipping, tax, total };
}

export function amountToFreeShipping(subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return Math.round((FREE_SHIPPING_THRESHOLD - subtotal) * 100) / 100;
}
