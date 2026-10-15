'use client';

import * as React from 'react';
import { UserRole } from '@/types/roles';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

interface AppShellProps {
  currentRole: UserRole;
  title?: string;
  subtitle?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  children: React.ReactNode;
}

export function AppShell({
  currentRole,
  title,
  subtitle,
  primaryAction,
  children,
}: AppShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  return (
    <div className="flex min-h-dvh w-full overflow-hidden bg-background text-foreground antialiased">
      <AppSidebar
        currentRole={currentRole}
        isMobileOpen={isMobileNavOpen}
        onMobileClose={() => setIsMobileNavOpen(false)}
      />

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col lg:h-dvh lg:overflow-hidden">
        <AppHeader
          currentRole={currentRole}
          title={title}
          subtitle={subtitle}
          primaryAction={primaryAction}
          onMenuClick={() => setIsMobileNavOpen(true)}
        />

        <main className="min-h-0 w-full flex-1 overflow-y-auto">
          <div className="page-container">{children}</div>
        </main>
      </div>
    </div>
  );
}
