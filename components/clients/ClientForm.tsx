'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createAgencyClient,
  getAgencyClient,
  updateAgencyClient,
} from '@/lib/api/agency-dashboard';

const fieldClass =
  'h-11 rounded-lg border-[#E7E1DA] bg-[#FBF8F5] text-sm placeholder:text-[#B3A79C]';

export function ClientForm({ clientId }: { clientId?: string }) {
  const router = useRouter();
  const editing = Boolean(clientId);
  const [loading, setLoading] = React.useState(editing);
  const [saving, setSaving] = React.useState<'client' | 'event' | null>(null);
  const [form, setForm] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    notes: '',
  });

  React.useEffect(() => {
    if (!clientId) return;
    let active = true;
    getAgencyClient(clientId)
      .then((client) => {
        if (!active) return;
        const parts = client.name.trim().split(/\s+/);
        setForm({
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' '),
          email: client.contactEmail || '',
          phone: client.contactPhone || '',
          organization: client.industry || '',
          notes: client.notes || '',
        });
      })
      .catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : 'Client could not be loaded');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [clientId]);

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const save = async (next: 'list' | 'event') => {
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim();
    if (firstName.length < 2) {
      toast.error('Enter the first name');
      return;
    }
    if (!lastName) {
      toast.error('Enter the last name');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Enter a valid email address');
      return;
    }
    const payload = {
      name: `${firstName} ${lastName}`,
      contactEmail: email,
      contactPhone: form.phone.trim(),
      industry: form.organization.trim(),
      notes: form.notes.trim(),
    };
    setSaving(next === 'event' ? 'event' : 'client');
    try {
      const saved = clientId
        ? await updateAgencyClient(clientId, payload)
        : await createAgencyClient(payload);
      toast.success(clientId ? 'Client updated' : 'Client saved');
      if (next === 'event') {
        router.push(`/organizer/agency/events/create?new=1&clientId=${saved.id}`);
      } else {
        router.push('/organizer/agency/clients');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Client could not be saved');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm">
        <Link href="/organizer/agency/clients" className="text-[#6E3B1C] hover:underline">
          Clients
        </Link>
        <span className="mx-2 text-[#C4A574]">/</span>
        <span className="text-[#C4A574]">{editing ? 'Edit Client' : 'Add Client'}</span>
      </p>

      <section className="rounded-2xl border border-[#EBE3D9] bg-white p-6 sm:p-8">
        <h1 className="text-lg font-semibold text-[#1F140E]">
          {editing ? 'Edit Client' : 'Create New Client'}
        </h1>

        {loading ? (
          <p className="mt-6 text-sm text-[#736B66]">Loading client…</p>
        ) : (
          <form
            className="mt-6 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              void save('list');
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="First name">
                <Input
                  value={form.firstName}
                  onChange={set('firstName')}
                  placeholder="Enter first name"
                  className={fieldClass}
                />
              </Field>
              <Field label="Last name">
                <Input
                  value={form.lastName}
                  onChange={set('lastName')}
                  placeholder="Enter last name"
                  className={fieldClass}
                />
              </Field>
              <Field label="Email address">
                <Input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="name@example.com"
                  className={fieldClass}
                />
              </Field>
              <Field label="Phone number">
                <Input
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="+234"
                  className={fieldClass}
                />
              </Field>
            </div>
            <Field label="Organization (optional)">
              <Input
                value={form.organization}
                onChange={set('organization')}
                placeholder="Enter organization name"
                className={fieldClass}
              />
            </Field>
            <Field label="Notes (optional)">
              <Input
                value={form.notes}
                onChange={set('notes')}
                placeholder="Add context about this client"
                className={fieldClass}
              />
            </Field>

            <div className="flex flex-col gap-3 border-t border-[#F0EBE6] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => router.push('/organizer/agency/clients')}
                className="h-10 rounded-lg border border-[#E4DDD6] bg-white px-5 text-sm text-[#3F342C] hover:bg-[#FBF8F5]"
              >
                Cancel
              </button>
              <div className="flex flex-col gap-3 sm:flex-row">
                {!editing && (
                  <button
                    type="button"
                    disabled={saving !== null}
                    onClick={() => void save('event')}
                    className="h-10 rounded-lg bg-[#241710] px-5 text-sm font-medium text-white hover:bg-[#3A2A22] disabled:opacity-60"
                  >
                    {saving === 'event' ? 'Saving…' : 'Save & Create Event'}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving !== null}
                  className="h-10 rounded-lg bg-[#6E3B1C] px-5 text-sm font-medium text-white hover:bg-[#5C3117] disabled:opacity-60"
                >
                  {saving === 'client' ? 'Saving…' : 'Save Client'}
                </button>
              </div>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-[#1F140E]">{label}</Label>
      {children}
    </div>
  );
}
