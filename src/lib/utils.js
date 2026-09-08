import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// All money values coming from the API (Payment.amount, FeeStructure.amount, etc.)
// are stored in the **smallest currency unit** (e.g. kobo for NGN). Convert
// back to the major unit before displaying. Use formatNaira() everywhere so
// this conversion is never missed.
const MINOR_UNIT_FACTOR = 100;

export function formatNaira(amountInMinorUnit, currency = "NGN") {
  if (amountInMinorUnit == null || amountInMinorUnit === "") return "—";
  const major = Number(amountInMinorUnit) / MINOR_UNIT_FACTOR;
  if (!Number.isFinite(major)) return "—";
  const symbol = currency === "NGN" ? "₦" : currency ? `${currency} ` : "";
  return `${symbol}${major.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

// Convert a major-unit (Naira) value entered in a form into the minor unit
// (kobo) that the API expects. Always round to the nearest integer kobo.
export function toMinorUnit(amountInMajorUnit) {
  const n = Number(amountInMajorUnit);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * MINOR_UNIT_FACTOR);
}
