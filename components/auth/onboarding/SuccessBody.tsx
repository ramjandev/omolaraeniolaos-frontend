"use client";

import { CheckCircle2 } from "lucide-react";
import { titleClass } from "./styles";

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
