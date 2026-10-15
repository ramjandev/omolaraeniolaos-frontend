'use client';

import * as React from 'react';
import Link from 'next/link';
import { Settings, Eye, ChevronDown, ArrowUpDown } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface TransactionRecord {
  id: string;
  txId: string;
  date: string;
  organizer: string;
  organizerType: 'Agency' | 'Venue' | 'Individual';
  amount: string;
  status: 'Paid' | 'Failed' | 'Pending';
  plan: string;
}

const REVENUE_BREAKDOWN_DATA = [
  { month: 'Jan', amount: 23 },
  { month: 'Feb', amount: 40 },
  { month: 'Mar', amount: 23 },
  { month: 'Apr', amount: 40 },
  { month: 'May', amount: 35 },
  { month: 'Jun', amount: 45 },
  { month: 'Jul', amount: 33 },
  { month: 'Aug', amount: 38 },
  { month: 'Sep', amount: 33 },
  { month: 'Oct', amount: 45 },
  { month: 'Nov', amount: 35 },
  { month: 'Dec', amount: 42 },
];

const MOCK_TRANSACTIONS: TransactionRecord[] = [
  {
    id: '1',
    txId: 'TXN-8392A7B1',
    date: '15 Jan 2026',
    organizer: 'Premium Events Ng',
    organizerType: 'Agency',
    amount: '₦120,000',
    status: 'Paid',
    plan: 'Pro Subscription',
  },
  {
    id: '2',
    txId: 'TXN-4F7D2C9E',
    date: '15 Jan 2026',
    organizer: 'Royale Occasions',
    organizerType: 'Agency',
    amount: '₦120,000',
    status: 'Paid',
    plan: 'Essential Event Pass',
  },
  {
    id: '3',
    txId: 'TXN-1B8E5D3F',
    date: '15 Jan 2026',
    organizer: 'Eko Convention Ce...',
    organizerType: 'Venue',
    amount: '₦120,000',
    status: 'Failed',
    plan: 'Venue Subscription',
  },
  {
    id: '4',
    txId: 'TXN-7C9A4E2B',
    date: '15 Jan 2026',
    organizer: 'James Obi',
    organizerType: 'Individual',
    amount: '₦120,000',
    status: 'Failed',
    plan: 'Venue Subscription',
  },
  {
    id: '5',
    txId: 'TXN-5D3F8A1C',
    date: '15 Jan 2026',
    organizer: 'Premium Events Ng',
    organizerType: 'Agency',
    amount: '₦120,000',
    status: 'Paid',
    plan: 'Essential Event Pass',
  },
  {
    id: '6',
    txId: 'TXN-2E7B9D4F',
    date: '15 Jan 2026',
    organizer: 'Premium Events Ng',
    organizerType: 'Agency',
    amount: '₦120,000',
    status: 'Pending',
    plan: 'Venue Subscription',
  },
  {
    id: '7',
    txId: 'TXN-6A1C3F8E',
    date: '15 Jan 2026',
    organizer: 'Premium Events Ng',
    organizerType: 'Agency',
    amount: '₦120,000',
    status: 'Paid',
    plan: 'Grand Celebration Pass',
  },
  {
    id: '8',
    txId: 'TXN-9B4E7D2A',
    date: '15 Jan 2026',
    organizer: 'Premium Events Ng',
    organizerType: 'Agency',
    amount: '₦120,000',
    status: 'Paid',
    plan: 'Pro Subscription',
  },
  {
    id: '9',
    txId: 'TXN-3F8E1B5D',
    date: '15 Jan 2026',
    organizer: 'Premium Events Ng',
    organizerType: 'Agency',
    amount: '₦120,000',
    status: 'Paid',
    plan: 'Grand Celebration Pass',
  },
  {
    id: '10',
    txId: 'TXN-8D2B7C9A',
    date: '15 Jan 2026',
    organizer: 'Premium Events Ng',
    organizerType: 'Agency',
    amount: '₦120,000',
    status: 'Pending',
    plan: 'Essential Event Pass',
  },
];

export default function AdminRevenuePage() {
  const [statusFilter, setStatusFilter] = React.useState<'All' | 'Paid' | 'Failed' | 'Pending'>('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [periodFilter, setPeriodFilter] = React.useState('Yearly');

  const filteredTransactions = MOCK_TRANSACTIONS.filter((txn) => {
    if (statusFilter !== 'All' && txn.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        txn.txId.toLowerCase().includes(q) ||
        txn.organizer.toLowerCase().includes(q) ||
        txn.plan.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleToggleAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredTransactions.map((t) => t.id) : []);
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <AppShell currentRole="admin">
      <div className="space-y-6">
        {/* Header matching Event Details Page-6.png */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-serif font-semibold tracking-tight text-foreground">
              Revenue & Plans
            </h1>
            <p className="text-xs text-muted-foreground">
              Platform billing overview · September 2026
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs h-8.5 gap-1.5 border-border/80 text-foreground hover:bg-muted shrink-0"
          >
            <Link href="/admin/revenue/manage">
              <Settings className="w-3.5 h-3.5" />
              <span>Manage Plan</span>
            </Link>
          </Button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-[#6D3A1B] dark:text-[#D4A373] block">
                ₦4.2M
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Total Revenue</p>
              <p className="text-[11px] text-muted-foreground">September 2026</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-[#6D3A1B] dark:text-[#D4A373] block">
                +8%
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Month-on-Month Growth</p>
              <p className="text-[11px] text-muted-foreground">vs. August 2026</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-[#6D3A1B] dark:text-[#D4A373] block">
                6
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Available Plans</p>
              <p className="text-[11px] text-muted-foreground">Plans across all type of organizer</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-[#6D3A1B] dark:text-[#D4A373] block">
                44
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Active Subscriptions</p>
              <p className="text-[11px] text-muted-foreground">Agency + Venue plans</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown Bar Chart */}
        <Card className="border-border/80 shadow-2xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Revenue Breakdown</CardTitle>
              <div className="relative">
                <select
                  aria-label="Filter Breakdown Period"
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1 text-xs rounded-lg border border-border/80 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer"
                >
                  <option value="Yearly">Yearly</option>
                  <option value="Monthly">Monthly</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REVENUE_BREAKDOWN_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/50" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    domain={[0, 50]}
                    tickFormatter={(val) => `${val}k`}
                  />
                  <Tooltip
                    formatter={(val) => [`₦${val}k`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      borderColor: 'var(--border)',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="amount" fill="#4A2016" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Card & Table */}
        <div className="border border-border/80 rounded-2xl bg-card shadow-2xs overflow-hidden">
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60">
            <div>
              <h2 className="text-base font-semibold text-foreground">Transactions</h2>
              <p className="text-xs text-muted-foreground">
                Filterable by status · click a row for full detail
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter Buttons */}
              <div className="inline-flex items-center rounded-lg border border-border/80 p-0.5 bg-muted/30">
                {(['All', 'Paid', 'Failed', 'Pending'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      statusFilter === st
                        ? 'bg-background text-foreground shadow-2xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3.5 pr-12 py-1.5 text-xs rounded-lg border border-border/80 bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground bg-muted/60 border border-border/60">
                  ⌘ k
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground text-left font-medium">
                <tr>
                  <th className="py-3 px-3 w-10">
                    <Checkbox
                      checked={
                        selectedIds.length === filteredTransactions.length &&
                        filteredTransactions.length > 0
                      }
                      onCheckedChange={handleToggleAll}
                    />
                  </th>
                  <th className="py-3 px-3">Transaction ID</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Organizer</th>
                  <th className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      <span>Amount</span>
                      <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Plan / Description</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredTransactions.map((txn) => {
                  const isSelected = selectedIds.includes(txn.id);

                  return (
                    <tr
                      key={txn.id}
                      className={`hover:bg-muted/20 transition-colors ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleRow(txn.id)}
                        />
                      </td>
                      <td className="py-3 px-3 font-mono text-foreground font-medium">
                        {txn.txId}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{txn.date}</td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-foreground">{txn.organizer}</p>
                        <span className="text-[10px] text-amber-800 dark:text-amber-400 font-medium">
                          {txn.organizerType}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-foreground">
                        {txn.amount}
                      </td>
                      <td className="py-3 px-3">
                        {txn.status === 'Paid' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Paid
                          </span>
                        )}
                        {txn.status === 'Failed' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Failed
                          </span>
                        )}
                        {txn.status === 'Pending' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{txn.plan}</td>
                      <td className="py-3 px-3 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          <div className="px-4 py-3 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <select
                aria-label="Rows per page"
                className="bg-background border border-border/80 rounded-md px-2 py-1 text-xs text-foreground focus:outline-none"
                defaultValue="10"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="text-muted-foreground ml-2">showing 1–10 of 150 rows</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled
                className="h-8 px-3 text-xs text-muted-foreground disabled:opacity-40"
              >
                Previous
              </Button>
              <button
                type="button"
                className="h-8 w-8 rounded-md bg-[#6D3A1B] text-white text-xs font-semibold flex items-center justify-center shadow-xs"
              >
                1
              </button>
              <button
                type="button"
                className="h-8 w-8 rounded-md hover:bg-muted text-foreground text-xs font-medium flex items-center justify-center transition-colors"
              >
                2
              </button>
              <button
                type="button"
                className="h-8 w-8 rounded-md hover:bg-muted text-foreground text-xs font-medium flex items-center justify-center transition-colors"
              >
                3
              </button>
              <span className="px-1 text-muted-foreground">...</span>
              <button
                type="button"
                className="h-8 w-8 rounded-md hover:bg-muted text-foreground text-xs font-medium flex items-center justify-center transition-colors"
              >
                15
              </button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs text-foreground hover:bg-muted"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
