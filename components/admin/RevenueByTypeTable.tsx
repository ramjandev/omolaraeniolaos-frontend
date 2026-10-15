'use client';

import * as React from 'react';
import { User, Building2, Landmark } from 'lucide-react';

export function RevenueByTypeTable() {
  const [selectedRow, setSelectedRow] = React.useState<'individual' | 'agency' | 'venue'>('individual');

  const rows = [
    {
      id: 'individual' as const,
      name: 'Individual',
      icon: User,
      organizers: 94,
      revenue: '₦2.1M',
      billingModel: 'Per-event',
      mom: '+12%',
    },
    {
      id: 'agency' as const,
      name: 'Agency',
      icon: Building2,
      organizers: 31,
      revenue: '₦1.6M',
      billingModel: 'Subscription',
      mom: '+12%',
    },
    {
      id: 'venue' as const,
      name: 'Venue',
      icon: Landmark,
      organizers: 13,
      revenue: '₦0.5M',
      billingModel: 'Subscription',
      mom: '+12%',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Table Data Tag / Tab */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#0284c7] text-white">
          <span className="w-1.5 h-1.5 bg-white rounded-xs" />
          Table Data
        </span>
      </div>

      {/* Table */}
      <div className="border border-border/80 rounded-xl overflow-hidden bg-card">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 border-b border-border text-muted-foreground text-left font-medium">
            <tr>
              <th className="py-2.5 px-3 font-normal" />
              <th className="py-2.5 px-3 font-normal text-muted-foreground">Organizers</th>
              <th className="py-2.5 px-3 font-normal text-muted-foreground">Revenue</th>
              <th className="py-2.5 px-3 font-normal text-muted-foreground">Billing Model</th>
              <th className="py-2.5 px-3 font-normal text-muted-foreground">MoM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((row) => {
              const isSelected = selectedRow === row.id;
              const Icon = row.icon;

              return (
                <tr
                  key={row.id}
                  onClick={() => setSelectedRow(row.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-sky-50/50 dark:bg-sky-950/20'
                      : 'hover:bg-muted/20'
                  }`}
                >
                  <td className="py-3 px-3">
                    <div
                      className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${
                        isSelected
                          ? 'border-[#0284c7] bg-white dark:bg-zinc-900 shadow-2xs font-semibold'
                          : 'border-transparent text-foreground'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{row.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">{row.organizers}</td>
                  <td className="py-3 px-3 font-semibold text-foreground">{row.revenue}</td>
                  <td className="py-3 px-3 text-muted-foreground">{row.billingModel}</td>
                  <td className="py-3 px-3 font-semibold text-emerald-600">{row.mom}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Bottom Total Summary Strip */}
        <div className="p-3 bg-muted/30 border-t border-border flex items-center gap-6 text-xs text-muted-foreground">
          <span>
            Total organizer: <strong className="text-foreground font-semibold">138</strong>
          </span>
          <span>
            Total Revenue: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">₦4.2M</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
