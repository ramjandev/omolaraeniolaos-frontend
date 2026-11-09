export const BANK_DETAILS = {
  bank: "Your Bank",
  accountNumber: "0000000000",
  accountName: "McEnies Vite Ltd",
};

export const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export function formatTime(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

const inputBase =
  "w-full h-11 sm:h-12 rounded-[12px] border border-[#E8E4E3] bg-[#FDFBF7] px-2.5 py-3 " +
  "text-sm sm:text-base text-[#1F140E] placeholder:text-[#C2BCB1] outline-none " +
  "transition focus:bg-white focus:border-[#703816] focus:ring-2 focus:ring-[#703816]/15";

const pickerOverlay =
  "pr-11 relative " +
  "[&::-webkit-calendar-picker-indicator]:absolute " +
  "[&::-webkit-calendar-picker-indicator]:inset-0 " +
  "[&::-webkit-calendar-picker-indicator]:h-full " +
  "[&::-webkit-calendar-picker-indicator]:w-full " +
  "[&::-webkit-calendar-picker-indicator]:cursor-pointer " +
  "[&::-webkit-calendar-picker-indicator]:opacity-0";

export const inputClass = {
  label: "block mb-2 text-base text-[#4D433F]",
  input: inputBase,
  error: "mt-1 text-xs font-medium text-red-500",
  select: `${inputBase} appearance-none pr-10 cursor-pointer`,
  textarea: `${inputBase} h-auto min-h-[96px] py-3 resize-y`,
  date: `${inputBase} ${pickerOverlay}`,
  time: `${inputBase} ${pickerOverlay}`,
  calendar: `${inputBase} ${pickerOverlay}`,
};

export const titleClass =
  "font-serif text-[28px] sm:text-[32px] font-semibold leading-[120%] tracking-[-0.64px] text-[#231814] [font-variant-numeric:lining-nums_proportional-nums]";
