import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { EventBanner } from '@/components/events/shared/EventBanner';

export const metadata = {
  title: 'Dashboard | McEniesVite Individual Organizer',
  description: 'Manage your event preparation, guest lists, and RSVP interactions',
};

const SETUP_PROGRESS = 20;

const setupSteps = [
  {
    id: 1,
    title: 'Event Basic',
    completed: true,
    href: '/organizer/individual/events/create?step=basics',
  },
  {
    id: 2,
    title: 'Event Details',
    completed: false,
    href: '/organizer/individual/events/create?step=details',
  },
  {
    id: 3,
    title: 'Guests',
    completed: false,
    href: '/organizer/individual/events/create?step=guests',
  },
  {
    id: 4,
    title: 'Invitation',
    completed: false,
    href: '/organizer/individual/events/create?step=invitation',
  },
  {
    id: 5,
    title: 'Set up RSVP',
    completed: false,
    href: '/organizer/individual/events/create?step=experience',
  },
  {
    id: 6,
    title: 'Seating & protocol',
    completed: false,
    href: '/organizer/individual/events',
  },
];

export default function OrganizerIndividualDashboardPage() {
  return (
    <AppShell currentRole="organizer_individual">
      <div className="w-full space-y-6">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-normal tracking-tight text-[#1F140E] md:text-4xl dark:text-[#FBF8F5]">
            Good Morning, Folashade
          </h1>
          <p className="text-sm text-[#736B66] dark:text-muted-foreground">
            Let&apos;s get your event ready for your guests.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-12">
          <EventBanner
            className="lg:col-span-9"
            title="The Grand Royal Gala & Investiture"
            category="Gala"
            status="draft"
            meta={{ date: '24 October 2026', time: '12:00 pm', guests: 350 }}
            bottomRight={
              <Link
                href="/organizer/individual/events"
                className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-[#F3D9BC] bg-[#DDA877] px-4 py-2 text-xs font-semibold text-[#3B2414] shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_2px_6px_rgba(60,30,10,0.18)] transition-colors hover:bg-[#D19A68] sm:self-auto"
              >
                View Event
                <ArrowRight className="size-3.5" />
              </Link>
            }
          />

          <div className="flex flex-col items-center justify-between gap-5 rounded-2xl border border-[#E8E3DD] bg-[#F5F3F0] p-3 text-center shadow-xs lg:col-span-3 dark:border-border dark:bg-card">
            <div className="px-2 pt-3">
              <h3 className="mx-auto max-w-[180px] font-sans text-sm font-medium text-[#261710] dark:text-foreground">
                Your event is currently in draft
              </h3>
              <p className="mt-1.5 text-[11px] text-[#6F6560] dark:text-muted-foreground">
                Choose a plan to activate your event
              </p>
            </div>
            <Link
              href="/organizer/individual/billing"
              className="block w-full rounded-md bg-[#6B3416] py-2 text-[11px] font-semibold text-white shadow-xs transition-colors hover:bg-[#5A2B12]"
            >
              View plans
            </Link>
          </div>
        </div>

        <section className="space-y-3 rounded-2xl border border-[#EFE6D8] bg-[#FDFAF3] p-4 shadow-xs md:p-5 dark:border-border dark:bg-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-sans text-base font-medium text-[#261710] dark:text-foreground">
                Complete your event setup
              </h2>
              <p className="mt-0.5 text-xs text-[#6F6560] dark:text-muted-foreground">
                Finish the essentials before you start inviting your guests.
              </p>
            </div>
            <SetupProgress value={SETUP_PROGRESS} />
          </div>

          <ul className="divide-y divide-[#EDE5DA] dark:divide-border">
            {setupSteps.map((step) => (
              <li key={step.id} className="flex items-center justify-between py-2.5">
                {step.completed ? (
                  <>
                    <span className="flex items-center gap-2 rounded-full bg-[#2F5D3E] py-1.5 pl-1.5 pr-4 text-[11px] font-medium text-white shadow-[0_3px_8px_rgba(47,93,62,0.35)]">
                      <span className="flex size-5 items-center justify-center rounded-full bg-white text-[#2F5D3E]">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      {step.title}
                    </span>
                    <span className="text-xs font-medium text-[#2F5D3E]">Completed</span>
                  </>
                ) : (
                  <Link
                    href={step.href}
                    className="group flex w-full items-center justify-between"
                  >
                    <span className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-4 text-[11px] font-medium text-[#3F342D] shadow-[0_2px_6px_rgba(60,40,20,0.06)] dark:bg-muted dark:text-foreground">
                      <span className="flex size-5 items-center justify-center rounded-full bg-[#A39A92] text-[10px] font-semibold text-white">
                        {step.id}
                      </span>
                      {step.title}
                    </span>
                    <span className="flex h-6 w-9 items-center justify-center rounded-md border border-[#E3DCD3] bg-white text-[#3F342D] shadow-[0_2px_4px_rgba(60,40,20,0.08)] transition-colors group-hover:border-[#6B3416] group-hover:bg-[#6B3416] group-hover:text-white dark:border-border dark:bg-muted dark:text-foreground">
                      <ArrowRight className="size-3.5" />
                    </span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-6 rounded-2xl border border-[#E8E3DD] bg-[#F5F3F0] p-4 shadow-xs md:p-5 dark:border-border dark:bg-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-sans text-base font-medium text-[#261710] dark:text-foreground">
                Event activity
              </h2>
              <p className="mt-0.5 text-xs text-[#6F6560] dark:text-muted-foreground">
                Recent updates and live guest interactions
              </p>
            </div>
            <span className="rounded-md border border-[#F6D6BE] bg-[#FFF5EC] px-2 py-1 text-[11px] font-medium text-[#F0A877] dark:border-[#6E3B1C]/40 dark:bg-[#261710]/50 dark:text-[#D4A373]">
              Auto-updating
            </span>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4 pb-16 pt-6 text-center">
            <svg width="48" height="48" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <rect x="30" y="30" width="6" height="22" rx="1.5" fill="#F4B042" />
              <rect x="40" y="22" width="6" height="30" rx="1.5" fill="#5EBCDE" />
              <rect x="50" y="14" width="6" height="38" rx="1.5" fill="#3AA976" />
              <path d="M28 52H60" stroke="#D1C5B8" strokeWidth="2" strokeLinecap="round" />
              <path d="M30 26l10-8 8 4 10-10" stroke="#E5533D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="20" cy="26" r="11" stroke="#5B6B7A" strokeWidth="3" fill="#E8F4F8" />
              <path d="M12 34L4 44" stroke="#F48C42" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <p className="mx-auto max-w-lg font-serif text-lg font-normal leading-snug text-[#7A4A2E] md:text-xl dark:text-[#D4A373]">
              Your Event Activity Will Appear Here Once Guests
              <br />
              Start Responding And Your Event Goes Live.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function SetupProgress({ value }: { value: number }) {
  return (
    <div
      role="progressbar"
      aria-label="Event setup progress"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white p-[3px] shadow-[0_3px_8px_rgba(60,40,20,0.18)]"
    >
      <div
        className="flex size-full items-center justify-center rounded-full p-[2px]"
        style={{ background: `conic-gradient(#8E2A1B ${value}%, #F0E8DD 0)` }}
      >
        <span className="flex size-full items-center justify-center rounded-full bg-[#A3301F] text-[13px] font-bold text-white">
          {value}
        </span>
      </div>
    </div>
  );
}
