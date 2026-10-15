"use client";

import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

/* Shared building blocks for the Individual and Agency onboarding flows. */

// TODO: replace with the account the customer should transfer to.
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

/* ───────────────────────── Styles ───────────────────────── */

export const fieldClass =
  "w-full h-12 px-3 text-[15px] rounded-xl border border-[#E8E2D8] bg-[#FAF8F4] text-[#1F140E] " +
  "placeholder:text-[#B3AAA1] outline-none transition focus:bg-white focus:border-[#703816] focus:ring-2 focus:ring-[#703816]/15";
export const labelClass = "block mb-2 text-[15px] text-[#4A3F3A]";
export const titleClass =
  "font-[family-name:var(--font-display,serif)] text-[30px] sm:text-[34px] font-medium leading-tight tracking-tight text-[#3A2C25]";
export const brownButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#7A3B18] hover:bg-[#632F13] text-white font-medium " +
  "shadow-[0_2px_0_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] transition-colors cursor-pointer " +
  "disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A3B18]";
export const darkButton =
  "inline-flex items-center justify-center rounded-xl bg-[#231713] hover:bg-black text-white font-medium " +
  "shadow-[0_3px_0_rgba(0,0,0,0.25)] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#231713]";
export const outlineButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#231713] bg-white text-[#231713] font-medium " +
  "hover:bg-[#FAF8F4] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#231713]";

// Makes the whole date/time input open the native picker while we draw our own icon.
export const pickerInput =
  `${fieldClass} pr-11 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 ` +
  "[&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full " +
  "[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0";

/* ───────────────────────── Small pieces ───────────────────────── */

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center select-none"
      aria-label="McEniesVite home"
    >
      <Image
        src="/images/logo-black.png"
        alt="McEniesVite"
        width={169}
        height={80}
        className="h-10 w-auto"
        priority
      />
    </Link>
  );
}

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

export function SuccessBody({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="grid h-[60px] w-[60px] place-items-center rounded-2xl bg-[#355E3F] text-white">
        <CheckCircle2 className="h-9 w-9" strokeWidth={1.8} />
      </span>
      <h2 className={`${titleClass} mt-6 text-[30px]`}>{title}</h2>
      <p className="mt-3 max-w-[420px] text-[16px] leading-7 text-[#6B625B]">
        {message}
      </p>
    </div>
  );
}

/* ───────────────────────── Payment modals ───────────────────────── */

export function CardPaymentModal({
  total,
  busy,
  onClose,
  onSubmit,
}: {
  total: number;
  busy: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [cardNumber, setCardNumber] = React.useState("");
  const [expiry, setExpiry] = React.useState("");
  const [cvv, setCvv] = React.useState("");

  return (
    <Modal label="Card payment" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="space-y-5"
      >
        <div>
          <label htmlFor="cardNumber" className={labelClass}>
            Enter Card Number <span aria-hidden="true">*</span>
          </label>
          <input
            id="cardNumber"
            required
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="Enter your card number"
            value={cardNumber}
            onChange={(e) =>
              setCardNumber(
                e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 19)
                  .replace(/(.{4})/g, "$1 ")
                  .trim(),
              )
            }
            pattern="[0-9 ]{15,23}"
            className={fieldClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiry" className={labelClass}>
              Expiry Date<span aria-hidden="true">*</span>
            </label>
            <input
              id="expiry"
              required
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => {
                const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                setExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
              }}
              pattern="(0[1-9]|1[0-2])/[0-9]{2}"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="cvv" className={labelClass}>
              CVV/CVC<span aria-hidden="true">*</span>
            </label>
            <input
              id="cvv"
              required
              type="password"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="***"
              value={cvv}
              onChange={(e) =>
                setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              pattern="[0-9]{3,4}"
              className={fieldClass}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className={`${brownButton} h-[52px] w-full text-[18px]`}
        >
          {busy ? "Processing..." : `Pay ${naira(total)} & Activate`}
        </button>
      </form>
    </Modal>
  );
}

export function BankTransferModal({
  total,
  onClose,
  onDone,
}: {
  total: number;
  onClose: () => void;
  onDone: () => void;
}) {
  return (
    <Modal label="Bank transfer" onClose={onClose}>
      <h2 className={`${titleClass} text-[28px]`}>Bank Transfer</h2>
      <p className="mt-2 text-[16px] text-[#6B625B]">
        Transfer {naira(total)} to the account below. Your account activates
        once we confirm payment.
      </p>
      <dl className="mt-6 space-y-3 rounded-2xl border border-[#EAE4DA] bg-[#FAF8F4] p-5 text-[16px]">
        <div className="flex justify-between">
          <dt className="text-[#6B625B]">Bank</dt>
          <dd>{BANK_DETAILS.bank}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[#6B625B]">Account number</dt>
          <dd>{BANK_DETAILS.accountNumber}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[#6B625B]">Account name</dt>
          <dd>{BANK_DETAILS.accountName}</dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={onDone}
        className={`${brownButton} mt-6 h-[52px] w-full text-[18px]`}
      >
        I&apos;ve made the transfer
      </button>
    </Modal>
  );
}
