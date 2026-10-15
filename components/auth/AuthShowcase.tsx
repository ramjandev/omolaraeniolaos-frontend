"use client";

import { ChevronDown } from "lucide-react";
import * as React from "react";

const showcase = [
  {
    emoji: "💌",
    title: "RSVP Made Effortless",
    stats: [
      { value: "186", label: "Guests responded" },
      { value: "94%", label: "RSVP rate" },
      { value: "42", label: "Responses today" },
    ],
  },
  {
    emoji: "📋",
    title: "Guest Lists, Organised",
    stats: [
      { value: "212", label: "Guests invited" },
      { value: "18", label: "Tables assigned" },
      { value: "7", label: "Dietary notes" },
    ],
  },
  {
    emoji: "✅",
    title: "Smooth Event-Day Check-in",
    stats: [
      { value: "164", label: "Guests checked in" },
      { value: "98%", label: "Scan success" },
      { value: "12s", label: "Avg. check-in time" },
    ],
  },
];

/** Right-hand artwork panel + glass card, shared by Sign In and Sign Up. */
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
    <div className="hidden lg:flex flex-1 relative min-h-screen items-center justify-center px-12">
      {/* Torn left edge (applies to background layers only) */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id="rough-edge" x="-5%" y="0" width="110%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.9"
            numOctaves="3"
            seed="4"
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="22"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <div
        className="absolute inset-y-0 -left-3 right-0 z-0 overflow-hidden bg-[#362114]"
        style={{ filter: "url(#rough-edge)" }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 0 22%, rgba(32,74,66,.85) 22% 28%, transparent 28% 52%, rgba(32,74,66,.75) 52% 58%, transparent 58% 84%, rgba(32,74,66,.8) 84% 90%, transparent 90%),
              linear-gradient(180deg, rgba(120,60,24,.5) 0 18%, transparent 18% 40%, rgba(236,225,200,.7) 40% 62%, rgba(150,95,40,.55) 62% 100%),
              linear-gradient(135deg, #c18a3f, #8a4a1d 60%, #4d3a22)
            `,
          }}
        />
      </div>

      {/* Glass card */}
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-[464px] rounded-[36px] border border-white/25 p-[1px]
                   bg-gradient-to-br from-white/20 via-white/5 to-black/10 backdrop-blur-xl
                   shadow-[0_20px_60px_rgba(60,30,10,0.25)]"
      >
        <div className="rounded-[35px] bg-[#6B4A2B]/25 p-5 pb-3 backdrop-blur-md">
          <div className="relative rounded-3xl border border-white/40 p-[7px]">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="w-full h-[58px] px-4 flex items-center gap-3 rounded-2xl bg-white text-left text-lg text-[#1F140E] shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
            >
              <span aria-hidden="true" className="text-xl">
                {active.emoji}
              </span>
              <span className="flex-1">{active.title}</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                strokeWidth={1.6}
              />
            </button>

            {menuOpen && (
              <ul
                role="listbox"
                className="absolute left-[7px] right-[7px] top-[calc(100%+6px)] z-20 overflow-hidden rounded-2xl bg-white py-1 shadow-xl"
              >
                {showcase.map((f, i) => (
                  <li key={f.title} role="option" aria-selected={i === slide}>
                    <button
                      type="button"
                      onClick={() => {
                        setSlide(i);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-base hover:bg-[#FAF8F4]"
                    >
                      <span aria-hidden="true">{f.emoji}</span>
                      {f.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <dl className="mt-5">
            {active.stats.map((s) => (
              <div
                key={s.label}
                className="flex items-baseline gap-2 px-3 py-[17px] text-white border-b border-white/20 last:border-b-0"
              >
                <dd className="text-[21px] font-semibold tracking-tight">
                  {s.value}
                </dd>
                <dt className="text-[17px] text-white/90">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
