'use client';

import * as React from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Check } from 'lucide-react';

export default function AdminSettingsPage() {
  const [liveMode, setLiveMode] = React.useState(true);
  const [featureFlags, setFeatureFlags] = React.useState({
    voiceRsvp: true,
    offlineCheckin: true,
    multilingualDispatch: false,
    seatingCoordinator: true,
    aiFollowup: false,
    securityFraudAlerts: true,
  });

  return (
    <AppShell currentRole="admin">
      <div className="space-y-6">
        {/* Header matching Event Details Page-4.png */}
        <div className="space-y-1">
          <h1 className="text-2xl font-serif font-semibold tracking-tight text-foreground">
            Platform Settings
          </h1>
          <p className="text-xs text-muted-foreground">
            System-wide configuration · changes take effect immediately
          </p>
        </div>

        {/* 6 Settings Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card 1: WhatsApp Business API */}
          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">WhatsApp Business API</CardTitle>
              <CardDescription className="text-xs">
                Provider connection, API credentials, and webhook health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">Provider</p>
                  <p className="text-xs text-muted-foreground">Meta Cloud API · production</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/80 bg-background text-xs font-medium text-foreground">
                  <Check className="w-3.5 h-3.5 text-foreground" />
                  <span>Connected</span>
                </div>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">API Key</p>
                  <p className="text-xs text-muted-foreground font-mono">wh_live_••••••••••••3f9a</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/80 bg-background text-xs font-medium text-foreground">
                  <Check className="w-3.5 h-3.5 text-foreground" />
                  <span>Connected</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">Webhook</p>
                  <p className="text-xs text-muted-foreground font-mono">https://api.mcenies.ng/webhook/whatsapp</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/80 bg-background text-xs font-medium text-foreground">
                  <Check className="w-3.5 h-3.5 text-foreground" />
                  <span>Connected</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: AI / Speech Provider */}
          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">AI / Speech Provider</CardTitle>
              <CardDescription className="text-xs">
                Voice RSVP speech-to-text service configuration and connection status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">Provider</p>
                  <p className="text-xs text-muted-foreground">Google Cloud Speech-to-Text · v2</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/80 bg-background text-xs font-medium text-foreground">
                  <Check className="w-3.5 h-3.5 text-foreground" />
                  <span>Connected</span>
                </div>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">Credentials</p>
                  <p className="text-xs text-muted-foreground font-mono">service_account_•••••••••••••.json</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/80 bg-background text-xs font-medium text-foreground">
                  <Check className="w-3.5 h-3.5 text-foreground" />
                  <span>Connected</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">Supported Languages</p>
                  <p className="text-xs text-muted-foreground">English, Yoruba, Igbo, Hausa, Pidgin</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/80 bg-background text-xs font-medium text-foreground">
                  <Check className="w-3.5 h-3.5 text-foreground" />
                  <span>Connected</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Payment Gateway */}
          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Payment Gateway</CardTitle>
              <CardDescription className="text-xs">
                Flutterwave configuration and test/live mode toggle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">Provider</p>
                  <p className="text-xs text-muted-foreground">Flutterwave · Live mode</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/80 bg-background text-xs font-medium text-foreground">
                  <Check className="w-3.5 h-3.5 text-foreground" />
                  <span>Connected</span>
                </div>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">API Key</p>
                  <p className="text-xs text-muted-foreground font-mono">wh_live_••••••••••••3f9a</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/80 bg-background text-xs font-medium text-foreground">
                  <Check className="w-3.5 h-3.5 text-foreground" />
                  <span>Connected</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">Live Mode</p>
                  <p className="text-xs text-muted-foreground">Toggle between test and live payment processing</p>
                </div>
                <Switch
                  checked={liveMode}
                  onCheckedChange={setLiveMode}
                  className="data-[state=checked]:bg-[#6D3A1B]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Feature Flags */}
          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Feature Flags</CardTitle>
              <CardDescription className="text-xs">
                Enable or disable platform-wide features globally
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-1">
              <div className="flex items-center justify-between pb-2.5 border-b border-border/40">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">Voice RSVP</p>
                  <p className="text-xs text-muted-foreground">Allow guests to respond via voice note</p>
                </div>
                <Switch
                  checked={featureFlags.voiceRsvp}
                  onCheckedChange={(val) => setFeatureFlags({ ...featureFlags, voiceRsvp: val })}
                  className="data-[state=checked]:bg-[#6D3A1B]"
                />
              </div>

              <div className="flex items-center justify-between pb-2.5 border-b border-border/40">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">Offline Check-in</p>
                  <p className="text-xs text-muted-foreground">Gate management works without internet connection</p>
                </div>
                <Switch
                  checked={featureFlags.offlineCheckin}
                  onCheckedChange={(val) => setFeatureFlags({ ...featureFlags, offlineCheckin: val })}
                  className="data-[state=checked]:bg-[#6D3A1B]"
                />
              </div>

              <div className="flex items-center justify-between pb-2.5 border-b border-border/40">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">Multilingual Dispatch</p>
                  <p className="text-xs text-muted-foreground">WhatsApp messages sent in the guest&apos;s language</p>
                </div>
                <Switch
                  checked={featureFlags.multilingualDispatch}
                  onCheckedChange={(val) => setFeatureFlags({ ...featureFlags, multilingualDispatch: val })}
                  className="data-[state=checked]:bg-[#6D3A1B]"
                />
              </div>

              <div className="flex items-center justify-between pb-2.5 border-b border-border/40">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">Seating Coordinator</p>
                  <p className="text-xs text-muted-foreground">Table & seating arrangement module</p>
                </div>
                <Switch
                  checked={featureFlags.seatingCoordinator}
                  onCheckedChange={(val) => setFeatureFlags({ ...featureFlags, seatingCoordinator: val })}
                  className="data-[state=checked]:bg-[#6D3A1B]"
                />
              </div>

              <div className="flex items-center justify-between pb-2.5 border-b border-border/40">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">AI Follow-up Messages</p>
                  <p className="text-xs text-muted-foreground">Automated follow-up for pending RSVP responses</p>
                </div>
                <Switch
                  checked={featureFlags.aiFollowup}
                  onCheckedChange={(val) => setFeatureFlags({ ...featureFlags, aiFollowup: val })}
                  className="data-[state=checked]:bg-[#6D3A1B]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">Security Fraud Alerts</p>
                  <p className="text-xs text-muted-foreground">Real-time alert on suspicious gate scan patterns</p>
                </div>
                <Switch
                  checked={featureFlags.securityFraudAlerts}
                  onCheckedChange={(val) => setFeatureFlags({ ...featureFlags, securityFraudAlerts: val })}
                  className="data-[state=checked]:bg-[#6D3A1B]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Supported Languages */}
          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Supported Languages</CardTitle>
              <CardDescription className="text-xs">
                Manage active languages for guest-facing RSVP flows. Designed to support future language additions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              <div className="flex items-center justify-between pb-2.5 border-b border-border/40">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-foreground">English</p>
                  <p className="text-[11px] text-muted-foreground">Platform default</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-border/80 bg-background text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between pb-2.5 border-b border-border/40">
                <p className="text-xs font-semibold text-foreground">Yoruba</p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-border/80 bg-background text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between pb-2.5 border-b border-border/40">
                <p className="text-xs font-semibold text-foreground">Igbo</p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-border/80 bg-background text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between pb-2.5 border-b border-border/40">
                <p className="text-xs font-semibold text-foreground">Hausa</p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-border/80 bg-background text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">Nigerian Pidgin</p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-border/80 bg-background text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 6: Default Plan Settings */}
          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Default Plan Settings</CardTitle>
              <CardDescription className="text-xs">
                Platform-wide defaults referenced when a new plan is created
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <span className="font-medium text-foreground">Default Billing Cycle</span>
                <span className="font-semibold text-foreground">Per-event</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <span className="font-medium text-foreground">Default Currency</span>
                <span className="font-semibold text-foreground">NGN (₦)</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <span className="font-medium text-foreground">Trial Period</span>
                <span className="font-semibold text-foreground">None</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Invoice Email</span>
                <span className="font-semibold text-[#6D3A1B] dark:text-[#D4A373]">
                  billing@mcenies.ng
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
