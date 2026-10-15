'use client';

import * as React from 'react';
import {
  Plus,
  Copy,
  CheckCheck,
  MessageSquare,
  Smartphone,
  Mail,
  Save,
  CheckCircle2,
} from 'lucide-react';
import type { OrganizerKind } from '@/lib/organizer';
import { EventBreadcrumb } from '@/components/events/shared/EventBreadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface MessageTemplate {
  id: string;
  name: string;
  channel: 'WhatsApp' | 'SMS' | 'Email';
  content: string;
  lastUpdated: string;
}

const INITIAL_TEMPLATES: MessageTemplate[] = [
  {
    id: 't-1',
    name: 'RSVP Reminder',
    channel: 'WhatsApp',
    content:
      'Good day {{guest_name}},\n\nWe look forward to having you join us for {{event_name}} on {{event_date}} at {{venue}}.\n\nKindly confirm your attendance by tapping the RSVP link below:\n{{rsvp_link}}\n\nWarm regards,\nThe Royal Gala Committee',
    lastUpdated: 'Oct 8, 2026',
  },
  {
    id: 't-2',
    name: 'Venue & Parking Directions',
    channel: 'WhatsApp',
    content:
      'Dear {{guest_name}},\n\nComplimentary VIP valet parking is available at {{venue}} starting from 5:30 PM.\n\nPlease show this pass at the North Gate entrance.\n\nSee you this evening!',
    lastUpdated: 'Oct 6, 2026',
  },
  {
    id: 't-3',
    name: 'Dress Code & Protocol Reminder',
    channel: 'WhatsApp',
    content:
      'Dear {{guest_name}},\n\nFriendly reminder regarding {{event_name}}:\nDress Code: Strictly Black Tie / Royal Traditional.\n\nYour allocated seating: {{table_number}}.\nDoors close promptly at 6:45 PM.',
    lastUpdated: 'Oct 4, 2026',
  },
  {
    id: 't-4',
    name: 'Gift Registry & Tribute Book',
    channel: 'WhatsApp',
    content:
      'Greetings {{guest_name}},\n\nShould you wish to contribute to the Royal Investiture tribute monograph or digital registry, please visit:\nhttps://mceniesvite.live/registry/royal-gala\n\nThank you for your generous thoughts.',
    lastUpdated: 'Oct 1, 2026',
  },
  {
    id: 't-5',
    name: 'Security & Access Protocol',
    channel: 'SMS',
    content:
      'GALA NOTICE: Due to high-profile state dignitaries, all delegates must present their verified digital QR gate pass at the entrance.',
    lastUpdated: 'Sep 28, 2026',
  },
];

export function MessageTemplatesWorkspace({ organizer, eventId }: { organizer: OrganizerKind; eventId: string }) {
  const [templates, setTemplates] = React.useState<MessageTemplate[]>(INITIAL_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>('t-1');
  const [isSaved, setIsSaved] = React.useState(false);

  const selectedTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const [editName, setEditName] = React.useState(selectedTemplate.name);
  const [editChannel, setEditChannel] = React.useState(selectedTemplate.channel);
  const [editContent, setEditContent] = React.useState(selectedTemplate.content);

  // When selected template changes
  React.useEffect(() => {
    if (selectedTemplate) {
      setEditName(selectedTemplate.name);
      setEditChannel(selectedTemplate.channel);
      setEditContent(selectedTemplate.content);
    }
  }, [selectedTemplate]);

  const handleInsertTag = (tag: string) => {
    setEditContent((prev) => `${prev} ${tag} `);
  };

  const handleSave = () => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === selectedTemplateId
          ? {
              ...t,
              name: editName,
              channel: editChannel,
              content: editContent,
              lastUpdated: 'Just now',
            }
          : t
      )
    );
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleDuplicate = (template: MessageTemplate) => {
    const copy: MessageTemplate = {
      id: `t-${Date.now()}`,
      name: `${template.name} (Copy)`,
      channel: template.channel,
      content: template.content,
      lastUpdated: 'Just now',
    };
    setTemplates([...templates, copy]);
    setSelectedTemplateId(copy.id);
  };

  const handleCreateNew = () => {
    const fresh: MessageTemplate = {
      id: `t-${Date.now()}`,
      name: 'New Custom Message Template',
      channel: 'WhatsApp',
      content: 'Hello {{guest_name}},\n\nType your custom announcement here.\n\nWarm regards,\n{{event_name}} Team',
      lastUpdated: 'Just now',
    };
    setTemplates([...templates, fresh]);
    setSelectedTemplateId(fresh.id);
  };

  // Preview replacement
  const previewText = editContent
    .replace(/{{guest_name}}/g, 'Dr. Babatunde Fashola')
    .replace(/{{event_name}}/g, 'The Grand Royal Gala & Investiture')
    .replace(/{{event_date}}/g, 'Saturday, October 24, 2026')
    .replace(/{{venue}}/g, 'The Civic Centre, Victoria Island')
    .replace(/{{table_number}}/g, 'High Table VIP-1')
    .replace(/{{rsvp_link}}/g, 'https://mceniesvite.live/rsvp/gala-2026/fashola');

  return (
      <div className="space-y-6">
        <EventBreadcrumb organizer={organizer} eventId={eventId} current="Message Templates" />
        {/* Save Confirmation Toast */}
        {isSaved && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Template updated successfully!</strong> Future communications will use this updated version.
            </span>
          </div>
        )}

        {/* Main 2-Column Split matching Figma */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Saved Message Templates */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-serif font-bold text-foreground">
                  Saved Message Templates
                </h2>
                <p className="text-xs text-muted-foreground">
                  {templates.length} automation templates ready
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleCreateNew}
                className="bg-[#6E3B1C] hover:bg-[#834621] text-white text-xs gap-1.5 rounded-xl shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Template</span>
              </Button>
            </div>

            <div className="space-y-3">
              {templates.map((tpl) => {
                const isActive = tpl.id === selectedTemplateId;

                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#6E3B1C]/5 border-[#6E3B1C] shadow-sm'
                        : 'bg-card border-border hover:border-border/80 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-xs text-foreground truncate">
                            {tpl.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 rounded bg-muted text-muted-foreground"
                          >
                            {tpl.channel}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {tpl.content}
                        </p>
                        <span className="text-[10px] text-muted-foreground/70 block pt-1">
                          Updated {tpl.lastUpdated}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(tpl);
                          }}
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Template Live Editor & WhatsApp Preview */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-border bg-card shadow-xs rounded-2xl">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground">
                      Template Live Editor
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Configure dynamic placeholders and channel formatting
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="bg-[#6E3B1C] hover:bg-[#834621] text-white text-xs gap-1.5 rounded-xl shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Template</span>
                  </Button>
                </div>

                {/* Template Name & Channel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Template Title</Label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-xs h-9 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Delivery Channel</Label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditChannel('WhatsApp')}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                          editChannel === 'WhatsApp'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-card text-muted-foreground border-border hover:bg-muted'
                        }`}
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-600 fill-current" />
                        <span>WhatsApp</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditChannel('SMS')}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                          editChannel === 'SMS'
                            ? 'bg-[#6E3B1C]/10 text-[#6E3B1C] border-[#6E3B1C]/40'
                            : 'bg-card text-muted-foreground border-border hover:bg-muted'
                        }`}
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>SMS</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditChannel('Email')}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                          editChannel === 'Email'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-card text-muted-foreground border-border hover:bg-muted'
                        }`}
                      >
                        <Mail className="w-3 h-3" />
                        <span>Email</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Personalization Tag Insert Pills */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Insert Personalization Tags</Label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      '{{guest_name}}',
                      '{{event_name}}',
                      '{{event_date}}',
                      '{{venue}}',
                      '{{table_number}}',
                      '{{rsvp_link}}',
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleInsertTag(tag)}
                        className="px-2.5 py-1 rounded-lg bg-muted hover:bg-[#6E3B1C]/10 hover:text-[#6E3B1C] text-muted-foreground text-[11px] font-mono border border-border transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Message Content</Label>
                    <span className="text-[10px] text-muted-foreground">
                      {editContent.length} characters
                    </span>
                  </div>
                  <Textarea
                    rows={6}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="text-xs font-sans leading-relaxed rounded-xl resize-none"
                  />
                </div>

                {/* Live Message Bubble Preview matching WhatsApp design */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Live Guest Phone Preview
                  </Label>
                  <div className="p-4 rounded-2xl bg-[#EFEAE2] dark:bg-[#111B21] border border-[#DDD5C8] dark:border-[#222E35]">
                    <div className="max-w-md bg-white dark:bg-[#202C33] rounded-2xl p-4 shadow-sm text-xs leading-relaxed text-slate-900 dark:text-white space-y-3">
                      <div className="whitespace-pre-line font-sans">{previewText}</div>
                      <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span>18:30</span>
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}
