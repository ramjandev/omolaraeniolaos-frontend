'use client';

import * as React from 'react';
import {
  Plus,
  Copy,
  Trash2,
  CheckCheck,
  MessageSquare,
  Smartphone,
  Mail,
  Save,
  CheckCircle2,
} from 'lucide-react';
import type { OrganizerKind } from '@/lib/organizer';
import { getEventGuests, getIndividualEventById } from '@/lib/api/individual-events';
import {
  createMessageTemplate,
  deleteMessageTemplate,
  fillMessageTemplate,
  listMessageTemplates,
  templateChannelLabel,
  updateMessageTemplate,
  type MessageTemplate,
  type TemplateChannel,
} from '@/lib/messageTemplates';
import { EventBreadcrumb } from '@/components/events/shared/EventBreadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export function MessageTemplatesWorkspace({ organizer, eventId }: { organizer: OrganizerKind; eventId: string }) {
  const [templates, setTemplates] = React.useState<MessageTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState('');
  const [isSaved, setIsSaved] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [previewValues, setPreviewValues] = React.useState<Record<string, string>>({
    guest_name: 'Guest',
    event_name: 'your event',
    event_date: 'the event date',
    venue: 'the venue',
    table_number: 'Not assigned',
    rsvp_link: '',
  });

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const [editName, setEditName] = React.useState('');
  const [editChannel, setEditChannel] = React.useState<TemplateChannel>('WHATSAPP');
  const [editContent, setEditContent] = React.useState('');

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

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    void listMessageTemplates(eventId)
      .then((rows) => {
        if (cancelled) return;
        setTemplates(rows);
        setSelectedTemplateId((current) => (rows.some((row) => row.id === current) ? current : rows[0]?.id || ''));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Templates could not be loaded.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    void Promise.all([
      getIndividualEventById(eventId).catch(() => null),
      getEventGuests(eventId).catch(() => null),
    ]).then(([event, roster]) => {
      if (cancelled) return;
      const guest = roster?.guests?.[0];
      const when = [event?.event?.dateFormatted, event?.event?.timeFormatted].filter(Boolean).join(' · ');
      const venue = [event?.event?.venueName, event?.event?.city].filter(Boolean).join(', ');
      const link = guest
        ? `${window.location.origin}/guest?attendeeId=${guest.id}&eventId=${eventId}&qr=${encodeURIComponent(guest.qrCode || '')}`
        : `${window.location.origin}/guest?eventId=${eventId}`;
      setPreviewValues({
        guest_name: guest?.name || 'Guest',
        event_name: event?.event?.title || 'your event',
        event_date: when || 'the event date',
        venue: venue || 'the venue',
        table_number: guest?.tableSeat || 'Not assigned',
        rsvp_link: link,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  React.useEffect(() => {
    if (!selectedTemplate) return;
    setEditName(selectedTemplate.name);
    setEditChannel(selectedTemplate.channel);
    setEditContent(selectedTemplate.content);
  }, [selectedTemplate]);

  const handleSave = async () => {
    if (!selectedTemplate || saving) return;
    setSaving(true);
    setError('');
    try {
      const saved = await updateMessageTemplate(eventId, selectedTemplate.id, {
        name: editName.trim() || selectedTemplate.name,
        channel: editChannel,
        content: editContent.trim(),
      });
      setTemplates((current) => current.map((item) => (item.id === saved.id ? saved : item)));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The template could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (template: MessageTemplate) => {
    setError('');
    try {
      const copy = await createMessageTemplate(eventId, {
        name: `${template.name} (Copy)`,
        channel: template.channel,
        content: template.content,
      });
      setTemplates((current) => [...current, copy]);
      setSelectedTemplateId(copy.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The template could not be duplicated.');
    }
  };

  const handleDelete = async (template: MessageTemplate) => {
    setError('');
    try {
      await deleteMessageTemplate(eventId, template.id);
      setTemplates((current) => {
        const next = current.filter((item) => item.id !== template.id);
        setSelectedTemplateId((selected) => (selected === template.id ? next[0]?.id || '' : selected));
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The template could not be deleted.');
    }
  };

  const handleCreateNew = async () => {
    setError('');
    try {
      const fresh = await createMessageTemplate(eventId, {
        name: 'New Custom Message Template',
        channel: 'WHATSAPP',
        content: 'Hello {{guest_name}},\n\nType your custom announcement here.\n\nWarm regards,\n{{event_name}} Team',
      });
      setTemplates((current) => [...current, fresh]);
      setSelectedTemplateId(fresh.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The template could not be created.');
    }
  };

  const previewText = fillMessageTemplate(editContent, previewValues);

  return (
      <div className="space-y-6">
        <EventBreadcrumb organizer={organizer} eventId={eventId} current="Message Templates" />
        {isSaved && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Template saved.</strong> Use Template in a guest chat will insert this version.
            </span>
          </div>
        )}
        {error && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700">{error}</div>
        )}
        {loading && <p className="text-xs text-muted-foreground">Loading templates…</p>}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
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
                            {templateChannelLabel(tpl.channel)}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {tpl.content}
                        </p>
                        <span className="text-[10px] text-muted-foreground/70 block pt-1">
                          Updated {new Date(tpl.updatedAt).toLocaleDateString()}
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
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDelete(tpl);
                          }}
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
                    onClick={() => void handleSave()}
                    disabled={!selectedTemplate || saving}
                    className="bg-[#6E3B1C] hover:bg-[#834621] text-white text-xs gap-1.5 rounded-xl shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving…' : 'Save Template'}</span>
                  </Button>
                </div>

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
                        onClick={() => setEditChannel('WHATSAPP')}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                          editChannel === 'WHATSAPP'
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
                        onClick={() => setEditChannel('EMAIL')}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                          editChannel === 'EMAIL'
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
