'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface OrganizerBreakdownChartProps {
  data?: { name: string; value: number; color: string }[];
}

const DEFAULT_DATA = [
  { name: 'Individual', value: 98, color: '#6D3A1B' },
  { name: 'Agency', value: 31, color: '#C87A2D' },
  { name: 'Venue', value: 13, color: '#8F9094' },
];

export function OrganizerBreakdownChart({ data = DEFAULT_DATA }: OrganizerBreakdownChartProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-48 h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              stroke="transparent"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full space-y-2 pt-4 border-t border-border/50 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6D3A1B]" />
            <span className="text-foreground">Individual</span>
          </div>
          <span className="font-semibold text-foreground">
            98 <span className="text-[11px] font-normal text-muted-foreground">(69%)</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C87A2D]" />
            <span className="text-foreground">Agency</span>
          </div>
          <span className="font-semibold text-foreground">
            31 <span className="text-[11px] font-normal text-muted-foreground">(22%)</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8F9094]" />
            <span className="text-foreground">Venue</span>
          </div>
          <span className="font-semibold text-foreground">
            13 <span className="text-[11px] font-normal text-muted-foreground">(9%)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
