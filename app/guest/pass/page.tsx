'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Share2,
  Calendar,
  Download,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';

export default function GuestPassPage() {
  const router = useRouter();
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);
  const [calSuccess, setCalSuccess] = React.useState(false);

  const handleSavePass = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleAddToCalendar = () => {
    setCalSuccess(true);
    setTimeout(() => setCalSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#1F1916]/10 flex justify-center items-start sm:py-6">
      {/* Mobile-Only Frame container strictly 430px */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[900px] bg-[#12100E] text-white flex flex-col relative overflow-hidden sm:rounded-[40px] sm:shadow-2xl sm:border sm:border-[#382F2A]">
        
        {/* Subtle royal background glow and pattern */}
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#7A3B18]/40 via-[#B04A26]/10 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-[#E5A84D]/10 blur-3xl pointer-events-none" />
        
        {/* Top Navigation Bar */}
        <div className="relative z-10 px-5 pt-4 pb-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/guest')}
            aria-label="Back to Concierge Chat"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-white backdrop-blur-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#D8B485] font-semibold block">
              Digital Access Pass
            </span>
            <span className="text-xs font-serif text-[#F0EDE6]/80">
              The Grand Royal Gala
            </span>
          </div>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'McEniesVite VIP Digital Pass',
                  text: 'Chief Adeleke Adebayo - Table 01 Royal & Presidential Suite',
                  url: window.location.href,
                }).catch(() => {});
              }
            }}
            aria-label="Share Credential"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-white backdrop-blur-md"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-5 relative z-10 scrollbar-none pb-24">
          
          {/* Main VIP Pass Card - Frame 68 & 69 replica */}
          <div className="bg-[#1C1714] rounded-[32px] border border-[#3E322A] overflow-hidden shadow-2xl relative">
            
            {/* Top Pass Header Banner */}
            <div className="bg-gradient-to-r from-[#7A3B18] via-[#8B4219] to-[#602D13] p-6 text-white relative">
              {/* Gold watermark badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center font-serif font-bold text-sm text-[#FDE68A]">
                    M
                  </div>
                  <span className="font-serif tracking-wide text-sm font-medium text-white/95">
                    McEniesVite Verified VIP
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>RSVP Confirmed</span>
                </div>
              </div>

              <div className="space-y-1">
                <h1 className="font-serif text-2xl font-bold tracking-tight text-[#FFF8ED] leading-tight">
                  Chief Adeleke Adebayo
                </h1>
                <p className="text-xs text-[#E8D4C0] font-light flex items-center gap-2">
                  <span>VIP Dignitary & Special Guest</span>
                  <span className="w-1 h-1 rounded-full bg-[#E5A84D]" />
                  <span>Party of 2</span>
                </p>
              </div>
            </div>

            {/* Middle Section: Big QR Code matching Frame 68.png */}
            <div className="p-6 flex flex-col items-center bg-[#251F1B] border-b border-[#3A2F28]">
              <div className="relative p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                {/* Embedded QR code */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/guest/Frame 68.png"
                  alt="Chief Adeleke Adebayo VIP QR Code"
                  className="w-48 h-48 object-contain rounded-lg"
                  onError={(e) => {
                    // Fallback visual if direct frame image renders as pass card
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                
                {/* Fallback SVG QR render for crisp visual presentation */}
                <div className="absolute inset-4 pointer-events-none flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-[#7A3B18] border-2 border-white flex items-center justify-center text-white font-serif font-bold text-xs shadow-md">
                    M
                  </div>
                </div>
              </div>

              {/* Security Token / Serial Number */}
              <div className="mt-4 text-center space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#B3A090]">
                  Credential Security Token
                </span>
                <p className="font-mono text-sm tracking-wider font-semibold text-[#E5A84D] select-all">
                  MCV-2026-NGA-98421
                </p>
              </div>
            </div>

            {/* Event Specific Badge Table & Gate */}
            <div className="p-5 grid grid-cols-2 gap-3 bg-[#1C1714]">
              <div className="p-3.5 rounded-2xl bg-[#28211C] border border-[#3A2F28]">
                <div className="flex items-center gap-1.5 text-xs text-[#A8988B] mb-1">
                  <Layers className="w-3.5 h-3.5 text-[#E5A84D]" />
                  <span>Table Assigned</span>
                </div>
                <div className="font-semibold text-sm text-white leading-tight">
                  Table 01
                </div>
                <span className="text-[11px] text-[#C99C6A] block mt-0.5">
                  Royal & Presidential Suite
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#28211C] border border-[#3A2F28]">
                <div className="flex items-center gap-1.5 text-xs text-[#A8988B] mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#E5A84D]" />
                  <span>Designated Gate</span>
                </div>
                <div className="font-semibold text-sm text-white leading-tight">
                  Gate 2 VIP Entrance
                </div>
                <span className="text-[11px] text-[#A8988B] block mt-0.5">
                  Monarch Event Centre
                </span>
              </div>
            </div>

            {/* Cutout punch holes design for realistic ticket pass */}
            <div className="relative py-2 px-4 flex items-center justify-between">
              <div className="w-4 h-4 rounded-full bg-[#12100E] -ml-6 border-r border-[#3E322A]" />
              <div className="flex-1 border-t border-dashed border-[#4A3B31] mx-2" />
              <div className="w-4 h-4 rounded-full bg-[#12100E] -mr-6 border-l border-[#3E322A]" />
            </div>

            {/* Bottom Pass Metadata & Security Notice */}
            <div className="p-5 pt-3 bg-[#1C1714] space-y-3">
              <div className="flex items-center justify-between text-xs text-[#8F7F72]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#E5A84D]" />
                  <span>Sat, 24 Oct 2026 · 14:00 Prompt</span>
                </div>
                <span className="text-white/80 font-medium">Lagos, NG</span>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#C5B8AC]">
                <Info className="w-4 h-4 text-[#E5A84D] shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  Present this QR pass to the Gate Staff upon arrival. One-time encrypted scan validation active. Valid identification may be requested.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions (Save Pass & Add to Calendar) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleSavePass}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#7A3B18] to-[#99451C] hover:opacity-95 active:scale-95 transition-all text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#7A3B18]/30 border border-[#A65427]"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Pass Saved!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Save Pass</span>
                </>
              )}
            </button>

            <button
              onClick={handleAddToCalendar}
              className="w-full py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-white font-medium text-sm flex items-center justify-center gap-2 border border-white/15"
            >
              {calSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 text-[#E5A84D]" />
                  <span>Add to Calendar</span>
                </>
              )}
            </button>
          </div>

          {/* Return to Concierge Chat Link */}
          <div className="pt-2">
            <Link
              href="/guest"
              className="w-full py-3 px-4 rounded-2xl bg-[#251F1B] border border-[#3E322A] text-xs text-[#D8B485] font-medium flex items-center justify-between hover:bg-[#2F2621] transition-all"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E5A84D]" />
                <span>Return to VIP Concierge Chat</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8A7E75]" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
