import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'VIP Guest RSVP & Access Credential | McEniesVite',
  description: 'Interactive RSVP concierge and digital VIP credential pass for McEniesVite',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'McEniesVite VIP Guest',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#075E54',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-[#E5DDD5] select-none touch-manipulation antialiased">
      {children}
    </div>
  );
}
