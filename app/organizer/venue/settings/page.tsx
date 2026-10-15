import * as React from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function VenueSettingsPage() {
  return (
    <AppShell
      currentRole="organizer_venue"
      title="Venue Institution Settings"
      subtitle="Property management profile, security gate contacts, and insurance documentation."
    >
      <div className="max-w-3xl space-y-6">
        <Card className="border-border/80 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Venue Partner Details</CardTitle>
            <CardDescription className="text-xs">Physical facilities specifications and access protocols</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Venue Property Name</Label>
              <Input defaultValue="Eko Grand Convention Center" className="text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Security Office Hotline</Label>
                <Input defaultValue="+234 802 000 1122" className="text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Max Compound Capacity</Label>
                <Input defaultValue="5000" type="number" className="text-xs" />
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <Button className="text-xs">Save Venue Profile</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
