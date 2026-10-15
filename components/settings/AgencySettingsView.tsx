'use client';

import * as React from 'react';
import {
  User,
  Bell,
  Shield,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Mail,
  Phone,
  Building,
  Smartphone,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type SettingsTab = 'profile' | 'notifications' | 'security';

export function AgencySettingsView() {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>('profile');
  const [showSavedAlert, setShowSavedAlert] = React.useState(true);

  // Profile Form State matching settings-page.png
  const [fullName, setFullName] = React.useState('Folashade Adeyemi');
  const [agencyName, setAgencyName] = React.useState('Lumina Event Studio');
  const [email, setEmail] = React.useState('folashade@mcenies.com');
  const [phone, setPhone] = React.useState('+234 803 456 7890');

  // Notifications State
  const [rsvpUpdates, setRsvpUpdates] = React.useState(true);
  const [guestReminders, setGuestReminders] = React.useState(true);
  const [eventUpdates, setEventUpdates] = React.useState(true);
  const [billingNotifications, setBillingNotifications] = React.useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSavedAlert(true);
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSavedAlert(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title & Subtitle matching settings-page.png */}
      <div className="space-y-1">
        <h1 className="font-serif font-bold text-2xl md:text-3xl text-foreground">
          Settings
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          Manage your account and event preferences.
        </p>
      </div>

      {/* Tabs matching settings-page.png */}
      <div className="flex items-center gap-6 border-b border-border/80">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-xs font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'profile'
              ? 'text-[#6E3B1C]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Profile
          {activeTab === 'profile' && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#6E3B1C] rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 text-xs font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'notifications'
              ? 'text-[#6E3B1C]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Notifications
          {activeTab === 'notifications' && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#6E3B1C] rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`pb-3 text-xs font-semibold transition-colors relative cursor-pointer ${
            activeTab === 'security'
              ? 'text-[#6E3B1C]'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Security
          {activeTab === 'security' && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#6E3B1C] rounded-full" />
          )}
        </button>
      </div>

      {/* Success Alert Banner matching settings-page.png */}
      {showSavedAlert && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">Changes saved successfully</span>
          </div>
          <button
            type="button"
            onClick={() => setShowSavedAlert(false)}
            className="p-1 rounded-md text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tab 1: Profile Form */}
      {activeTab === 'profile' && (
        <Card className="rounded-2xl border-border/80 bg-card shadow-xs overflow-hidden">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="space-y-1">
              <h2 className="font-serif font-bold text-base text-foreground">
                Personal Information
              </h2>
              <p className="text-xs text-muted-foreground">
                Update your personal details and contact information.
              </p>
            </div>

            {/* Profile Avatar with Camera Button */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar className="w-20 h-20 rounded-2xl border-2 border-[#D4A373]/40">
                  <AvatarImage
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
                    alt={fullName}
                  />
                  <AvatarFallback className="text-lg font-bold bg-[#6E3B1C]/10 text-[#6E3B1C]">
                    FA
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#6E3B1C] text-white flex items-center justify-center shadow-md hover:bg-[#5C3117] transition-colors"
                  title="Change Avatar"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-sm text-foreground">{fullName}</p>
                <p className="text-xs text-muted-foreground">{email}</p>
                <p className="text-[11px] text-[#6E3B1C] font-medium pt-0.5">Agency Executive</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Full Name</Label>
                  <Input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Agency Name</Label>
                  <Input
                    required
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Email Address</Label>
                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Phone Number</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  className="h-10 px-6 text-xs font-semibold rounded-xl bg-[#6E3B1C] hover:bg-[#5C3117] text-white shadow-xs"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Notifications Preferences */}
      {activeTab === 'notifications' && (
        <Card className="rounded-2xl border-border/80 bg-card shadow-xs overflow-hidden">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="space-y-1">
              <h2 className="font-serif font-bold text-base text-foreground">
                Notification Preferences
              </h2>
              <p className="text-xs text-muted-foreground">
                Choose how and when you want to be notified.
              </p>
            </div>

            <form onSubmit={handleSaveNotifications} className="space-y-4 pt-2">
              <div className="divide-y divide-border/60">
                {/* RSVP Updates */}
                <div className="py-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">RSVP Updates</p>
                    <p className="text-[11px] text-muted-foreground">
                      Get notified when a guest accepts or declines
                    </p>
                  </div>
                  <Switch
                    checked={rsvpUpdates}
                    onCheckedChange={setRsvpUpdates}
                  />
                </div>

                {/* Guest Reminders */}
                <div className="py-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">Guest Reminders</p>
                    <p className="text-[11px] text-muted-foreground">
                      Automated reminders sent to pending guests
                    </p>
                  </div>
                  <Switch
                    checked={guestReminders}
                    onCheckedChange={setGuestReminders}
                  />
                </div>

                {/* Event Updates */}
                <div className="py-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">Event Updates</p>
                    <p className="text-[11px] text-muted-foreground">
                      Important updates about your event timeline
                    </p>
                  </div>
                  <Switch
                    checked={eventUpdates}
                    onCheckedChange={setEventUpdates}
                  />
                </div>

                {/* Billing Notifications */}
                <div className="py-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">Billing Notifications</p>
                    <p className="text-[11px] text-muted-foreground">
                      Invoices, receipts, and payment updates
                    </p>
                  </div>
                  <Switch
                    checked={billingNotifications}
                    onCheckedChange={setBillingNotifications}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  className="h-10 px-6 text-xs font-semibold rounded-xl bg-[#6E3B1C] hover:bg-[#5C3117] text-white shadow-xs"
                >
                  Save Preferences
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Security */}
      {activeTab === 'security' && (
        <Card className="rounded-2xl border-border/80 bg-card shadow-xs overflow-hidden">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="space-y-1">
              <h2 className="font-serif font-bold text-base text-foreground">
                Account Security
              </h2>
              <p className="text-xs text-muted-foreground">
                Manage your password and active sessions.
              </p>
            </div>

            <div className="divide-y divide-border/60 text-xs">
              {/* Password */}
              <div className="py-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">Password</p>
                  <p className="text-muted-foreground">Last changed 3 months ago</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs rounded-xl h-8">
                  Change Password
                </Button>
              </div>

              {/* Email Verification */}
              <div className="py-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">Email Verification</p>
                  <p className="text-muted-foreground">Your email address is verified</p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-300 dark:border-emerald-800 text-[10px] font-semibold">
                  Verified
                </Badge>
              </div>

              {/* Device Management */}
              <div className="py-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">Device Management</p>
                  <p className="text-muted-foreground">Currently active on 2 devices</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs rounded-xl h-8">
                  Log Out of All Other Devices
                </Button>
              </div>
            </div>

            {/* Danger Zone: Delete Account */}
            <div className="p-5 rounded-2xl border border-rose-300/60 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 space-y-3">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Delete Account</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <div className="pt-1">
                <Button
                  variant="destructive"
                  size="sm"
                  className="text-xs rounded-xl h-8"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
