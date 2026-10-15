'use client';

import * as React from 'react';
import {
  Camera,
  Check,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGetMeQuery } from '@/store/Auth/authApi';

const DEMO_AVATAR =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80';

export default function IndividualSettingsPage() {
  const { data: profile, isLoading: isProfileLoading } = useGetMeQuery();
  const user = profile?.data;

  const [activeTab, setActiveTab] = React.useState<'profile' | 'notifications' | 'security'>('profile');
  const [showSavedBanner, setShowSavedBanner] = React.useState(false);
  const [bannerMessage, setBannerMessage] = React.useState('Changes saved successfully');

  // Personal Information
  const [avatarUrl, setAvatarUrl] = React.useState(DEMO_AVATAR);
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');

  React.useEffect(() => {
    if (!user) return;
    setFullName(user.fullName ?? '');
    setEmail(user.email ?? '');
    setPhone(user.phone ?? '');
    if (user.avatarUrl) setAvatarUrl(user.avatarUrl);
  }, [user]);

  // Notification Preferences
  const [notifications, setNotifications] = React.useState({
    rsvpUpdates: true,
    guestReminders: true,
    eventUpdates: true,
    billingNotifications: true,
  });

  // Modal states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false);

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    setBannerMessage('Personal information updated successfully');
    setShowSavedBanner(true);
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setBannerMessage('Notification preferences saved successfully');
    setShowSavedBanner(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
          setBannerMessage('Profile picture updated successfully');
          setShowSavedBanner(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(false);
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setBannerMessage('Password changed successfully');
      setShowSavedBanner(true);
    }, 1000);
  };

  const handleLogoutOtherDevices = () => {
    setBannerMessage('All other active device sessions have been logged out');
    setShowSavedBanner(true);
  };

  const handleDeleteAccount = () => {
    setIsDeletingAccount(true);
    setTimeout(() => {
      setIsDeletingAccount(false);
      setIsDeleteModalOpen(false);
      window.location.href = '/login';
    }, 1500);
  };

  return (
    <AppShell currentRole="organizer_individual">
      <div className="w-full space-y-6">
        {/* Top Header matching Figma: "Settings" & subtitle */}
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-normal text-[#1F140E] dark:text-[#FBF8F5] tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-[#736B66] dark:text-muted-foreground mt-1">
            Manage your account and event preferences.
          </p>
        </div>

        {/* Tabs Bar matching Figma: Profile, Notifications, Security */}
        <div className="flex items-center gap-6 border-b border-[#EBE3D9] dark:border-border/80">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-xs transition-colors relative ${
              activeTab === 'profile'
                ? 'text-[#1F140E] dark:text-foreground font-semibold border-b-2 border-[#8C4B24]'
                : 'text-[#736B66] dark:text-muted-foreground hover:text-foreground'
            }`}
          >
            Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 text-xs transition-colors relative ${
              activeTab === 'notifications'
                ? 'text-[#1F140E] dark:text-foreground font-semibold border-b-2 border-[#8C4B24]'
                : 'text-[#736B66] dark:text-muted-foreground hover:text-foreground'
            }`}
          >
            Notifications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`pb-3 text-xs transition-colors relative ${
              activeTab === 'security'
                ? 'text-[#1F140E] dark:text-foreground font-semibold border-b-2 border-[#8C4B24]'
                : 'text-[#736B66] dark:text-muted-foreground hover:text-foreground'
            }`}
          >
            Security
          </button>
        </div>

        {/* Tab 1: Profile (Personal Information) */}
        {activeTab === 'profile' && (
          <div
            className="rounded-2xl border border-[#EBE3D9] dark:border-border/80 bg-white dark:bg-card p-6 md:p-8 shadow-xs space-y-6"
          >
          {/* Changes Saved Banner matching Figma screenshot */}
          {showSavedBanner && (
            <div className="p-3 px-4 rounded-xl border border-[#C8E6C9] dark:border-[#2E7D32]/40 bg-[#F1F8E9]/80 dark:bg-[#2E7D32]/10 text-[#2E7D32] dark:text-[#81C784] text-xs flex items-center justify-between gap-2 transition-all">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] dark:text-[#81C784] shrink-0" />
                <span>{bannerMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSavedBanner(false)}
                className="text-[#2E7D32] hover:opacity-70 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Section Title */}
          <h2 className="font-serif text-xl md:text-2xl font-normal text-[#1F140E] dark:text-foreground">
            Personal Information
          </h2>

          {/* Profile Picture Row */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[#EBE3D9] shrink-0 bg-[#FAF8F5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-full h-full object-cover"
              />
              <label
                htmlFor="avatar-upload-input"
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
                title="Change Profile Picture"
              >
                <Camera className="w-3.5 h-3.5" />
                <input
                  id="avatar-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <div className="text-xs font-semibold text-[#1F140E] dark:text-foreground">
                Profile Picture
              </div>
              <div className="text-[11px] text-[#736B66] dark:text-muted-foreground mt-0.5">
                JPG, GIF or PNG. Max size of 800K.
              </div>
            </div>
          </div>

          {/* Form Inputs Grid */}
          <form onSubmit={handleSavePersonal} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-[#1F140E] dark:text-foreground">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isProfileLoading}
                  placeholder={isProfileLoading ? 'Loading…' : ''}
                  className="rounded-xl border-[#EBE3D9] dark:border-border/80 text-xs py-2 bg-white dark:bg-card text-foreground"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-[#1F140E] dark:text-foreground">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isProfileLoading}
                  placeholder={isProfileLoading ? 'Loading…' : ''}
                  className="rounded-xl border-[#EBE3D9] dark:border-border/80 text-xs py-2 bg-white dark:bg-card text-foreground"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-[#1F140E] dark:text-foreground">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isProfileLoading}
                  placeholder={isProfileLoading ? 'Loading…' : ''}
                  className="rounded-xl border-[#EBE3D9] dark:border-border/80 text-xs py-2 bg-white dark:bg-card text-foreground"
                />
              </div>
            </div>

            {/* Save Button matching Figma */}
            <Button
              type="submit"
              className="bg-[#241710] hover:bg-[#3D2518] text-white px-6 py-2.5 rounded-xl text-xs font-medium transition-colors shadow-xs"
            >
              Save Changes
            </Button>
          </form>
        </div>
      )}

      {/* Tab 2: Notification Preferences */}
      {activeTab === 'notifications' && (
        <div
          className="rounded-2xl border border-[#EBE3D9] dark:border-border/80 bg-white dark:bg-card p-6 md:p-8 shadow-xs space-y-6"
        >
          {/* Changes Saved Banner */}
          {showSavedBanner && (
            <div className="p-3 px-4 rounded-xl border border-[#C8E6C9] dark:border-[#2E7D32]/40 bg-[#F1F8E9]/80 dark:bg-[#2E7D32]/10 text-[#2E7D32] dark:text-[#81C784] text-xs flex items-center justify-between gap-2 transition-all">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] dark:text-[#81C784] shrink-0" />
                <span>{bannerMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSavedBanner(false)}
                className="text-[#2E7D32] hover:opacity-70 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Section Title */}
          <h2 className="font-serif text-xl md:text-2xl font-normal text-[#1F140E] dark:text-foreground">
            Notification Preferences
          </h2>

          {/* Toggle Items */}
          <form onSubmit={handleSaveNotifications} className="space-y-6">
            <div className="divide-y divide-[#EBE3D9]/60 dark:divide-border/60">
              {/* RSVP Updates */}
              <div className="py-4 flex items-center justify-between gap-4 first:pt-0">
                <div>
                  <div className="text-xs font-semibold text-[#1F140E] dark:text-foreground">
                    RSVP Updates
                  </div>
                  <div className="text-[11px] text-[#736B66] dark:text-muted-foreground mt-0.5">
                    Receive notifications when guests respond.
                  </div>
                </div>
                <Switch
                  checked={notifications.rsvpUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, rsvpUpdates: checked }))
                  }
                  className="data-[state=checked]:bg-[#6E3B1C] data-[state=checked]:dark:bg-[#8C4B24]"
                />
              </div>

              {/* Guest Reminders */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-[#1F140E] dark:text-foreground">
                    Guest Reminders
                  </div>
                  <div className="text-[11px] text-[#736B66] dark:text-muted-foreground mt-0.5">
                    Receive reminders about pending RSVPs.
                  </div>
                </div>
                <Switch
                  checked={notifications.guestReminders}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, guestReminders: checked }))
                  }
                  className="data-[state=checked]:bg-[#6E3B1C] data-[state=checked]:dark:bg-[#8C4B24]"
                />
              </div>

              {/* Event Updates */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-[#1F140E] dark:text-foreground">
                    Event Updates
                  </div>
                  <div className="text-[11px] text-[#736B66] dark:text-muted-foreground mt-0.5">
                    Receive important updates about your events.
                  </div>
                </div>
                <Switch
                  checked={notifications.eventUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, eventUpdates: checked }))
                  }
                  className="data-[state=checked]:bg-[#6E3B1C] data-[state=checked]:dark:bg-[#8C4B24]"
                />
              </div>

              {/* Billing Notifications */}
              <div className="py-4 flex items-center justify-between gap-4 last:pb-0">
                <div>
                  <div className="text-xs font-semibold text-[#1F140E] dark:text-foreground">
                    Billing Notifications
                  </div>
                  <div className="text-[11px] text-[#736B66] dark:text-muted-foreground mt-0.5">
                    Receive payment and subscription notifications.
                  </div>
                </div>
                <Switch
                  checked={notifications.billingNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, billingNotifications: checked }))
                  }
                  className="data-[state=checked]:bg-[#6E3B1C] data-[state=checked]:dark:bg-[#8C4B24]"
                />
              </div>
            </div>

            {/* Save Preferences Button */}
            <Button
              type="submit"
              className="bg-[#241710] hover:bg-[#3D2518] text-white px-6 py-2.5 rounded-xl text-xs font-medium transition-colors shadow-xs"
            >
              Save Preferences
            </Button>
          </form>
        </div>
      )}

      {/* Tab 3: Account Security */}
      {activeTab === 'security' && (
        <div
          className="rounded-2xl border border-[#EBE3D9] dark:border-border/80 bg-white dark:bg-card p-6 md:p-8 shadow-xs space-y-6"
        >
          {/* Changes Saved Banner */}
          {showSavedBanner && (
            <div className="p-3 px-4 rounded-xl border border-[#C8E6C9] dark:border-[#2E7D32]/40 bg-[#F1F8E9]/80 dark:bg-[#2E7D32]/10 text-[#2E7D32] dark:text-[#81C784] text-xs flex items-center justify-between gap-2 transition-all">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] dark:text-[#81C784] shrink-0" />
                <span>{bannerMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSavedBanner(false)}
                className="text-[#2E7D32] hover:opacity-70 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Section Title */}
          <h2 className="font-serif text-xl md:text-2xl font-normal text-[#1F140E] dark:text-foreground">
            Account Security
          </h2>

          <div className="space-y-4">
            {/* Change Password */}
            <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[#1F140E] dark:text-foreground">
                  Change Password
                </div>
                <div className="text-[11px] text-[#736B66] dark:text-muted-foreground mt-0.5">
                  Secure your account by choosing a robust passkey.
                </div>
              </div>
              <Button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="bg-[#6E3B1C] hover:bg-[#5C3117] text-white px-5 py-2 rounded-xl text-xs font-medium shrink-0 self-start sm:self-auto transition-colors shadow-xs"
              >
                Change
              </Button>
            </div>

            {/* Email Verification Status */}
            <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#EBE3D9]/60 dark:border-border/60 pt-4">
              <div>
                <div className="text-xs font-semibold text-[#1F140E] dark:text-foreground">
                  Email Verification Status
                </div>
                <div className="text-[11px] text-[#736B66] dark:text-muted-foreground mt-0.5">
                  Confirm ownership of your registered email address.
                </div>
              </div>
              <div className="border border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46] px-3 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                <Check className="w-3.5 h-3.5 text-[#059669]" strokeWidth={2.5} />
                <span>Verified</span>
              </div>
            </div>

            {/* Device Management */}
            <div className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#EBE3D9]/60 dark:border-border/60 pt-4">
              <div>
                <div className="text-xs font-semibold text-[#1F140E] dark:text-foreground">
                  Device Management
                </div>
                <div className="text-[11px] text-[#736B66] dark:text-muted-foreground mt-0.5">
                  Log out of all other current active browser sessions.
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogoutOtherDevices}
                className="text-[#6E3B1C] hover:text-[#5C3117] text-xs font-semibold underline cursor-pointer shrink-0 self-start sm:self-auto transition-colors"
              >
                Log Out of All Other Devices
              </button>
            </div>

            {/* Delete Account Box */}
            <div className="rounded-2xl border border-[#FCA5A5] dark:border-red-900/50 bg-[#FEF2F2] dark:bg-red-950/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
              <div>
                <div className="text-xs font-bold text-[#991B1B] dark:text-red-400">
                  Delete Account
                </div>
                <div className="text-[11px] text-[#B91C1C] dark:text-red-300 mt-0.5">
                  Permanently delete your account and associated event data.
                </div>
              </div>
              <Button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="bg-[#B91C1C] hover:bg-[#991B1B] text-white px-5 py-2 rounded-xl text-xs font-medium shrink-0 self-start sm:self-auto shadow-xs transition-colors"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}

        {/* Modal: Change Password */}
        <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
          <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-white dark:bg-[#1A110B] border border-[#EBE3D9] dark:border-[#382417] shadow-xl">
            <DialogHeader className="pb-2">
              <DialogTitle className="font-serif text-xl font-bold text-[#1F140E] dark:text-foreground">
                Change Password
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleChangePassword} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1F140E] dark:text-foreground">
                  Current Password
                </Label>
                <Input
                  required
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="rounded-xl border-[#EBE3D9] dark:border-border/80 text-xs py-2"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1F140E] dark:text-foreground">
                  New Password
                </Label>
                <Input
                  required
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new passkey (min 8 characters)"
                  className="rounded-xl border-[#EBE3D9] dark:border-border/80 text-xs py-2"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#1F140E] dark:text-foreground">
                  Confirm New Password
                </Label>
                <Input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new passkey"
                  className="rounded-xl border-[#EBE3D9] dark:border-border/80 text-xs py-2"
                />
              </div>

              <Button
                type="submit"
                disabled={isChangingPassword || !currentPassword || !newPassword}
                className="w-full bg-[#6E3B1C] hover:bg-[#5C3117] text-white font-semibold text-xs py-3 rounded-xl transition-colors shadow-xs"
              >
                {isChangingPassword ? 'Updating Password...' : 'Save New Password'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal: Delete Account Confirmation */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-white dark:bg-[#1A110B] border border-red-200 dark:border-red-900/50 shadow-xl">
            <DialogHeader className="pb-2">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mb-2">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <DialogTitle className="font-serif text-xl font-bold text-red-600">
                Permanently Delete Account?
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-1 text-xs text-muted-foreground leading-relaxed">
              <p>
                This action is destructive and irreversible. All your events, attendee rosters, gate turnstiles, and billing records will be permanently erased.
              </p>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-medium"
                >
                  {isDeletingAccount ? 'Deleting...' : 'Confirm Deletion'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
