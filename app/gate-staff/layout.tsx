import type { Metadata, Viewport } from 'next';
import { GateOfflineSync } from '@/components/gate-staff/GateOfflineSync';

export const metadata: Metadata = {
  title: 'Gate Staff PWA | McEniesVite',
  description: 'Mobile-only fast access control and ticket verification system for McEniesVite',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'McEniesVite Gate',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#7A3B18',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function GateStaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-[#F0EDE6] select-none touch-manipulation antialiased">
      <GateOfflineSync />
      {children}
    </div>
  );
}
