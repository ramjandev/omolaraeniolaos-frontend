'use client';

import * as React from 'react';
import { Plus, Mail, Phone } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';

export default function VenueTeamPage() {
  const teamMembers = [
    {
      name: 'Adaeze Nwosu',
      role: 'Head of Venue Operations',
      email: 'adaeze@ekovenuemanagement.com',
      phone: '+234 803 112 3344',
      badge: 'Admin',
    },
    {
      name: 'Tunde Adeleke',
      role: 'Chief AV & Stage Engineer',
      email: 'tunde.a@ekovenuemanagement.com',
      phone: '+234 802 445 6677',
      badge: 'Technical Lead',
    },
    {
      name: 'Chioma Okonkwo',
      role: 'Client Hospitality & Bookings Manager',
      email: 'chioma.o@ekovenuemanagement.com',
      phone: '+234 809 556 7788',
      badge: 'Coordinator',
    },
    {
      name: 'Emeka Balogun',
      role: 'Gate Security & Facility Supervisor',
      email: 'emeka.b@ekovenuemanagement.com',
      phone: '+234 801 889 9900',
      badge: 'Security',
    },
  ];

  return (
    <AppShell currentRole="organizer_venue">
      <div className="space-y-6 w-full pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F140E] tracking-tight">
              Venue Team & Staff Management
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] mt-1 font-sans">
              Assign roles, control operational access, and dispatch facility staff.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1F140E] text-white hover:bg-[#342217] text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Invite Team Member</span>
          </button>
        </div>

        <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {teamMembers.map((member) => (
            <div
              key={member.email}
              className="w-full min-w-0 p-5 rounded-2xl bg-white border border-[#EFECE6] shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-full bg-[#FAF4EF] text-[#6E3B1C] font-bold text-sm flex items-center justify-center border border-[#F2E5D7]">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FAF4EF] text-[#6E3B1C]">
                    {member.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[#1F140E]">{member.name}</h3>
                  <p className="text-xs text-[#8C7A6B]">{member.role}</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-[#F4F1EB] text-xs text-[#71717A]">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-[#8C7A6B] shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#8C7A6B] shrink-0" />
                  <span>{member.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
