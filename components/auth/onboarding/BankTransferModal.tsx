"use client";

import CommonButton from "@/components/common/CommonButton";
import { Modal } from "./Modal";
import { BANK_DETAILS, naira, titleClass } from "./styles";

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
      <CommonButton type="button" size="lg" fullWidth className="mt-6" onClick={onDone}>
        I&apos;ve made the transfer
      </CommonButton>
    </Modal>
  );
}
