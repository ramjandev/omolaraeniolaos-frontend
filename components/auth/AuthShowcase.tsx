"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import rsvpIcon from "@/public/images/rsvp-icon.png";
import signup from "@/public/images/signup.png";

const showcase = [
  {
    title: "RSVP Made Effortless",
    icon: rsvpIcon,
    stats: [
      { value: "186", label: "Guests responded" },
      { value: "94%", label: "RSVP rate" },
      { value: "42", label: "Responses today" },
    ],
  },
  {
    title: "Guest Lists, Organised",
    emoji: "📋",
    stats: [
      { value: "212", label: "Guests invited" },
      { value: "18", label: "Tables assigned" },
      { value: "7", label: "Dietary notes" },
    ],
  },
  {
    title: "Smooth Event-Day Check-in",
    emoji: "✅",
    stats: [
      { value: "164", label: "Guests checked in" },
      { value: "98%", label: "Scan success" },
      { value: "12s", label: "Avg. check-in time" },
    ],
  },
] as const;

export function AuthShowcase() {
  const [slide, setSlide] = React.useState(0);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const active = showcase[slide];

  React.useEffect(() => {
    const close = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative hidden min-h-screen flex-1 items-center justify-center overflow-hidden px-8 lg:flex xl:px-12">
      <Image
        src={signup}
        alt=""
        fill
        priority
        unoptimized
        sizes="50vw"
        className="object-cover"
      />

      <div
        ref={cardRef}
        className="relative z-10 inline-flex w-full max-w-[420px] flex-col items-center gap-6 rounded-[32px] border-[5px] border-[#7F6746] bg-white/10 p-5 shadow-[0_24px_60px_rgba(40,20,8,0.22)] backdrop-blur-xl"
      >
        <div className="relative w-full">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-[56px] w-full items-center gap-3 rounded-2xl bg-white px-4 text-left text-[17px] text-[#1F140E] shadow-[0_6px_18px_rgba(0,0,0,0.12)]"
          >
            {"icon" in active && active.icon ? (
              <Image
                src={active.icon}
                alt=""
                width={28}
                height={28}
                unoptimized
                className="size-7 shrink-0 object-contain"
              />
            ) : (
              <span aria-hidden="true" className="text-xl">
                {"emoji" in active ? active.emoji : null}
              </span>
            )}
            <span className="flex-1 font-medium tracking-tight">{active.title}</span>
            <ChevronDown
              className={`size-5 text-[#6B625B] transition-transform ${menuOpen ? "rotate-180" : ""}`}
              strokeWidth={1.6}
            />
          </button>

          {menuOpen && (
            <ul
              role="listbox"
              className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-[#EEE9E0] bg-white py-1 shadow-xl"
            >
              {showcase.map((f, i) => (
                <li key={f.title} role="option" aria-selected={i === slide}>
                  <button
                    type="button"
                    onClick={() => {
                      setSlide(i);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] text-[#1F140E] hover:bg-[#FAF8F4]"
                  >
                    {"icon" in f && f.icon ? (
                      <Image
                        src={f.icon}
                        alt=""
                        width={22}
                        height={22}
                        unoptimized
                        className="size-[22px] object-contain"
                      />
                    ) : (
                      <span aria-hidden="true">
                        {"emoji" in f ? f.emoji : null}
                      </span>
                    )}
                    {f.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <dl className="flex w-full flex-col self-stretch">
          {active.stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex items-center gap-2 self-stretch p-3 text-white ${
                i === 0 ? "rounded-t-[12px]" : ""
              } ${
                i < active.stats.length - 1
                  ? "border-b-[0.5px] border-[#775E45]"
                  : ""
              }`}
            >
              <dd className="text-[21px] font-semibold tracking-tight">{s.value}</dd>
              <dt className="text-[16px] text-white/90">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
