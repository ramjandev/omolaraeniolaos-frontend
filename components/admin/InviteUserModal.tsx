'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ChevronDown, X } from 'lucide-react';

const ROLE_OPTIONS = ['Admin', 'Super Admin', 'Platform Operator'] as const;

export interface PlatformUserFormValues {
  fullName: string;
  role: string;
  email: string;
  status: 'Active' | 'Suspended';
}

interface InviteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'invite' | 'edit';
  initial?: PlatformUserFormValues | null;
  submitting?: boolean;
  issued?: { email: string; temporaryPassword: string; emailSent: boolean } | null;
  onSubmit?: (data: PlatformUserFormValues) => void;
}

export function InviteUserModal({
  open,
  onOpenChange,
  mode = 'invite',
  initial,
  submitting = false,
  issued = null,
  onSubmit,
}: InviteUserModalProps) {
  const [fullName, setFullName] = React.useState('');
  const [role, setRole] = React.useState('Admin');
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'Active' | 'Suspended'>('Active');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setFullName(initial?.fullName || '');
    setRole(initial?.role || 'Admin');
    setEmail(initial?.email || '');
    setStatus(initial?.status || 'Active');
    setCopied(false);
  }, [open, initial]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit?.({ fullName: fullName.trim(), role, email: email.trim(), status });
  };

  const copyPassword = async () => {
    if (!issued?.temporaryPassword) return;
    await navigator.clipboard.writeText(issued.temporaryPassword);
    setCopied(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[420px] p-6 sm:p-7 rounded-2xl bg-card border border-border shadow-2xl"
      >
        <div className="flex items-center justify-between pb-1">
          <DialogTitle className="text-lg font-medium text-foreground tracking-tight">
            {issued ? 'Invitation sent' : mode === 'edit' ? 'Edit User' : 'Invite User'}
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

        {issued ? (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {issued.emailSent
                ? `A sign-in email was sent to ${issued.email}. The temporary password is also shown here.`
                : `Email could not be sent. Share this temporary password with ${issued.email}.`}
            </p>
            <div className="rounded-xl border border-border/80 bg-muted/30 px-3.5 py-3">
              <p className="text-[11px] text-muted-foreground">Temporary password</p>
              <p className="mt-1 font-mono text-sm text-foreground break-all">{issued.temporaryPassword}</p>
            </div>
            <button
              type="button"
              onClick={copyPassword}
              className="w-full py-3 px-4 rounded-xl bg-[#6E3B1C] hover:bg-[#5C3016] text-white text-xs font-medium transition-colors"
            >
              {copied ? 'Copied' : 'Copy password'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-normal text-foreground/90 block">Full Name</label>
              <input
                type="text"
                required
                minLength={2}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="e.g. Ama Boateng"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-[#703816] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-normal text-foreground/90 block">Role</label>
              <div className="relative">
                <select
                  aria-label="User Role"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="w-full appearance-none px-3.5 pr-8 py-2.5 rounded-xl border border-border/80 bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#703816] cursor-pointer"
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-normal text-foreground/90 block">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                readOnly={mode === 'edit'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-[#703816] transition-all read-only:bg-muted/40"
              />
            </div>

            {mode === 'edit' && (
              <div className="space-y-1.5">
                <label className="text-xs font-normal text-foreground/90 block">Status</label>
                <div className="relative">
                  <select
                    aria-label="User Status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value as 'Active' | 'Suspended')}
                    className="w-full appearance-none px-3.5 pr-8 py-2.5 rounded-xl border border-border/80 bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#703816] cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-[#6E3B1C] hover:bg-[#5C3016] disabled:opacity-60 text-white text-xs font-medium transition-colors shadow-sm flex items-center justify-center cursor-pointer active:scale-[0.99]"
              >
                {submitting ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Send Invitation'}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
