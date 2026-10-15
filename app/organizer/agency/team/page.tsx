import * as React from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MOCK_AGENCY_TEAM } from '@/lib/mock-data/agency';

export default function AgencyTeamPage() {
  return (
    <AppShell
      currentRole="organizer_agency"
      title="Agency Production Team"
      subtitle="Producers, stage directors, and coordinators assigned to client accounts."
      primaryAction={{
        label: 'Invite Team Member',
        href: '/organizer/agency/team',
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_AGENCY_TEAM.map((member) => (
          <Card key={member.id} className="border-border/80 shadow-xs hover:border-border transition-all">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 border-2 border-primary/20">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                    {member.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-base text-foreground">{member.name}</h4>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                  <p className="text-[11px] text-muted-foreground">{member.email}</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border/60">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  Assigned Clients
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {member.assignedClients.map((clientName, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">
                      {clientName}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Active Status
                </span>
                <Button size="sm" variant="outline" className="h-7 text-xs">
                  Manage Access
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
