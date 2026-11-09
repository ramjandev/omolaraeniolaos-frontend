"use client";

import Image from "next/image";
import Link from "next/link";

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
