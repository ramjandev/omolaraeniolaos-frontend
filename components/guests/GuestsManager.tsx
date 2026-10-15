'use client';

import * as React from 'react';
import {
  Search,
  Download,
  UserPlus,
  Mail,
  CheckCircle,
  QrCode,
  MoreVertical,
  Filter,
} from 'lucide-react';
import { Attendee } from '@/types/events';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface GuestsManagerProps {
  initialAttendees: Attendee[];
}

export function GuestsManager({ initialAttendees }: GuestsManagerProps) {
  const [attendees, setAttendees] = React.useState<Attendee[]>(initialAttendees);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const filteredAttendees = React.useMemo(() => {
    return attendees.filter((item) => {
      const matchSearch =
        item.fullName.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.qrCode.toLowerCase().includes(search.toLowerCase()) ||
        item.ticketTierName.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [attendees, search, statusFilter]);

  const handleToggleCheckIn = (id: string) => {
    setAttendees((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'checked_in' ? 'attending' : 'checked_in';
          return {
            ...item,
            status: nextStatus,
            checkInTime: nextStatus === 'checked_in' ? new Date().toISOString() : undefined,
          };
        }
        return item;
      })
    );
  };

  const handleExportCSV = () => {
    const headers = 'ID,Name,Email,Event,Ticket,Status,QRCode\n';
    const rows = filteredAttendees
      .map(
        (a) =>
          `"${a.id}","${a.fullName}","${a.email}","${a.eventTitle}","${a.ticketTierName}","${a.status}","${a.qrCode}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `guest-list-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const totalCount = attendees.length;
  const checkedInCount = attendees.filter((a) => a.status === 'checked_in').length;

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, QR code, or pass type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center p-1 bg-muted/60 rounded-xl border border-border/60">
            {(['all', 'checked_in', 'attending'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all capitalize ${
                  statusFilter === st
                    ? 'bg-background text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {st === 'all' ? 'All' : st === 'checked_in' ? 'Checked In' : 'RSVP Only'}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="text-xs gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Guest Table Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="p-4 border-b border-border/80 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground">{filteredAttendees.length}</strong> of{' '}
            {totalCount} attendees
          </span>
          <span>
            <strong className="text-foreground">{checkedInCount}</strong> checked in
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground text-left font-medium uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Guest</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Pass Tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">QR Code Ref</th>
                <th className="py-3 px-4">Seat / Zone</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredAttendees.map((guest) => {
                const isCheckedIn = guest.status === 'checked_in';

                return (
                  <tr key={guest.id} className="hover:bg-muted/20 transition-colors">
                    {/* Guest info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 shrink-0 border border-border">
                          <AvatarImage src={guest.avatar} alt={guest.fullName} />
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                            {guest.fullName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{guest.fullName}</p>
                          <p className="text-muted-foreground text-[11px]">{guest.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Event name */}
                    <td className="py-3.5 px-4 text-muted-foreground max-w-[180px] truncate">
                      {guest.eventTitle}
                    </td>

                    {/* Pass tier */}
                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {guest.ticketTierName}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={guest.status} />
                    </td>

                    {/* QR Code */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-primary" />
                        {guest.qrCode}
                      </span>
                    </td>

                    {/* Table / Seat */}
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {guest.tableOrSeat || 'General'}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant={isCheckedIn ? 'secondary' : 'default'}
                          onClick={() => handleToggleCheckIn(guest.id)}
                          className="h-7 text-[11px] px-2.5"
                        >
                          {isCheckedIn ? 'Undo' : 'Check In'}
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem onClick={() => alert(`Resent ticket pass to ${guest.email}`)}>
                              Resend Ticket Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => alert(`Viewing QR badge for ${guest.fullName}`)}>
                              View Digital Badge
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAttendees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm font-medium text-foreground">No attendees found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try searching with a different name or email address.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
