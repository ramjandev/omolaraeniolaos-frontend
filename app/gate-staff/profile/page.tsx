'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { logout, setCredentials } from '@/store/Auth/authSlice';
import { useChangePasswordMutation } from '@/store/Auth/authApi';
import { GateMobileShell } from '@/components/gate-staff/GateMobileShell';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getGateWorkspace, type GateWorkspace } from '@/lib/api/platform';

function formatEventDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'GS';
}

export default function GateStaffProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation();
  const [workspace, setWorkspace] = React.useState<GateWorkspace | null>(null);
  const [passwordOpen, setPasswordOpen] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');

  React.useEffect(() => {
    getGateWorkspace().then(setWorkspace).catch(() => setWorkspace(null));
  }, []);

  const staff = workspace?.staff;
  const assignments = workspace?.events ?? [];

  const closePassword = () => {
    setPasswordOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError('');
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    try {
      const response = await changePassword({ currentPassword, newPassword }).unwrap();
      if (response.data?.accessToken) {
        dispatch(setCredentials({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          user: user || undefined,
        }));
      }
      closePassword();
      toast.success('Password changed');
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string } };
      setPasswordError(apiError.data?.message || 'Password could not be changed.');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('mcenies_auth_user');
    router.push('/gate-staff/login');
  };

  return (
    <GateMobileShell showHeader={false} activeTab="profile">
      <div className="space-y-4 pt-1">
        
        {/* Title */}
        <h1 className="font-serif text-3xl font-medium tracking-tight text-[#1F1916] mb-2">
          My Profile
        </h1>

        {/* Staff Profile Card matching mockup 10 */}
        <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4 relative">
          
          {/* Top row with avatar + name + edit icon */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full border border-[#D5CFC7] bg-[#E8E2D8] flex items-center justify-center text-base font-semibold text-[#5A4F46]">
                {initials(staff?.fullName || 'Gate Staff')}
              </div>
              <div className="space-y-0.5">
                <h2 className="font-semibold text-lg text-[#1F1916]">
                  {staff?.fullName || 'Gate Staff'}
                </h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2A6E3B] inline-block" />
                  <span className="text-xs text-[#2A6E3B] font-medium">
                    Gate Staff
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              aria-label="Edit Profile"
              className="text-[#1F1916] hover:text-[#7A3B18] p-1"
            >
              <Pencil className="w-4 h-4 stroke-[1.8]" />
            </button>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[#8A7E75] block">Email</span>
            <span className="text-sm font-semibold text-[#1F1916] block">
              {staff?.email || 'Not signed in'}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[#8A7E75] block">Phone number</span>
            <span className="text-sm font-semibold text-[#1F1916] block">
              {staff?.phone || 'Not added'}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[#8A7E75] block">Assigned Role</span>
            <span className="text-sm font-semibold text-[#1F1916] block">
              Gate Staff
            </span>
          </div>
        </div>

        {/* Change Password Button */}
        <button
          type="button"
          onClick={() => setPasswordOpen(true)}
          className="w-full py-3.5 px-4 bg-[#211612] hover:bg-[#34241D] text-white rounded-2xl text-sm font-medium transition-colors shadow-xs active:scale-[0.99]"
        >
          Change Password
        </button>

        <Dialog open={passwordOpen} onOpenChange={(open) => { if (!open) closePassword(); else setPasswordOpen(true); }}>
          <DialogContent className="sm:max-w-md rounded-3xl border border-[#EAE5DC] bg-white p-6">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-medium text-[#1F1916]">
                Change Password
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleChangePassword} className="space-y-3 pt-1">
              <label className="block space-y-1">
                <span className="text-xs text-[#8A7E75]">Current password</span>
                <input
                  required
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[#EAE5DC] px-3 py-2.5 text-sm text-[#1F1916] outline-none focus:ring-1 focus:ring-[#7A3B18]"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs text-[#8A7E75]">New password</span>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-[#EAE5DC] px-3 py-2.5 text-sm text-[#1F1916] outline-none focus:ring-1 focus:ring-[#7A3B18]"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs text-[#8A7E75]">Confirm new password</span>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-[#EAE5DC] px-3 py-2.5 text-sm text-[#1F1916] outline-none focus:ring-1 focus:ring-[#7A3B18]"
                />
              </label>
              {passwordError && (
                <p className="text-xs text-[#B33927]">{passwordError}</p>
              )}
              <button
                type="submit"
                disabled={changingPassword}
                className="w-full rounded-2xl bg-[#211612] py-3 text-sm font-medium text-white disabled:opacity-60"
              >
                {changingPassword ? 'Saving...' : 'Save new password'}
              </button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Current Assignments Section */}
        <div className="space-y-3 pt-2">
          <h3 className="font-semibold text-sm text-[#1F1916]">
            Current Assignments
          </h3>

          {assignments.length === 0 && (
            <p className="text-xs text-[#70665F]">No current assignments.</p>
          )}
          {assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
              <h4 className="font-semibold text-base text-[#1F1916]">
                {assignment.title}
              </h4>

              <div className="space-y-0.5">
                <span className="text-xs text-[#8A7E75] block">Assigned gate</span>
                <span className="text-sm font-semibold text-[#1F1916] block">
                  {assignment.gate}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs text-[#8A7E75] block">Date</span>
                <span className="text-sm font-semibold text-[#1F1916] block">
                  {formatEventDate(assignment.startDate)}
                </span>
              </div>

              <p className="text-[11px] font-semibold text-[#8A7E75] tracking-wider uppercase pt-1">
                READ-ONLY ASSIGNMENT
              </p>
            </div>
          ))}
        </div>

        {/* Log Out Outline Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3.5 px-4 bg-transparent border border-[#7A3B18] text-[#7A3B18] hover:bg-[#F8F1EB] rounded-2xl text-sm font-semibold transition-colors active:scale-[0.99] text-center"
          >
            Log Out
          </button>
        </div>

      </div>
    </GateMobileShell>
  );
}
