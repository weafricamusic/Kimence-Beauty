export function formatMoney(cents: number) {
  const fractionDigits = cents % 100 === 0 ? 0 : 2;

  return new Intl.NumberFormat("en-MW", {
    style: "currency",
    currency: "MWK",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(cents / 100);
}
