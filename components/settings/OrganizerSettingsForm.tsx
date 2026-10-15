'use client';

import * as React from 'react';
import {
  User,
  Bell,
  Lock,
  Shield,
  Check,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ShieldCheck,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export function OrganizerSettingsForm() {
  const [activeTab, setActiveTab] = React.useState<'profile' | 'notifications' | 'security'>('profile');
  const [isSaved, setIsSaved] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);

  // Profile State
  const [name, setName] = React.useState('Folashade Adeyemi');
  const [email, setEmail] = React.useState('folashade@mcenies.com');
  const [phone, setPhone] = React.useState('+234 803 456 7890');

  // Notifications State
  const [notifications, setNotifications] = React.useState({
    rsvpUpdates: true,
    guestReminders: true,
    eventUpdates: true,
    billingNotifications: false,
  });

  // Security State
  const [twoFactor, setTwoFactor] = React.useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage('Personal profile information saved successfully!');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage('Notification preferences updated!');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Toast Confirmation */}
      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>
            <strong>Success!</strong> {saveMessage}
          </span>
        </div>
      )}

      {/* Tabs navigation matching settings-page.png */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'profile'
              ? 'bg-[#6E3B1C] text-white shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'notifications'
              ? 'bg-[#6E3B1C] text-white shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'security'
              ? 'bg-[#6E3B1C] text-white shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          Security
        </button>
      </div>

      {/* Section 1: Personal Information matching settings-page.png */}
      {(activeTab === 'profile' || true) && (
        <Card className="border-border shadow-xs bg-card rounded-2xl">
          <CardHeader className="p-6 border-b border-border">
            <CardTitle className="text-base font-serif font-bold text-foreground">
              Personal Information
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Update your photo, name, and operational contact details.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Profile Photo */}
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-2 border-[#6E3B1C]/20 shadow-xs">
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                    alt="Omolara Eniola"
                  />
                  <AvatarFallback className="bg-[#6E3B1C]/10 text-[#6E3B1C] font-bold">
                    OE
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button size="sm" variant="outline" type="button" className="text-xs rounded-xl h-8">
                    Change Avatar
                  </Button>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    JPG, GIF or PNG. Max size 2MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Full Name *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-xs h-9 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Email Address *</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-xs h-9 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Phone Number</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-xs h-9 rounded-xl max-w-sm"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="bg-[#6E3B1C] hover:bg-[#834621] text-white text-xs h-9 px-5 rounded-xl shadow-xs"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Section 2: Notification Preferences matching settings-page.png */}
      {(activeTab === 'notifications' || true) && (
        <Card className="border-border shadow-xs bg-card rounded-2xl">
          <CardHeader className="p-6 border-b border-border">
            <CardTitle className="text-base font-serif font-bold text-foreground">
              Notification Preferences
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Choose what notifications you want to receive and how.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <form onSubmit={handleSaveNotifications} className="space-y-5">
              {/* RSVP Updates */}
              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">RSVP Updates</p>
                  <p className="text-[11px] text-muted-foreground">
                    Get notified immediately when a guest accepts, declines, or updates their response
                  </p>
                </div>
                <Switch
                  checked={notifications.rsvpUpdates}
                  onCheckedChange={(val) =>
                    setNotifications({ ...notifications, rsvpUpdates: val })
                  }
                />
              </div>

              {/* Guest Reminders */}
              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">Guest Reminders</p>
                  <p className="text-[11px] text-muted-foreground">
                    Alerts when automated reminder batches are scheduled or dispatched
                  </p>
                </div>
                <Switch
                  checked={notifications.guestReminders}
                  onCheckedChange={(val) =>
                    setNotifications({ ...notifications, guestReminders: val })
                  }
                />
              </div>

              {/* Event Updates */}
              <div className="flex items-center justify-between py-2 border-b border-border/60">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">Event Updates</p>
                  <p className="text-[11px] text-muted-foreground">
                    Critical alerts regarding venue, gate scanner sync, and schedule changes
                  </p>
                </div>
                <Switch
                  checked={notifications.eventUpdates}
                  onCheckedChange={(val) =>
                    setNotifications({ ...notifications, eventUpdates: val })
                  }
                />
              </div>

              {/* Billing Notifications */}
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">Billing Notifications</p>
                  <p className="text-[11px] text-muted-foreground">
                    Invoices, package activations, and payment receipts
                  </p>
                </div>
                <Switch
                  checked={notifications.billingNotifications}
                  onCheckedChange={(val) =>
                    setNotifications({ ...notifications, billingNotifications: val })
                  }
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="bg-[#6E3B1C] hover:bg-[#834621] text-white text-xs h-9 px-5 rounded-xl shadow-xs"
                >
                  Save Preferences
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Section 3: Account Security matching settings-page.png */}
      {(activeTab === 'security' || true) && (
        <Card className="border-border shadow-xs bg-card rounded-2xl">
          <CardHeader className="p-6 border-b border-border">
            <CardTitle className="text-base font-serif font-bold text-foreground">
              Account Security
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Manage your credentials, 2-factor authentication, and account access.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Password Item */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
              <div>
                <p className="text-xs font-semibold text-foreground">Password</p>
                <p className="text-[11px] text-muted-foreground">Last changed 3 months ago</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPasswordModalOpen(true)}
                className="text-xs rounded-xl h-8"
              >
                Change Password
              </Button>
            </div>

            {/* Email Verification */}
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div>
                <p className="text-xs font-semibold text-foreground">Email Verification</p>
                <p className="text-[11px] text-muted-foreground">
                  Your primary address <strong>{email}</strong> is verified
                </p>
              </div>
              <Badge
                variant="secondary"
                className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full"
              >
                <Check className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>

            {/* 2FA */}
            <div className="flex items-center justify-between pb-6 border-b border-border/60">
              <div>
                <p className="text-xs font-semibold text-foreground">Two-Factor Authentication (2FA)</p>
                <p className="text-[11px] text-muted-foreground">
                  Add an extra layer of security to your organizer account via authenticator app
                </p>
              </div>
              <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
            </div>

            {/* Danger Zone: Delete Account matching settings-page.png */}
            <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300">
                  Delete Account
                </h4>
                <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5 leading-relaxed">
                  Permanently delete your account and all associated events, guest rosters, and scan history. This action cannot be undone.
                </p>
              </div>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                className="text-xs rounded-xl h-8 shadow-xs"
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Change Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Change Password</DialogTitle>
            <DialogDescription className="text-xs">
              Enter your current password and choose a strong new password.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Current Password</Label>
              <Input type="password" className="text-xs h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">New Password</Label>
              <Input type="password" className="text-xs h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Confirm New Password</Label>
              <Input type="password" className="text-xs h-9" />
            </div>

            <DialogFooter className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setSaveMessage('Password updated successfully!');
                  setIsSaved(true);
                  setTimeout(() => setIsSaved(false), 3000);
                }}
                className="bg-[#6E3B1C] hover:bg-[#834621] text-white text-xs"
              >
                Update Password
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Account Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg text-rose-600">Delete Account</DialogTitle>
            <DialogDescription className="text-xs">
              Are you absolutely sure? This will permanently delete your organizer profile, all events, attendee records, and ticket databases.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setIsDeleteModalOpen(false);
                alert('Account deletion initiated. Contact admin to finalize.');
              }}
              className="text-xs"
            >
              Confirm Account Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
