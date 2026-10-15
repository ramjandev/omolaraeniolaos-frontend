'use client';

import * as React from 'react';
import {
  Scan,
  CheckCircle,
  AlertTriangle,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MOCK_ATTENDEES } from '@/lib/mock-data/events';
import { Attendee } from '@/types/events';

export function LiveScannerCompanion() {
  const [qrInput, setQrInput] = React.useState('QR-FTS26-VIP-001');
  const [scannedResult, setScannedResult] = React.useState<Attendee | null>(MOCK_ATTENDEES[0]);
  const [scanStatus, setScanStatus] = React.useState<'valid' | 'already_checked' | 'invalid'>('valid');
  const [totalScannedToday, setTotalScannedToday] = React.useState(412);

  const handleSimulateScan = (codeToScan?: string) => {
    const code = codeToScan || qrInput;
    const match = MOCK_ATTENDEES.find(
      (a) => a.qrCode.toLowerCase() === code.trim().toLowerCase()
    );

    if (match) {
      setScannedResult(match);
      if (match.status === 'checked_in') {
        setScanStatus('already_checked');
      } else {
        setScanStatus('valid');
        setTotalScannedToday((prev) => prev + 1);
      }
    } else {
      setScannedResult(null);
      setScanStatus('invalid');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
      {/* Viewfinder Column */}
      <div className="lg:col-span-7 space-y-4">
        <div className="relative rounded-2xl overflow-hidden border border-border bg-zinc-950 p-6 flex flex-col items-center justify-center min-h-[380px] shadow-lg">
          {/* Viewfinder animation reticle */}
          <div className="relative w-64 h-64 border-2 border-emerald-500/80 rounded-2xl flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
            <div className="w-full h-1 bg-emerald-400 absolute top-0 animate-bounce shadow-md shadow-emerald-500/50" />
            <QrCode className="w-24 h-24 text-zinc-600 animate-pulse" />
          </div>

          <div className="mt-4 text-center space-y-1">
            <p className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Camera Sensor Online & Calibrated
            </p>
            <p className="text-[11px] text-zinc-400">
              Align attendee digital badge or printed QR ticket inside the square.
            </p>
          </div>
        </div>

        {/* Manual Barcode / QR input backup */}
        <div className="flex gap-2 p-3 bg-muted/40 rounded-xl border border-border">
          <Input
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            placeholder="Type or paste QR code reference..."
            className="text-xs bg-background"
          />
          <Button size="sm" onClick={() => handleSimulateScan()} className="text-xs gap-1.5 shrink-0">
            <Scan className="w-3.5 h-3.5" />
            <span>Validate</span>
          </Button>
        </div>

        {/* Quick Test Codes */}
        <div className="space-y-1">
          <span className="text-[11px] text-muted-foreground">Quick Test Barcodes:</span>
          <div className="flex flex-wrap gap-2">
            {MOCK_ATTENDEES.slice(0, 3).map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  setQrInput(a.qrCode);
                  handleSimulateScan(a.qrCode);
                }}
                className="text-[10px] font-mono px-2 py-1 rounded-md bg-muted border border-border hover:bg-muted/80 text-foreground"
              >
                {a.qrCode} ({a.fullName.split(' ')[0]})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Verification State Column */}
      <div className="lg:col-span-5 space-y-4">
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-border/60">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Gate 1 Check-In Desk
              </span>
              <span className="text-xs font-bold text-emerald-600">
                {totalScannedToday} Verified
              </span>
            </div>

            {/* Validation Outcome Card */}
            {scanStatus === 'valid' && scannedResult && (
              <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 text-center space-y-3 animate-in fade-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <Badge className="bg-emerald-600 text-white text-[10px] uppercase font-bold tracking-wider">
                    Admission Granted
                  </Badge>
                  <h3 className="text-lg font-bold text-foreground mt-2">
                    {scannedResult.fullName}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {scannedResult.ticketTierName}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Seat: {scannedResult.tableOrSeat || 'General Hall Admission'}
                  </p>
                </div>
              </div>
            )}

            {scanStatus === 'already_checked' && scannedResult && (
              <div className="p-5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-500 text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-amber-500 text-white mx-auto flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <Badge className="bg-amber-600 text-white text-[10px] uppercase font-bold">
                    Already Checked In
                  </Badge>
                  <h3 className="text-lg font-bold text-foreground mt-2">
                    {scannedResult.fullName}
                  </h3>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Checked in today at {new Date(scannedResult.checkInTime || '').toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )}

            {scanStatus === 'invalid' && (
              <div className="p-5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-500 text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-rose-500 text-white mx-auto flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <Badge className="bg-rose-600 text-white text-[10px] uppercase font-bold">
                    Invalid QR Code
                  </Badge>
                  <p className="text-xs text-rose-800 dark:text-rose-300 mt-2">
                    No attendee record matches this ticket code. Please direct guest to Help Desk.
                  </p>
                </div>
              </div>
            )}

            <Button
              className="w-full text-xs"
              variant="outline"
              onClick={() => {
                setQrInput('');
                setScanStatus('valid');
              }}
            >
              Ready Next Attendee
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
