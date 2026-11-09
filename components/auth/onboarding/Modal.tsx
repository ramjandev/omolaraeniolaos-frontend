"use client";

import * as React from "react";

export function Modal({
  children,
  onClose,
  label,
}: {
  children: React.ReactNode;
  onClose?: () => void;
  label: string;
}) {
  React.useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A2622]/40 p-4 backdrop-blur-md"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="w-full max-w-[524px] rounded-[28px] bg-white p-6 sm:p-8 shadow-2xl"
      >
        {children}
      </div>
    </div>
  );
}
