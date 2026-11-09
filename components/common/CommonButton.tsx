import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ButtonWithLoading from "./ButtonWithLoading";

const BASE_STYLE =
  "inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-200 " +
  "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A3B18]";

const SHAPE_STYLE = {
  pill: "rounded-full",
  rounded: "rounded-[12px]",
} as const;

const SIZE_STYLE = {
  xs: "h-8 px-3 text-xs [&_svg]:size-3",
  sm: "h-10 px-4 text-sm [&_svg]:size-4",
  md: "h-11 px-5 text-base [&_svg]:size-5",
  lg: "h-[52px] px-7 text-lg [&_svg]:size-5",
  xl: "h-14 px-8 text-xl [&_svg]:size-6",
} as const;

const VARIANT_STYLE = {
  primary:
    "bg-[#7A3B18] text-white shadow-[0_2px_0_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.12)] " +
    "hover:bg-[#632F13]",
  black:
    "bg-[#231814] text-white shadow-[0_3px_0_rgba(0,0,0,0.25)] hover:bg-black",
  outline:
    "border border-[#231713] bg-white text-[#231713] hover:bg-[#FAF8F4]",
  ghost:
    "bg-transparent text-[#3A2C25] hover:text-[#7A3B18] shadow-none px-0 h-auto",
} as const;

export type CommonButtonVariant = keyof typeof VARIANT_STYLE;
export type CommonButtonSize = keyof typeof SIZE_STYLE;
export type CommonButtonShape = keyof typeof SHAPE_STYLE;

export interface CommonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  size?: CommonButtonSize;
  variant?: CommonButtonVariant;
  shape?: CommonButtonShape;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showDefaultIcon?: boolean;
  showLeftIcon?: boolean;
  to?: string;
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

export default function CommonButton({
  children,
  className,
  size = "md",
  variant = "primary",
  shape = "rounded",
  leftIcon,
  rightIcon,
  showDefaultIcon = false,
  showLeftIcon = false,
  type = "button",
  to,
  disabled,
  isLoading = false,
  loadingText = "Loading...",
  fullWidth = false,
  ...props
}: CommonButtonProps) {
  const isDisabled = disabled || isLoading;
  const isGhost = variant === "ghost";

  const classes = cn(
    BASE_STYLE,
    !isGhost && SHAPE_STYLE[shape],
    !isGhost && SIZE_STYLE[size],
    isGhost && "text-base sm:text-[17px]",
    VARIANT_STYLE[variant],
    fullWidth && "w-full",
    className,
  );

  const content = isLoading ? (
    <ButtonWithLoading
      title={loadingText}
      textColor={variant === "outline" || variant === "ghost" ? "text-inherit" : undefined}
      borderColor={
        variant === "outline" || variant === "ghost"
          ? "border-current"
          : undefined
      }
    />
  ) : (
    <>
      {leftIcon ??
        (showLeftIcon ? (
          <ArrowLeft className="transition-transform group-hover:-translate-x-0.5" />
        ) : null)}
      {children}
      {rightIcon ??
        (showDefaultIcon ? (
          <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
        ) : null)}
    </>
  );

  if (to) {
    return (
      <Link
        href={to}
        className={cn(classes, isDisabled && "pointer-events-none opacity-50")}
        aria-disabled={isDisabled || undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button disabled={isDisabled} type={type} className={classes} {...props}>
      {content}
    </button>
  );
}
