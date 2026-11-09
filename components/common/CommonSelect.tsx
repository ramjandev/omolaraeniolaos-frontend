"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inputClass } from "@/components/auth/onboarding";
import { cn } from "@/lib/utils";

export interface SelectOption<T extends string = string> {
  label: React.ReactNode;
  value: T;
  textValue?: string;
}

interface SelectProps<T extends string> {
  value: T | undefined;
  item: readonly SelectOption<T>[];
  w?: number | string;
  onValueChange: (val: T) => void;
  className?: string;
  arrow?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
}

const CommonSelect = <T extends string>({
  value,
  item,
  w = "100%",
  onValueChange,
  disabled = false,
  className,
  placeholder,
  id,
  "aria-label": ariaLabel,
}: SelectProps<T>) => {
  const selected = item.find((option) => option.value === value);

  return (
    <Select
      value={value || undefined}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        style={{
          minWidth: typeof w === "number" ? w : undefined,
          width: typeof w === "string" ? w : undefined,
        }}
        className={cn(
          inputClass.select,
          "justify-between shadow-none data-[size=default]:h-11 sm:data-[size=default]:h-12",
          !value && "text-[#C2BCB1]",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        {selected ? (
          <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-left text-[#1F140E]">
            {selected.label}
          </span>
        ) : (
          <SelectValue placeholder={placeholder || "Select Option"} />
        )}
      </SelectTrigger>

      <SelectContent className="rounded-[12px] border border-[#E8E4E3] bg-white shadow-md">
        {item.map((option, index) => (
          <SelectItem
            key={`${option.value}-${index}`}
            value={option.value}
            textValue={
              option.textValue ??
              (typeof option.label === "string" ? option.label : option.value)
            }
            className="cursor-pointer rounded-lg px-3 py-2.5 text-sm text-[#1F140E] focus:bg-[#F3E6D8] focus:text-[#1F140E]"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CommonSelect;
