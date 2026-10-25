'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, LayoutGrid, Clock, User, Bell } from 'lucide-react';
import { pingGatePresence } from '@/lib/api/platform';

interface GateMobileShellProps {
  children: React.ReactNode;
  showHeader?: boolean;
  activeTab?: 'events' | 'checkin' | 'history' | 'profile';
}

export function GateMobileShell({
  children,
  showHeader = true,
  activeTab,
}: GateMobileShellProps) {
  const pathname = usePathname();
  const [initials, setInitials] = React.useState('GS');

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('mcenies_auth_user');
      const user = raw ? JSON.parse(raw) as { fullName?: string } : null;
      const letters = (user?.fullName || '')
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      if (letters) setInitials(letters);
    } catch {
      setInitials('GS');
    }
  }, []);

  React.useEffect(() => {
    if (pathname.includes('/login')) return;
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) return;
    const ping = () => {
      void pingGatePresence();
    };
    ping();
    const timer = window.setInterval(ping, 20000);
    return () => window.clearInterval(timer);
  }, [pathname]);

  // Determine current tab if not specified
  const current = activeTab || (
    pathname.includes('/scanner') || pathname.includes('/verify') || pathname.includes('/guest')
      ? 'checkin'
      : pathname.includes('/history')
      ? 'history'
      : pathname.includes('/profile')
      ? 'profile'
      : pathname === '/gate-staff' || pathname.startsWith('/gate-staff/events')
      ? 'events'
      : 'checkin'
  );

  return (
    <div className="min-h-screen bg-[#F0EDE6] sm:py-6 flex justify-center items-start">
      {/* Mobile container - strictly styled like a native mobile phone screen */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[880px] sm:max-h-[920px] bg-[#FBFAF6] sm:rounded-[36px] sm:shadow-2xl flex flex-col relative overflow-hidden sm:border sm:border-[#E8E4DC]">
        
        {/* App Bar (when enabled) */}
        {showHeader && (
          <header className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[#F0ECE4]/60 bg-[#FBFAF6]/90 backdrop-blur-md sticky top-0 z-30">
            <Link href="/gate-staff" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#7A3B18] flex items-center justify-center text-white font-serif font-bold text-base shadow-xs">
                M
              </div>
              <span className="font-serif font-semibold text-lg text-[#1F1916] tracking-tight">
                McEniesVite
              </span>
            </Link>
            
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                aria-label="Notifications"
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#4A403A] hover:bg-[#F2EEE9] transition-colors relative"
              >
                <Bell className="w-5 h-5 stroke-[1.8]" />
              </button>
              <Link href="/gate-staff/profile" className="w-8 h-8 rounded-full border border-[#D5CFC7] bg-[#E8E2D8] flex items-center justify-center text-xs font-semibold text-[#5A4F46]">
                {initials}
              </Link>
            </div>
          </header>
        )}

        {/* Scrollable Viewport Content */}
        <main className="flex-1 overflow-y-auto px-5 py-5 pb-24 space-y-4">
          {children}
        </main>

        {/* Bottom Tab Bar matching mockup */}
        <nav 
          aria-label="Gate staff navigation"
          className="absolute bottom-0 inset-x-0 bg-[#FFFFFF] border-t border-[#ECE7DE] py-2 px-3 flex items-center justify-around z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]"
        >
          {/* My Events */}
          <Link
            href="/gate-staff"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[72px] transition-colors ${
              current === 'events'
                ? 'bg-[#F6EFEA] text-[#7A3B18] font-medium'
                : 'text-[#685D55] hover:text-[#1F1916]'
            }`}
          >
            <div className="w-6 h-6 flex items-center justify-center mb-0.5">
              <Calendar className={`w-5 h-5 stroke-[2] ${current === 'events' ? 'text-[#7A3B18]' : 'text-[#756B63]'}`} />
            </div>
            <span className="text-[11px] leading-tight font-medium">My events</span>
          </Link>

          {/* Check-In */}
          <Link
            href="/gate-staff/checkin"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[72px] transition-colors ${
              current === 'checkin'
                ? 'bg-[#F6EFEA] text-[#7A3B18] font-medium'
                : 'text-[#685D55] hover:text-[#1F1916]'
            }`}
          >
            <div className="w-6 h-6 flex items-center justify-center mb-0.5">
              <LayoutGrid className={`w-5 h-5 stroke-[2] ${current === 'checkin' ? 'text-[#7A3B18]' : 'text-[#756B63]'}`} />
            </div>
            <span className="text-[11px] leading-tight font-medium">Check-In</span>
          </Link>

          {/* Check-in History */}
          <Link
            href="/gate-staff/history"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[72px] transition-colors ${
              current === 'history'
                ? 'bg-[#F6EFEA] text-[#7A3B18] font-medium'
                : 'text-[#685D55] hover:text-[#1F1916]'
            }`}
          >
            <div className="w-6 h-6 flex items-center justify-center mb-0.5">
              <Clock className={`w-5 h-5 stroke-[2] ${current === 'history' ? 'text-[#7A3B18]' : 'text-[#756B63]'}`} />
            </div>
            <span className="text-[11px] leading-tight font-medium whitespace-nowrap">Check-in History</span>
          </Link>

          {/* My Profile */}
          <Link
            href="/gate-staff/profile"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl min-w-[72px] transition-colors ${
              current === 'profile'
                ? 'bg-[#F6EFEA] text-[#7A3B18] font-medium'
                : 'text-[#685D55] hover:text-[#1F1916]'
            }`}
          >
            <div className="w-6 h-6 flex items-center justify-center mb-0.5">
              <User className={`w-5 h-5 stroke-[2] ${current === 'profile' ? 'text-[#7A3B18]' : 'text-[#756B63]'}`} />
            </div>
            <span className="text-[11px] leading-tight font-medium">My Profile</span>
          </Link>
        </nav>

      </div>
    </div>
  );
}
