"use client";

export function Radio({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`grid h-[26px] w-[26px] place-items-center rounded-full border-2 ${
        checked
          ? "border-[#D9B9A3] bg-[#D9B9A3]"
          : "border-[#8C7A6B] bg-transparent"
      }`}
    >
      {checked && <span className="h-2.5 w-2.5 rounded-full bg-[#7A3B18]" />}
    </span>
  );
}
