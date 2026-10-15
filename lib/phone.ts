/** Collapses repeated spaces and trims the ends. */
export function tidyText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Turns a spreadsheet or typed WhatsApp value into digits with an optional +.
 * Leading and trailing spaces, gaps inside the number, dashes, and parentheses
 * are removed. `+234  801 234 5678` becomes `+2348012345678`.
 * A value Excel already shortened (`2.34801E+12`) is left unchanged so callers
 * can reject it instead of saving the wrong number.
 */
export function normalizeWhatsAppPhone(value: string): string {
  let phone = value.replace(/^\uFEFF/, "").trim();
  const hadPlus = phone.includes("+");
  if (phone.startsWith("=")) {
    phone = phone.replace(/^=\s*"?/, "").replace(/["*\s]+$/, "").trim();
  }
  phone = phone.replace(/['"*]/g, "").trim();
  const compact = phone.replace(/[\s()-]/g, "");
  if (/[eE]/.test(compact)) return compact;
  let digits = compact.replace(/\D/g, "");
  if (!digits) return "";
  // Nigerian local numbers such as 0801 234 5678 become +2348012345678.
  if (!hadPlus && digits.startsWith("0") && digits.length === 11) {
    digits = `234${digits.slice(1)}`;
    return `+${digits}`;
  }
  if (hadPlus || digits.startsWith("234")) return `+${digits}`;
  return digits;
}

export function isWhatsAppPhone(value: string): boolean {
  return /^\+\d{8,15}$/.test(value);
}

export function isExcelShortNumber(value: string): boolean {
  return /[eE][+-]?\d/.test(value.replace(/\s/g, ""));
}
