import { cn } from "@/lib/utils";
import * as React from "react";

type CommonHeaderVariant = "hero" | "section" | "card";

interface CommonHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  variant?: CommonHeaderVariant;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  as?: "h1" | "h2" | "h3" | "h4";
}

const VARIANT_STYLES: Record<
  CommonHeaderVariant,
  {
    wrap: string;
    title: string;
    subtitle: string;
    defaultAs: "h1" | "h2" | "h3";
  }
> = {
  hero: {
    wrap: "flex flex-col items-center text-center",
    title:
      "font-serif text-center capitalize text-[40px] sm:text-[48px] font-semibold " +
      "leading-[110%] tracking-[-0.8px] sm:tracking-[-0.96px] text-[#231814] " +
      "[font-variant-numeric:lining-nums_proportional-nums]",
    subtitle:
      "mt-3 font-sans text-center text-base sm:text-[18px] font-normal leading-[160%] text-[#776D6A]",
    defaultAs: "h1",
  },
  section: {
    wrap: "flex flex-col items-start text-left",
    title:
      "font-serif text-left capitalize text-[32px] font-semibold " +
      "leading-[120%] tracking-[-0.64px] text-[#231814] " +
      "[font-variant-numeric:lining-nums_proportional-nums]",
    subtitle:
      "mt-1 font-sans text-left text-[16px] font-normal leading-[160%] text-[#69655E]",
    defaultAs: "h3",
  },
  card: {
    wrap: "flex flex-col items-start text-left",
    title:
      "font-sans text-left text-[20px] font-medium leading-[130%] text-[#4D433F]",
    subtitle:
      "mt-1 font-sans text-left text-[16px] font-normal leading-[160%] text-[#69655E]",
    defaultAs: "h2",
  },
};

export function CommonHeader({
  title,
  subtitle,
  variant = "hero",
  className,
  titleClassName,
  subtitleClassName,
  as,
}: CommonHeaderProps) {
  const styles = VARIANT_STYLES[variant];
  const TitleTag = as ?? styles.defaultAs;

  return (
    <div className={cn(styles.wrap, className)}>
      <TitleTag className={cn(styles.title, titleClassName)}>{title}</TitleTag>
      {subtitle ? (
        <p className={cn(styles.subtitle, subtitleClassName)}>{subtitle}</p>
      ) : null}
    </div>
  );
}
