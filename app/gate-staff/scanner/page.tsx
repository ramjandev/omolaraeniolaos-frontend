'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import jsQR from 'jsqr';
import { GateMobileShell } from '@/components/gate-staff/GateMobileShell';
import { verifyGatePass } from '@/lib/api/platform';
import { isOnline, queueScan } from '@/lib/offline/checkin-queue';

type ScanState = 'scanning' | 'detected' | 'invalid' | 'not_found' | 'already_checked_in';

type BarcodeDetectorInstance = {
  detect: (source: CanvasImageSource | ImageBitmap) => Promise<Array<{ rawValue?: string }>>;
};

async function readCodeFromImage(
  detector: BarcodeDetectorInstance | null,
  data: Uint8ClampedArray,
  width: number,
  height: number,
  source: CanvasImageSource,
) {
  const decoded = jsQR(data, width, height, { inversionAttempts: 'dontInvert' });
  if (decoded?.data) return decoded.data;
  if (!detector) return '';
  const codes = await detector.detect(source);
  return codes[0]?.rawValue || '';
}

export default function GateStaffScannerPage() {
  const router = useRouter();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const busyRef = React.useRef(false);
  const gateRef = React.useRef('Gate 1');
  const staffIdRef = React.useRef('');
  const eventIdRef = React.useRef('');
  const [scanState, setScanState] = React.useState<ScanState>('scanning');
  const [cameraError, setCameraError] = React.useState('');
  const [qrCode, setQrCode] = React.useState('');

  const stopCamera = React.useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const runVerify = React.useCallback(async (code: string) => {
    const value = code.trim();
    if (!value || busyRef.current) return;
    busyRef.current = true;
    stopCamera();

    if (!isOnline()) {
      await queueScan({
        clientScanId: crypto.randomUUID(),
        qrCode: value,
        scannedAt: new Date().toISOString(),
        gateTurnstile: gateRef.current,
      });
      setScanState('detected');
      return;
    }

    const result = await verifyGatePass({
      qrCode: value,
      gateTurnstile: gateRef.current,
      staffId: staffIdRef.current || undefined,
    });
    if (result.status === 409) {
      busyRef.current = false;
      setScanState('already_checked_in');
      return;
    }
    if (result.status === 404 || !result.ok) {
      busyRef.current = false;
      setScanState('not_found');
      return;
    }
    const attendee = result.body?.attendee as {
      fullName?: string;
      guestType?: string;
      partySize?: number;
      rsvpStatus?: string;
      ticketTier?: string;
      gateTurnstile?: string;
      checkedInAt?: string;
    } | undefined;
    sessionStorage.setItem('gate-last-guest', JSON.stringify({
      name: attendee?.fullName || 'Guest',
      guestType: attendee?.guestType || attendee?.ticketTier || 'General',
      partySize: attendee?.partySize || 1,
      rsvpStatus: attendee?.rsvpStatus || 'Confirmed',
      gate: attendee?.gateTurnstile || gateRef.current,
      checkedInAt: attendee?.checkedInAt || new Date().toISOString(),
    }));
    router.push(`/gate-staff/verify?status=valid&eventId=${eventIdRef.current}`);
  }, [router, stopCamera]);

  const decodeFrame = React.useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return '';
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return '';
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return '';
    context.drawImage(video, 0, 0, width, height);
    const image = context.getImageData(0, 0, width, height);
    const Detector = (window as Window & {
      BarcodeDetector?: new (options?: { formats?: string[] }) => BarcodeDetectorInstance;
    }).BarcodeDetector;
    const detector = Detector ? new Detector({ formats: ['qr_code'] }) : null;
    return readCodeFromImage(detector, image.data, width, height, canvas);
  }, []);

  const startCamera = React.useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('This phone browser cannot open the QR scanner.');
      return;
    }
    setCameraError('');
    setScanState('scanning');
    busyRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
    } catch {
      setCameraError('Allow the scanner to use the rear camera, then tap Start scanner.');
    }
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    gateRef.current = params.get('gate') || 'Gate 1';
    staffIdRef.current = params.get('staffId') || '';
    eventIdRef.current = params.get('eventId') || '';
    void startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  React.useEffect(() => {
    if (scanState !== 'scanning') return;
    let timer = 0;
    let active = true;
    const tick = async () => {
      if (!active || busyRef.current) return;
      const code = await decodeFrame();
      if (code) {
        await runVerify(code);
        return;
      }
      timer = window.setTimeout(() => void tick(), 250);
    };
    timer = window.setTimeout(() => void tick(), 400);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [decodeFrame, runVerify, scanState]);

  return (
    <GateMobileShell showHeader={false} activeTab="checkin">
      <div className="space-y-4 pt-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              router.back();
            }}
            aria-label="Back"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#1F1916] hover:bg-[#EFEAE2] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.8]" />
          </button>
          <h1 className="font-serif text-2xl font-medium tracking-tight text-[#1F1916]">
            QR Scanner
          </h1>
        </div>

        <p className="text-xs text-[#70665F]">
          Hold the guest&apos;s digital pass inside the scanner. It reads the QR code from the rear camera.
        </p>

        <div className="w-full bg-[#1A120E] rounded-3xl overflow-hidden relative shadow-lg min-h-[340px]">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-[340px] object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="pointer-events-none absolute inset-8 border-2 border-white/70 rounded-2xl" />
          <p className="absolute inset-x-0 bottom-4 text-white/80 text-xs text-center">
            Scanning for a QR code
          </p>
        </div>

        <button
          type="button"
          onClick={() => void startCamera()}
          className="w-full py-3.5 px-4 bg-[#7A3B18] text-white rounded-2xl text-sm font-medium"
        >
          Start scanner
        </button>
        {cameraError && <p className="text-xs text-[#8C4B24]">{cameraError}</p>}

        <input
          value={qrCode}
          onChange={(event) => setQrCode(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void runVerify(qrCode);
          }}
          placeholder="Or type the pass code"
          className="w-full rounded-2xl border border-[#EAE5DC] bg-white px-4 py-3 text-sm text-[#1F1916]"
        />

        <button
          type="button"
          onClick={() => router.push(`/gate-staff/search?eventId=${eventIdRef.current}`)}
          className="relative bg-white border border-[#EAE5DC] rounded-2xl px-4 py-3.5 flex items-center justify-between"
        >
          <span className="text-sm text-[#80756C]">Search Guest Instead</span>
          <Search className="w-5 h-5 text-[#80756C] stroke-[1.8]" />
        </button>

        {scanState === 'not_found' && (
          <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#ECE7DE] space-y-2">
            <p className="text-sm font-semibold text-[#1F1916]">Guest Not Found</p>
            <p className="text-xs text-[#70665F]">No guest matches this invitation code.</p>
            <button type="button" onClick={() => void startCamera()} className="text-xs font-medium text-[#7A3B18]">
              Scan again
            </button>
          </div>
        )}
        {scanState === 'invalid' && (
          <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#ECE7DE] space-y-2">
            <p className="text-sm font-semibold text-[#1F1916]">Invalid QR Code</p>
            <p className="text-xs text-[#70665F]">This photo does not contain a readable invitation code.</p>
            <button type="button" onClick={() => void startCamera()} className="text-xs font-medium text-[#7A3B18]">
              Scan again
            </button>
          </div>
        )}
        {scanState === 'already_checked_in' && (
          <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#ECE7DE] space-y-2">
            <p className="text-sm font-semibold text-[#1F1916]">Already Checked In</p>
            <p className="text-xs text-[#70665F]">This invitation has already been used.</p>
            <button type="button" onClick={() => void startCamera()} className="text-xs font-medium text-[#7A3B18]">
              Scan again
            </button>
          </div>
        )}
        {scanState === 'detected' && (
          <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#ECE7DE] space-y-2">
            <p className="text-sm font-semibold text-[#1F1916]">Saved on this phone</p>
            <p className="text-xs text-[#70665F]">No network. The check-in will sync when the connection returns.</p>
            <Link href="/gate-staff/checkin" className="text-xs font-medium text-[#7A3B18]">
              Back to check-in
            </Link>
          </div>
        )}
      </div>
    </GateMobileShell>
  );
}
