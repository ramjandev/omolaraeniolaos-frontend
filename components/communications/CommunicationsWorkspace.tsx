'use client';

import * as React from 'react';
import {
  Mail,
  MessageSquare,
  Send,
  Users,
  CheckCircle,
  Clock,
  Sparkles,
  BarChart,
  Calendar,
} from 'lucide-react';
import { GuestCommunication } from '@/types/events';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface CommunicationsWorkspaceProps {
  initialCampaigns: GuestCommunication[];
}

export function CommunicationsWorkspace({ initialCampaigns }: CommunicationsWorkspaceProps) {
  const [campaigns, setCampaigns] = React.useState<GuestCommunication[]>(initialCampaigns);
  const [channel, setChannel] = React.useState<'email' | 'sms'>('email');
  const [targetSegment, setTargetSegment] = React.useState('all');
  const [subject, setSubject] = React.useState('');
  const [messageBody, setMessageBody] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [sentAlert, setSentAlert] = React.useState(false);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject && channel === 'email') return;
    if (!messageBody) return;

    setIsSending(true);

    setTimeout(() => {
      const newCampaign: GuestCommunication = {
        id: `comm-${Date.now()}`,
        eventId: 'ev-101',
        eventTitle: 'Future Tech Summit 2026',
        subject: subject || 'Event Update Announcement',
        preview: messageBody.slice(0, 60) + '...',
        channel,
        sentAt: new Date().toISOString(),
        recipientsCount: targetSegment === 'vip' ? 128 : 948,
        openRate: 0,
        clickRate: 0,
        status: 'sent',
      };

      setCampaigns([newCampaign, ...campaigns]);
      setIsSending(false);
      setSentAlert(true);
      setSubject('');
      setMessageBody('');

      setTimeout(() => setSentAlert(false), 5000);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner if Just Sent */}
      {sentAlert && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Broadcast dispatched successfully!</strong> Sent to all queued delegates.
            </span>
          </div>
          <button onClick={() => setSentAlert(false)} className="text-emerald-600 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Composer & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Composer Left Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                <span>Compose Guest Broadcast</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Directly notify attendees via push channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendBroadcast} className="space-y-4">
                {/* Channel Selector */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Delivery Channel</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setChannel('email')}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                        channel === 'email'
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Digest</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel('sms')}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                        channel === 'sms'
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Instant SMS</span>
                    </button>
                  </div>
                </div>

                {/* Target Segment */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Target Audience</Label>
                  <Select value={targetSegment} onValueChange={setTargetSegment}>
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue placeholder="Audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Confirmed Attendees (948)</SelectItem>
                      <SelectItem value="vip">VIP Pass Holders Only (128)</SelectItem>
                      <SelectItem value="unverified">Unchecked-in Delegates (536)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject (for email) */}
                {channel === 'email' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email Subject Line *</Label>
                    <Input
                      placeholder="e.g. Schedule Update: Keynote starts at 9:30 AM"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="text-xs"
                      required
                    />
                  </div>
                )}

                {/* Message Body */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Broadcast Message Content *</Label>
                  <Textarea
                    rows={5}
                    placeholder="Type your message here. Tags like {{guest_name}} and {{venue_name}} will be personalized..."
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isSending}
                  className="w-full text-xs gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Transmitting Broadcast...' : 'Send Broadcast Now'}</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Campaign History Right Column */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Dispatched Broadcasts</h3>
            <p className="text-xs text-muted-foreground">
              Review delivery velocity, open rates, and engagement logs
            </p>
          </div>

          <div className="space-y-3">
            {campaigns.map((camp) => (
              <Card key={camp.id} className="border-border/80 shadow-xs">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                          {camp.channel}
                        </Badge>
                        <span className="text-xs font-medium text-muted-foreground">
                          {camp.eventTitle}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-foreground truncate">
                        {camp.subject}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {camp.preview}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-foreground block">
                        {camp.recipientsCount} Recipients
                      </span>
                      <span className="text-[11px] text-muted-foreground block">
                        {new Date(camp.sentAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {camp.channel === 'email' && (
                    <div className="flex items-center gap-6 pt-2 border-t border-border/60 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <BarChart className="w-3.5 h-3.5 text-primary" />
                        <span>Open Rate:</span>
                        <strong className="text-foreground">{camp.openRate}%</strong>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Click Rate:</span>
                        <strong className="text-foreground">{camp.clickRate}%</strong>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
