"use client";

import CommonButton from "@/components/common/CommonButton";
import * as React from "react";
import { Modal } from "./Modal";
import { inputClass, naira } from "./styles";

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
          <label htmlFor="cardNumber" className={inputClass.label}>
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
            className={inputClass.input}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiry" className={inputClass.label}>
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
              className={inputClass.input}
            />
          </div>
          <div>
            <label htmlFor="cvv" className={inputClass.label}>
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
              className={inputClass.input}
            />
          </div>
        </div>

        <CommonButton
          type="submit"
          disabled={busy}
          className="w-full!"
          size="lg"
        >
          {busy ? "Processing..." : `Pay ${naira(total)} & Activate`}
        </CommonButton>
      </form>
    </Modal>
  );
}
