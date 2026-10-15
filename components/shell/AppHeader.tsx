'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Bell,
  Menu,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserRole, USER_ROLES } from '@/types/roles';
import { useLogout } from '@/lib/auth/logout';
import { useAppSelector } from '@/store/store';

interface AppHeaderProps {
  currentRole: UserRole;
  title?: string;
  subtitle?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  onMenuClick?: () => void;
}

export function AppHeader({
  currentRole,
  primaryAction,
  onMenuClick,
}: AppHeaderProps) {
  const role = USER_ROLES[currentRole] || USER_ROLES.organizer_individual;
  const { handleLogout } = useLogout();
  const currentUser = useAppSelector((state) => state.auth.user);

  const displayName = currentUser?.fullName || 'Folashade Tinubu';
  const displayEmail = currentUser?.email || 'folashade@mceniesfete.com';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'FT';

  const settingsHref =
    currentRole === 'admin'
      ? '/admin/settings'
      : currentRole === 'organizer_agency'
        ? '/organizer/agency/settings'
        : currentRole === 'organizer_venue'
          ? '/organizer/venue/settings'
          : currentRole === 'gate_staff'
            ? '/gate-staff/profile'
            : '/organizer/individual/settings';

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onMenuClick}
          className="shrink-0 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </Button>
        <div className="relative w-full max-w-72">
          <input
            type="text"
            placeholder="Search"
            aria-label="Search"
            className="h-9 w-full rounded-lg border border-border bg-background px-3 pr-12 text-xs text-foreground transition-all placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
          <div className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
            ⌘K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {primaryAction && (
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href={primaryAction.href}>{primaryAction.label}</Link>
          </Button>
        )}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-background" />
        </Button>

        {/* Profile Dropdown with Logout Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer transition-transform hover:scale-105"
              aria-label="User Profile Menu"
            >
              <Avatar className="w-8 h-8 border border-border">
                <AvatarImage
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="User"
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-background" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 p-1.5 rounded-2xl bg-card border border-border shadow-xl z-50"
          >
            <div className="px-3 py-2 border-b border-border/60">
              <p className="text-xs font-bold text-foreground">{displayName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{displayEmail}</p>
              <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {role.title}
              </span>
            </div>

            <DropdownMenuItem asChild className="cursor-pointer rounded-xl text-xs py-2">
              <Link href={settingsHref} className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-border/60" />

            {/* Logout Button */}
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer rounded-xl text-xs py-2 text-red-600 focus:text-red-600 focus:bg-red-500/10 flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="font-semibold">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
