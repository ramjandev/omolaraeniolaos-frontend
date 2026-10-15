'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  Users,
  Mail,
  BadgePercent,
  Settings,
  Briefcase,
  CalendarRange,
  Receipt,
  CreditCard,
  Building,
  CalendarClock,
  Grid3X3,
  BarChart3,
  ShieldCheck,
  Users2,
  Terminal,
  Sliders,
  CalendarCheck,
  Scan,
  UserCheck,
  Ticket,
  Compass,
  Calendar,
  UserCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NavItem } from './nav-config';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  Users,
  Mail,
  BadgePercent,
  Settings,
  Briefcase,
  CalendarRange,
  Receipt,
  CreditCard,
  Building,
  CalendarClock,
  Grid3X3,
  BarChart3,
  ShieldCheck,
  Users2,
  Terminal,
  Sliders,
  CalendarCheck,
  Scan,
  UserCheck,
  Ticket,
  Compass,
  Calendar,
  UserCircle,
};

export function SidebarNavLinks({
  items,
  isCollapsed = false,
}: {
  items: NavItem[];
  isCollapsed?: boolean;
}) {
  const pathname = usePathname();

  // Group items by section or render flat
  let lastSection: string | undefined = undefined;

  return (
    <nav className="flex flex-col gap-1 px-2.5 py-2">
      {items.map((item) => {
        const IconComponent = ICON_MAP[item.iconName] || LayoutDashboard;
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        const showSection = !isCollapsed && item.section && item.section !== lastSection;
        if (item.section) {
          lastSection = item.section;
        }

        return (
          <React.Fragment key={`${item.section || 'default'}-${item.title}-${item.href}`}>
            {showSection && (
              <div className="px-2.5 pb-1 pt-4 text-xs font-normal text-muted-foreground">
                {item.section}
              </div>
            )}
            <Link
              href={item.href}
              title={isCollapsed ? item.title : undefined}
              className={`flex items-center ${
                isCollapsed ? 'justify-center p-2.5' : 'justify-between px-2.5 py-2.5'
              } rounded-lg text-sm font-normal transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-xs font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} min-w-0`}>
                <IconComponent
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-white'
                      : 'text-muted-foreground'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.title}</span>}
              </div>
              {!isCollapsed && item.badge && (
                <Badge
                  variant={isActive ? 'outline' : 'secondary'}
                  className={`text-[10px] uppercase font-semibold px-1.5 py-0 ${
                    isActive ? 'border-primary-foreground/40 text-primary-foreground' : ''
                  }`}
                >
                  {item.badge}
                </Badge>
              )}
              {!isCollapsed && item.children && item.children.length > 0 && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive ? 'text-white' : 'text-muted-foreground'
                  }`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
            </Link>

            {/* Nested Sub-items (matching Figma accordion on Events) */}
            {!isCollapsed && item.children && item.children.length > 0 && (
              <div className="pl-6 pr-1 py-0.5 space-y-0.5">
                {item.children.map((child) => {
                  const isChildActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`flex items-center justify-between pl-3 pr-2 py-1.5 text-[11px] transition-colors border-l-2 ${
                        isChildActive
                          ? 'border-primary text-foreground font-semibold'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40'
                      }`}
                    >
                      <span className="truncate">{child.title}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
