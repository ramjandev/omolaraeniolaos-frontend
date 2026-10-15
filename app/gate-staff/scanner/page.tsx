'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import { GateMobileShell } from '@/components/gate-staff/GateMobileShell';
import { getSampleGatePass, verifyGatePass } from '@/lib/api/platform';
import { isOnline, queueScan } from '@/lib/offline/checkin-queue';

type ScanState = 'scanning' | 'detected' | 'invalid' | 'not_found' | 'already_checked_in';

export default function GateStaffScannerPage() {
  const router = useRouter();
  const [scanState, setScanState] = React.useState<ScanState>('scanning');
  const [qrCode, setQrCode] = React.useState('');
  const [offlineQueued, setOfflineQueued] = React.useState(false);

  const runVerify = React.useCallback(async (code: string) => {
    const value = code.trim();
    if (!value) return;
    setOfflineQueued(false);

    if (!isOnline()) {
      await queueScan({
        clientScanId: crypto.randomUUID(),
        qrCode: value,
        scannedAt: new Date().toISOString(),
        gateTurnstile: 'Gate A-1',
      });
      setOfflineQueued(true);
      setScanState('detected');
      return;
    }

    const result = await verifyGatePass({ qrCode: value, gateTurnstile: 'Gate A-1' });
    if (result.status === 409) {
      setScanState('already_checked_in');
      return;
    }
    if (result.status === 404 || !result.ok) {
      setScanState('not_found');
      return;
    }
    setScanState('detected');
    router.push('/gate-staff/verify?status=valid');
  }, [router]);

  React.useEffect(() => {
    void getSampleGatePass().then((sample) => {
      if (sample.available && sample.attendee?.qrCode) {
        setQrCode(sample.attendee.qrCode);
      }
    });
  }, []);

  // Interactive scanner simulation controls for gate testing
  return (
    <GateMobileShell showHeader={false} activeTab="checkin">
      <div className="space-y-4 pt-1">
        
        {/* Top Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#1F1916] hover:bg-[#EFEAE2] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.8]" />
          </button>
          <h1 className="font-serif text-2xl font-medium tracking-tight text-[#1F1916]">
            Scan Guest Invitation
          </h1>
        </div>

        <p className="text-xs text-[#70665F]">
          Scan the guest&apos;s QR code to verify their invitation and check-in status.
          Offline scans are queued on this device and sync when the network returns.
        </p>
        <input
          value={qrCode}
          onChange={(e) => setQrCode(e.target.value)}
          placeholder="Pass QR code"
          className="w-full rounded-2xl border border-[#EAE5DC] bg-white px-4 py-3 text-sm text-[#1F1916]"
        />

        {/* Viewfinder Frame matching mockup 05 */}
        <div className="w-full bg-[#1A120E] rounded-3xl p-6 sm:p-7 flex flex-col items-center justify-center relative shadow-lg overflow-hidden min-h-[340px]">
          {/* Subtle camera scan effect line */}
          <div className="absolute inset-x-8 top-12 h-0.5 bg-[#C68D5D]/40 shadow-[0_0_12px_#C68D5D] animate-pulse" />

          {/* QR Code Graphic Box */}
          <div className="w-60 h-60 bg-white rounded-2xl p-4 shadow-md flex items-center justify-center relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/gate/qr-code.png"
              alt="QR Code To Scan"
              className="w-full h-full object-contain cursor-pointer"
              onClick={() => {
                void runVerify(qrCode);
              }}
            />
          </div>

          <p className="text-white/80 text-xs text-center mt-5 font-normal tracking-wide">
            Position the guest&apos;s QR code inside the frame.
          </p>
        </div>

        {/* Search Guest Instead Input */}
        <div 
          onClick={() => router.push('/gate-staff/search')}
          className="relative bg-white border border-[#EAE5DC] rounded-2xl px-4 py-3.5 flex items-center justify-between cursor-pointer hover:border-[#D5CFC7] transition-colors"
        >
          <span className="text-sm text-[#80756C]">Search Guest Instead</span>
          <Search className="w-5 h-5 text-[#80756C] stroke-[1.8]" />
        </div>

        {/* SCANNER STATES Companion Box */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#80756C]">
              Scanner States
            </span>
            <span className="text-[10px] text-[#A3968C]">Interactive Demo</span>
          </div>

          {/* State 1: Scanning */}
          {scanState === 'scanning' && (
            <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#ECE7DE] shadow-xs space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full border-2 border-[#1F1916] border-t-transparent animate-spin" />
                <span className="text-sm font-semibold text-[#1F1916]">
                  Scanning
                </span>
              </div>
              <p className="text-xs text-[#70665F]">
                Hold steady while we read the code.
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => void runVerify(qrCode)}
                  className="font-medium text-[#7A3B18] hover:underline"
                >
                  Simulate QR Detected
                </button>
                <span className="text-[#C5BEB5]">·</span>
                <Link
                  href="/gate-staff/search"
                  className="font-medium text-[#7A3B18] hover:underline"
                >
                  Search Guest
                </Link>
              </div>
            </div>
          )}

          {/* State 2: QR Code Detected */}
          {scanState === 'detected' && (
            <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#ECE7DE] shadow-xs space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#1F1916] inline-block" />
                <span className="text-sm font-semibold text-[#1F1916]">
                  QR Code Detected
                </span>
              </div>
              <p className="text-xs text-[#70665F]">
                {offlineQueued
                  ? 'No network. Check-in saved on this device and will sync automatically.'
                  : 'Invitation found. Opening Guest Verification...'}
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => router.push('/gate-staff/verify?status=valid')}
                  className="text-xs font-semibold text-[#7A3B18] hover:underline"
                >
                  Continue to Guest Verification
                </button>
              </div>
            </div>
          )}

          {/* State 3: Invalid QR Code */}
          {scanState === 'invalid' && (
            <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#ECE7DE] shadow-xs space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#756B63] inline-block" />
                <span className="text-sm font-semibold text-[#1F1916]">
                  Invalid QR Code
                </span>
              </div>
              <p className="text-xs text-[#70665F]">
                This code is not a valid McEniesVite invitation.
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setScanState('scanning')}
                  className="font-medium text-[#7A3B18] hover:underline"
                >
                  Retry Scan
                </button>
                <span className="text-[#C5BEB5]">·</span>
                <Link
                  href="/gate-staff/search"
                  className="font-medium text-[#7A3B18] hover:underline"
                >
                  Search Guest
                </Link>
              </div>
            </div>
          )}

          {/* State 4: Guest Not Found */}
          {scanState === 'not_found' && (
            <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#ECE7DE] shadow-xs space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#756B63] inline-block" />
                <span className="text-sm font-semibold text-[#1F1916]">
                  Guest Not Found
                </span>
              </div>
              <p className="text-xs text-[#70665F]">
                No guest matches this invitation code.
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setScanState('scanning')}
                  className="font-medium text-[#7A3B18] hover:underline"
                >
                  Retry Scan
                </button>
                <span className="text-[#C5BEB5]">·</span>
                <Link
                  href="/gate-staff/search"
                  className="font-medium text-[#7A3B18] hover:underline"
                >
                  Search Guest
                </Link>
              </div>
            </div>
          )}

          {/* State 5: Already Checked In */}
          {scanState === 'already_checked_in' && (
            <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#ECE7DE] shadow-xs space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#756B63] inline-block" />
                <span className="text-sm font-semibold text-[#1F1916]">
                  Already Checked In
                </span>
              </div>
              <p className="text-xs text-[#70665F]">
                This invitation was used at 10:35 AM.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setScanState('scanning')}
                  className="text-xs font-semibold text-[#7A3B18] hover:underline"
                >
                  Back to Scan
                </button>
              </div>
            </div>
          )}

          {/* Quick simulation buttons to preview all companion states */}
          <div className="pt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setScanState('scanning')}
              className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors ${
                scanState === 'scanning' ? 'bg-[#7A3B18] text-white border-[#7A3B18]' : 'bg-white text-[#5C534D] border-[#E2DDD5]'
              }`}
            >
              Scanning
            </button>
            <button
              type="button"
              onClick={() => setScanState('detected')}
              className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors ${
                scanState === 'detected' ? 'bg-[#7A3B18] text-white border-[#7A3B18]' : 'bg-white text-[#5C534D] border-[#E2DDD5]'
              }`}
            >
              Detected
            </button>
            <button
              type="button"
              onClick={() => setScanState('invalid')}
              className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors ${
                scanState === 'invalid' ? 'bg-[#7A3B18] text-white border-[#7A3B18]' : 'bg-white text-[#5C534D] border-[#E2DDD5]'
              }`}
            >
              Invalid
            </button>
            <button
              type="button"
              onClick={() => setScanState('not_found')}
              className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors ${
                scanState === 'not_found' ? 'bg-[#7A3B18] text-white border-[#7A3B18]' : 'bg-white text-[#5C534D] border-[#E2DDD5]'
              }`}
            >
              Not Found
            </button>
            <button
              type="button"
              onClick={() => setScanState('already_checked_in')}
              className={`px-2.5 py-1 text-[11px] rounded-lg border transition-colors ${
                scanState === 'already_checked_in' ? 'bg-[#7A3B18] text-white border-[#7A3B18]' : 'bg-white text-[#5C534D] border-[#E2DDD5]'
              }`}
            >
              Duplicate
            </button>
          </div>
        </div>

      </div>
    </GateMobileShell>
  );
}
