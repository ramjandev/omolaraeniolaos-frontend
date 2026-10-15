'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  User,
  Building2,
  Landmark,
  ShieldAlert,
  ScanLine,
  Ticket,
  ChevronDown,
  Check,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { USER_ROLES, UserRole } from '@/types/roles';

const ROLE_ICONS: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  organizer_individual: User,
  organizer_agency: Building2,
  organizer_venue: Landmark,
  admin: ShieldAlert,
  gate_staff: ScanLine,
  guest: Ticket,
};

export function RoleSwitcher({ currentRole }: { currentRole: UserRole }) {
  const router = useRouter();
  const activeRole = USER_ROLES[currentRole] || USER_ROLES.organizer_individual;
  const ActiveIcon = ROLE_ICONS[currentRole] || User;

  const handleSelectRole = (roleKey: UserRole) => {
    const target = USER_ROLES[roleKey];
    if (target) {
      router.push(target.defaultPath);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 w-full p-2.5 rounded-xl border border-border/80 bg-background/60 hover:bg-muted/70 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-primary/20">
        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <ActiveIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground truncate">
              Workspace
            </span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
              {activeRole.badge}
            </Badge>
          </div>
          <p className="text-sm font-medium text-foreground truncate">{activeRole.title}</p>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64 p-1.5 shadow-xl">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wider">
          Switch Workspace Role
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {(Object.keys(USER_ROLES) as UserRole[]).map((key) => {
          const role = USER_ROLES[key];
          const Icon = ROLE_ICONS[key];
          const isSelected = key === currentRole;

          return (
            <DropdownMenuItem
              key={key}
              onClick={() => handleSelectRole(key)}
              className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-muted focus:bg-muted"
            >
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{role.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{role.badge}</p>
              </div>
              {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
