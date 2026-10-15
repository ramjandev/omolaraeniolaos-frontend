'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type FilterStatus = 'all' | 'live' | 'published' | 'draft' | 'completed';

interface EventFilterTabsProps {
  activeStatus: FilterStatus;
  onChange: (status: FilterStatus) => void;
  counts: {
    all: number;
    live: number;
    published: number;
    draft: number;
    completed: number;
  };
}

export function EventFilterTabs({ activeStatus, onChange, counts }: EventFilterTabsProps) {
  const tabs: { id: FilterStatus; label: string }[] = [
    { id: 'all', label: 'All Events' },
    { id: 'live', label: 'Live' },
    { id: 'published', label: 'Published' },
    { id: 'draft', label: 'Drafts' },
    { id: 'completed', label: 'Past Events' },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/60 overflow-x-auto">
      {tabs.map((tab) => {
        const isSelected = activeStatus === tab.id;
        const count = counts[tab.id] ?? 0;

        return (
          <Button
            key={tab.id}
            variant={isSelected ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onChange(tab.id)}
            className={cn(
              'h-8 px-3 text-xs font-medium rounded-lg transition-all',
              isSelected ? 'shadow-xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                'ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-semibold',
                isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted-foreground/15 text-muted-foreground'
              )}
            >
              {count}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
