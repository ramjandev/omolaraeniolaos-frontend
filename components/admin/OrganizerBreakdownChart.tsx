'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS: Record<string, string> = {
  Individual: '#6D3A1B',
  Agency: '#C87A2D',
  Venue: '#8F9094',
};

export interface OrganizerBreakdownItem {
  type: string;
  count: number;
  percentage: number;
}

export function OrganizerBreakdownChart({ items }: { items: OrganizerBreakdownItem[] }) {
  const data = items.map((item) => ({
    name: item.type,
    value: item.count,
    color: COLORS[item.type] || '#8F9094',
  }));
  const chartData = data.some((item) => item.value > 0)
    ? data
    : [{ name: 'None', value: 1, color: '#E7E5E4' }];

  return (
    <div className="flex flex-col items-center">
      <div className="w-48 h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              stroke="transparent"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full space-y-2 pt-4 border-t border-border/50 text-xs">
        {items.map((item) => (
          <div key={item.type} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: COLORS[item.type] || '#8F9094' }}
              />
              <span className="text-foreground">{item.type}</span>
            </div>
            <span className="font-semibold text-foreground">
              {item.count}{' '}
              <span className="text-[11px] font-normal text-muted-foreground">
                ({item.percentage}%)
              </span>
            </span>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-muted-foreground">No organizers yet.</p>
        )}
      </div>
    </div>
  );
}
