/**
 * Kodedock UI - Design System & Component Primitives
 */

export const THEMES = {
  DARK: "dark",
  LIGHT: "light",
} as const;

export type Theme = (typeof THEMES)[keyof typeof THEMES];

export function formatPriceINR(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}
