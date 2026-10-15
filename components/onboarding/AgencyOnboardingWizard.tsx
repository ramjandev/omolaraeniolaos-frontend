'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Upload,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export function AgencyOnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState<number>(1);

  // Step 1: Agency Info matching event setup.png
  const [agencyName, setAgencyName] = React.useState('Lumina Event Studio');
  const [agencyType, setAgencyType] = React.useState('Event Planning & Production Agency');
  const [country, setCountry] = React.useState('Nigeria');
  const [city, setCity] = React.useState('Lagos');

  // Step 2: Work Scope matching event setup-1.png
  const [selectedEventTypes, setSelectedEventTypes] = React.useState<string[]>([
    'Weddings',
    'Corporate Events',
    'Conferences',
  ]);
  const [eventsPerYear, setEventsPerYear] = React.useState('21-50 / year');
  const [teamSize, setTeamSize] = React.useState('6-15 members');

  // Step 3: Team Roster matching event setup-2.png
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState('Event Planner');
  const [teamMembers, setTeamMembers] = React.useState([
    { email: 'alex@luminaevents.co', role: 'Event Planner' },
    { email: 'marcus@luminaevents.co', role: 'Coordinator' },
  ]);

  const toggleEventType = (type: string) => {
    setSelectedEventTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setTeamMembers([...teamMembers, { email: inviteEmail, role: inviteRole }]);
    setInviteEmail('');
  };

  const handleRemoveMember = (email: string) => {
    setTeamMembers(teamMembers.filter((m) => m.email !== email));
  };

  const handleFinish = () => {
    router.push('/organizer/agency');
  };

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      {/* Step Tracker Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider uppercase text-[#6E3B1C]">
          STEP {currentStep} OF 3
        </span>

        {currentStep === 2 && (
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Skip for now
          </button>
        )}
      </div>

      {/* STEP 1: Tell Us About Your Agency matching event setup.png */}
      {currentStep === 1 && (
        <Card className="rounded-3xl border-border/80 bg-card shadow-sm overflow-hidden">
          <CardContent className="p-6 md:p-10 space-y-8">
            <div className="space-y-1.5">
              <h1 className="font-serif font-bold text-2xl md:text-3xl text-foreground">
                Tell Us About Your Agency
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Set up your agency workspace to manage clients, events, and your team.
              </p>
            </div>

            <div className="space-y-5">
              {/* Agency Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Agency Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  required
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="e.g. Lumina Event Studio"
                  className="h-11 text-xs rounded-xl"
                />
              </div>

              {/* Agency Logo Upload */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Agency Logo (Optional)</Label>
                <div className="p-6 border-2 border-dashed border-border/80 rounded-2xl flex flex-col items-center justify-center gap-2 bg-muted/20 hover:border-[#6E3B1C] transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-[#6E3B1C]/10 text-[#6E3B1C] flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-foreground">
                    Upload agency logo or brand mark
                  </p>
                  <p className="text-[11px] text-muted-foreground">PNG, JPG, or SVG up to 5MB</p>
                </div>
              </div>

              {/* Agency Type */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Agency Type <span className="text-rose-500">*</span>
                </Label>
                <select
                  value={agencyType}
                  onChange={(e) => setAgencyType(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-border/80 bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#6E3B1C]/30 focus:border-[#6E3B1C]"
                >
                  <option value="Event Planning & Production Agency">
                    Event Planning &amp; Production Agency
                  </option>
                  <option value="Wedding Planning Boutique">Wedding Planning Boutique</option>
                  <option value="Corporate Brand Agency">Corporate Brand Agency</option>
                  <option value="Hospitality & Destination Concierge">
                    Hospitality &amp; Destination Concierge
                  </option>
                </select>
              </div>

              {/* Country & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Country</Label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-border/80 bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#6E3B1C]/30 focus:border-[#6E3B1C]"
                  >
                    <option value="Nigeria">Nigeria</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Ghana">Ghana</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">City</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lagos"
                    className="h-11 text-xs rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button
                asChild
                variant="outline"
                className="h-11 px-6 text-xs rounded-xl border-border/80"
              >
                <Link href="/organizer/agency">← Cancel</Link>
              </Button>
              <Button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="h-11 px-8 text-xs font-semibold rounded-xl bg-[#6E3B1C] hover:bg-[#5C3117] text-white shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: Tell Us About Your Work matching event setup-1.png */}
      {currentStep === 2 && (
        <Card className="rounded-3xl border-border/80 bg-card shadow-sm overflow-hidden">
          <CardContent className="p-6 md:p-10 space-y-8">
            <div className="space-y-1.5">
              <h1 className="font-serif font-bold text-2xl md:text-3xl text-foreground">
                Tell Us About Your Work
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Help us customize your workspace tools and client event templates.
              </p>
            </div>

            <div className="space-y-6">
              {/* Event Types Multi-select */}
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold">
                  What types of events do you organize? (Select all that apply)
                </Label>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    'Weddings',
                    'Birthdays',
                    'Corporate Events',
                    'Conferences',
                    'Private Parties',
                    'Social Gatherings',
                  ].map((cat) => {
                    const isSelected = selectedEventTypes.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleEventType(cat)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#6E3B1C] text-white shadow-xs'
                            : 'bg-muted/60 text-muted-foreground border border-border/80 hover:text-foreground'
                        }`}
                      >
                        <span>{cat}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Events Per Year Single-select */}
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold">
                  How many events do you produce per year?
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {['1-5 / year', '6-20 / year', '21-50 / year', '50+ / year'].map((yr) => {
                    const isSelected = eventsPerYear === yr;
                    return (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setEventsPerYear(yr)}
                        className={`py-3 px-3 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#6E3B1C] text-white shadow-xs'
                            : 'bg-muted/60 text-muted-foreground border border-border/80 hover:text-foreground'
                        }`}
                      >
                        {yr}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Team Size Single-select */}
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold">What is your team size?</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {['Just me', '2-5 members', '6-15 members', '16+ members'].map((sz) => {
                    const isSelected = teamSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setTeamSize(sz)}
                        className={`py-3 px-3 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#6E3B1C] text-white shadow-xs'
                            : 'bg-muted/60 text-muted-foreground border border-border/80 hover:text-foreground'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button
                type="button"
                onClick={() => setCurrentStep(1)}
                variant="outline"
                className="h-11 px-6 text-xs rounded-xl border-border/80"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span>Back</span>
              </Button>
              <Button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="h-11 px-8 text-xs font-semibold rounded-xl bg-[#6E3B1C] hover:bg-[#5C3117] text-white shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Build your agency team matching event setup-2.png */}
      {currentStep === 3 && (
        <Card className="rounded-3xl border-border/80 bg-card shadow-sm overflow-hidden">
          <CardContent className="p-6 md:p-10 space-y-8">
            <div className="space-y-1.5">
              <h1 className="font-serif font-bold text-2xl md:text-3xl text-foreground">
                Build your agency team
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Invite team members who will help manage clients, venues, and event execution.
              </p>
            </div>

            {/* Invite Form Row */}
            <form onSubmit={handleAddMember} className="space-y-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@agency.com"
                  className="h-11 text-xs rounded-xl flex-1"
                />

                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="h-11 px-3.5 rounded-xl border border-border/80 bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[#6E3B1C]/30 focus:border-[#6E3B1C] shrink-0"
                >
                  <option value="Event Planner">Event Planner</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Stage Manager">Stage Manager</option>
                  <option value="Operations Lead">Operations Lead</option>
                </select>

                <Button
                  type="submit"
                  className="h-11 px-5 text-xs font-semibold rounded-xl bg-[#6E3B1C] hover:bg-[#5C3117] text-white shrink-0"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>+ Add Member</span>
                </Button>
              </div>
            </form>

            {/* Pending Invitations Roster matching event setup-2.png */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Pending Invitations ({teamMembers.length})</span>
              </div>

              <div className="divide-y divide-border/60 border border-border/80 rounded-2xl overflow-hidden bg-card">
                {teamMembers.map((member) => (
                  <div
                    key={member.email}
                    className="p-3.5 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#6E3B1C]/10 text-[#6E3B1C] flex items-center justify-center font-bold text-xs">
                        {member.email.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{member.email}</p>
                        <p className="text-[11px] text-muted-foreground">{member.role}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.email)}
                      className="p-1.5 text-muted-foreground hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button
                type="button"
                onClick={() => setCurrentStep(2)}
                variant="outline"
                className="h-11 px-6 text-xs rounded-xl border-border/80"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span>Back</span>
              </Button>
              <Button
                type="button"
                onClick={handleFinish}
                className="h-11 px-8 text-xs font-semibold rounded-xl bg-[#6E3B1C] hover:bg-[#5C3117] text-white shadow-xs"
              >
                <span>Save &amp; Continue</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
