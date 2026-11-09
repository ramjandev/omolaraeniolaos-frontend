'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { UserRole, USER_ROLES } from '@/types/roles';
import { ROLE_NAV_CONFIG } from './nav-config';
import { SidebarNavLinks } from './SidebarNavLinks';
import { eventsPath, organizerKindFromRole } from '@/lib/organizer';
import { useGetEventsQuery } from '@/store/Event/eventAPI';

const SIDEBAR_EVENT_LIMIT = 5;

interface AppSidebarProps {
  currentRole: UserRole;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function AppSidebar({
  currentRole,
  isMobileOpen = false,
  onMobileClose,
}: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const organizerKind = organizerKindFromRole(currentRole);
  const { data: eventsResponse } = useGetEventsQuery(undefined, { skip: !organizerKind });

  const navItems = React.useMemo(() => {
    const items = ROLE_NAV_CONFIG[currentRole] || ROLE_NAV_CONFIG.organizer_individual;
    if (!organizerKind) return items;
    const events = eventsResponse?.data?.events ?? [];
    return items.map((item) =>
      item.eventChildren
        ? {
            ...item,
            children: events.slice(0, SIDEBAR_EVENT_LIMIT).map((event) => ({
              title: event.title,
              href: eventsPath(organizerKind, event.id),
            })),
          }
        : item,
    );
  }, [currentRole, organizerKind, eventsResponse]);

  const billingHref =
    currentRole === 'organizer_agency'
      ? '/organizer/agency/billing'
      : currentRole === 'organizer_venue'
        ? '/organizer/venue/billing'
        : '/organizer/individual/billing';

  const isOrganizer =
    currentRole === 'organizer_individual' ||
    currentRole === 'organizer_agency' ||
    currentRole === 'organizer_venue';

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-earthstone/30 backdrop-blur-[2px] lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh shrink-0 flex-col overflow-hidden border-r border-border bg-sidebar transition-[width,transform] duration-200 lg:sticky lg:top-0 lg:z-40 ${
          isCollapsed ? 'w-20' : 'w-[260px]'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div
          className={`flex h-14 items-center border-b border-border ${
            isCollapsed ? 'justify-center gap-1 px-1.5' : 'justify-between px-4'
          }`}
        >
          <Link
            href={USER_ROLES[currentRole]?.defaultPath || '/organizer/individual'}
            className="flex items-center select-none"
            aria-label="McEniesVite home"
          >
            <Image
              src={isCollapsed ? '/images/logo-mark.png' : '/images/logo-black.png'}
              alt="McEniesVite"
              width={isCollapsed ? 32 : 139}
              height={isCollapsed ? 32 : 35}
              className={isCollapsed ? 'h-8 w-8 object-contain' : 'h-8 w-auto'}
              priority
            />
          </Link>

          <button
            type="button"
            onClick={onMobileClose}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Close navigation"
          >
            <X className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border text-foreground/80 transition-colors hover:bg-muted hover:text-foreground lg:flex"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle Sidebar"
          >
            <Image
              src="/images/sidebar-left.svg"
              alt=""
              width={20}
              height={20}
              className={`size-5 transition-transform ${isCollapsed ? 'scale-x-[-1]' : ''}`}
            />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div
            onClick={(event) => {
              if ((event.target as HTMLElement).closest('a')) onMobileClose?.();
            }}
          >
            <SidebarNavLinks items={navItems} isCollapsed={isCollapsed} />
          </div>
        </div>

        <div className="border-t border-border/40 p-3">
          {!isCollapsed ? (
            isOrganizer ? (
              <div className="relative overflow-hidden rounded-xl text-white shadow-md">
                <Image
                  src="/images/Promo_Card.png"
                  alt=""
                  fill
                  sizes="236px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/5 to-black/25" />
                <div className="relative z-10 space-y-3 p-3">
                  <div>
                    <p className="font-sans text-sm font-bold text-white">Go Pro</p>
                    <p className="mt-0.5 text-[11px] leading-tight text-white/85">
                      Manage events at scale
                    </p>
                  </div>
                  <Link
                    href={billingHref}
                    className="block w-full rounded-md border border-[#C98A5E]/60 bg-[#6B3416] px-3 py-2 text-center text-[11px] font-semibold text-white shadow-xs transition-colors hover:bg-[#5A2B12]"
                  >
                    Become an Organizer
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-0.5 rounded-2xl bg-[#261710] p-3.5 text-white shadow-md">
                <p className="text-xs font-bold tracking-wide text-white">
                  {currentRole === 'admin' ? 'Admin' : USER_ROLES[currentRole]?.title}
                </p>
                <p className="text-[11px] font-medium text-[#D4A373]">
                  {currentRole === 'admin' ? 'Platform Operator' : USER_ROLES[currentRole]?.badge}
                </p>
              </div>
            )
          ) : (
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#261710] text-xs font-bold text-white shadow-md">
              {currentRole === 'admin' ? 'AD' : 'MC'}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
