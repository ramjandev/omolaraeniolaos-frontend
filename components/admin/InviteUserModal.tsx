'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronDown, X } from 'lucide-react';

interface InviteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite?: (data: { fullName: string; role: string; email: string }) => void;
}

export function InviteUserModal({
  open,
  onOpenChange,
  onInvite,
}: InviteUserModalProps) {
  const [fullName, setFullName] = React.useState('');
  const [role, setRole] = React.useState('Admin');
  const [email, setEmail] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onInvite) {
      onInvite({ fullName, role, email });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[420px] p-6 sm:p-7 rounded-2xl bg-card border border-border shadow-2xl"
      >
        {/* Header matching modal design */}
        <div className="flex items-center justify-between pb-1">
          <DialogTitle className="text-lg font-medium text-foreground tracking-tight">
            Invite User
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-foreground/90 block">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g, Grand Celebration Pass"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-[#703816] transition-all"
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-foreground/90 block">
              Role
            </label>
            <div className="relative">
              <select
                aria-label="User Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full appearance-none px-3.5 pr-8 py-2.5 rounded-xl border border-border/80 bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#703816] cursor-pointer"
              >
                <option value="Admin">Admin</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Platform Operator">Platform Operator</option>
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-normal text-foreground/90 block">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g, Grand Celebration Pass"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-[#703816] transition-all"
            />
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#6E3B1C] hover:bg-[#5C3016] text-white text-xs font-medium transition-colors shadow-sm flex items-center justify-center cursor-pointer active:scale-[0.99]"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
