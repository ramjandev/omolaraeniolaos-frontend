'use client';

import * as React from 'react';
import { User, Building2, Landmark } from 'lucide-react';
import { formatNaira, type RevenueByType } from '@/lib/api/admin-dashboard';

const ICONS = {
  Individual: User,
  Agency: Building2,
  Venue: Landmark,
};

export function RevenueByTypeTable({ revenue }: { revenue: RevenueByType | null }) {
  const rows = revenue?.rows || [];
  const [selectedType, setSelectedType] = React.useState('Individual');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#0284c7] text-white">
          <span className="w-1.5 h-1.5 bg-white rounded-xs" />
          Table Data
        </span>
      </div>

      <div className="border border-border/80 rounded-xl overflow-hidden bg-card">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 border-b border-border text-muted-foreground text-left font-medium">
            <tr>
              <th className="py-2.5 px-3 font-normal" />
              <th className="py-2.5 px-3 font-normal text-muted-foreground">Organizers</th>
              <th className="py-2.5 px-3 font-normal text-muted-foreground">Revenue</th>
              <th className="py-2.5 px-3 font-normal text-muted-foreground">Billing Model</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((row) => {
              const isSelected = selectedType === row.type;
              const Icon = ICONS[row.type as keyof typeof ICONS] || User;
              return (
                <tr
                  key={row.type}
                  onClick={() => setSelectedType(row.type)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-sky-50/50 dark:bg-sky-950/20' : 'hover:bg-muted/20'
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
                      <span>{row.type}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">{row.organizersCount}</td>
                  <td className="py-3 px-3 font-semibold text-foreground">
                    {formatNaira(row.revenueAmount)}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">{row.billingModel}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 px-3 text-center text-muted-foreground">
                  Revenue has not been recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="p-3 bg-muted/30 border-t border-border flex items-center gap-6 text-xs text-muted-foreground">
          <span>
            Total organizer:{' '}
            <strong className="text-foreground font-semibold">{revenue?.totalOrganizers ?? 0}</strong>
          </span>
          <span>
            Total Revenue:{' '}
            <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
              {formatNaira(revenue?.totalRevenue ?? 0)}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
