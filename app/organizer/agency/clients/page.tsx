'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Plus,
  ArrowRight,
  Search,
} from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MOCK_AGENCY_CLIENTS, AgencyClient } from '@/lib/mock-data/agency';

export default function AgencyClientsPage() {
  const [clients, setClients] = React.useState<AgencyClient[]>(MOCK_AGENCY_CLIENTS);
  const [search, setSearch] = React.useState('');
  const [isAddClientOpen, setIsAddClientOpen] = React.useState(false);

  // New Client Form
  const [name, setName] = React.useState('');
  const [org, setOrg] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newClient: AgencyClient = {
      id: `cli-${Date.now()}`,
      name,
      type: `Individual client · ${org || 'Private'}`,
      organization: org || 'Private Client',
      industry: 'Events & Hospitality',
      contactPerson: name,
      contactEmail: email,
      contactPhone: phone || '+234 800 000 0000',
      clientSince: 'Today',
      activeEventsCount: 0,
      upcomingEventsCount: 0,
      completedEventsCount: 0,
      totalSpend: 0,
      currency: '₦',
      status: 'active',
      logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      events: [],
      activities: [],
    };

    setClients([newClient, ...clients]);
    setIsAddClientOpen(false);
    setName('');
    setOrg('');
    setEmail('');
    setPhone('');
  };

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.organization.toLowerCase().includes(search.toLowerCase()) ||
      c.contactEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell
      currentRole="organizer_agency"
      title="Client Accounts"
      subtitle="Corporate retainers, executive sponsors, and contracted client portfolios."
      primaryAction={{
        label: '+ Add Client',
        href: '#',
      }}
    >
      <div className="space-y-6">
        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients by name, organization..."
              className="pl-9 text-xs rounded-xl border-border/80"
            />
          </div>

          <Button
            onClick={() => setIsAddClientOpen(true)}
            className="bg-[#6E3B1C] hover:bg-[#5C3117] text-white text-xs rounded-xl h-9"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Client Account</span>
          </Button>
        </div>

        {/* Clients Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((client) => (
            <Card
              key={client.id}
              className="rounded-2xl border-border/80 bg-card shadow-xs hover:border-[#6E3B1C]/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 rounded-2xl border border-border">
                      <AvatarImage src={client.logo} alt={client.name} />
                      <AvatarFallback className="font-bold text-sm bg-[#6E3B1C]/10 text-[#6E3B1C]">
                        {client.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-base text-foreground">{client.name}</h4>
                      <p className="text-xs text-muted-foreground">{client.organization}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] capitalize ${
                      client.status === 'active'
                        ? 'text-emerald-600 border-emerald-300'
                        : 'text-amber-600 border-amber-300'
                    }`}
                  >
                    {client.status}
                  </Badge>
                </div>

                <div className="space-y-2 py-3 border-y border-border/60 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Contact:</span>
                    <span className="font-medium text-foreground">{client.contactEmail}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Active Events:</span>
                    <span className="font-bold text-[#6E3B1C]">{client.activeEventsCount}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Client Since:</span>
                    <span className="text-foreground">{client.clientSince}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    asChild
                    size="sm"
                    className="flex-1 text-xs bg-[#6E3B1C] hover:bg-[#5C3117] text-white rounded-xl h-8"
                  >
                    <Link href={`/organizer/agency/clients/${client.id}`}>
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs rounded-xl"
                  >
                    <Link href={`/organizer/agency/events/create?clientId=${client.id}`}>
                      + Event
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Client Modal */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-lg">Add Client Account</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a new corporate or individual client to your agency management roster.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddClient} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Client Full Name *</Label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amara Okafor"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Organization / Brand</Label>
              <Input
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder="e.g. Oak & Ivory"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email Address *</Label>
              <Input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="amara@oakandivory.com"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Phone Number</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 803 445 0198"
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddClientOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs bg-[#6E3B1C] hover:bg-[#5C3117] text-white"
              >
                Create Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
