export function tidyText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

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
