'use client';

import * as React from 'react';
import Link from 'next/link';
import { Settings, Eye, ChevronDown, ArrowUpDown } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  formatNaira,
  getRevenueBreakdown,
  getRevenueOverview,
  getRevenueTransactions,
  type RevenueBreakdown,
  type RevenueOverview,
  type RevenueTransaction,
  type RevenueTransactionsPage,
} from '@/lib/api/admin-dashboard';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

function formatDate(value?: string | null) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    PAID: 'Paid',
    FAILED: 'Failed',
    PENDING: 'Pending',
    REFUNDED: 'Refunded',
    CANCELLED: 'Cancelled',
  };
  return labels[status] || status;
}

function statusClass(status: string) {
  if (status === 'PAID') return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
  if (status === 'FAILED' || status === 'CANCELLED') return 'bg-rose-50 text-rose-700 border-rose-200/60';
  if (status === 'REFUNDED') return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
  return 'bg-amber-50 text-amber-700 border-amber-200/60';
}

function pageNumbers(current: number, total: number) {
  if (total <= 1) return [1];
  const wanted = [1, total, current - 1, current, current + 1].filter(
    (page) => page >= 1 && page <= total,
  );
  return [...new Set(wanted)].sort((a, b) => a - b);
}

function growthLabel(percentage: number) {
  if (percentage > 0) return `+${percentage}%`;
  return `${percentage}%`;
}

export default function AdminRevenuePage() {
  const [statusFilter, setStatusFilter] = React.useState<'All' | 'Paid' | 'Failed' | 'Pending'>('All');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [periodFilter, setPeriodFilter] = React.useState('Yearly');
  const [sort, setSort] = React.useState<'date' | 'amount-desc' | 'amount-asc'>('date');
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [overview, setOverview] = React.useState<RevenueOverview | null>(null);
  const [breakdown, setBreakdown] = React.useState<RevenueBreakdown | null>(null);
  const [transactions, setTransactions] = React.useState<RevenueTransactionsPage | null>(null);
  const [error, setError] = React.useState('');
  const [detail, setDetail] = React.useState<RevenueTransaction | null>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  React.useEffect(() => {
    let active = true;
    getRevenueOverview()
      .then((data) => {
        if (active) setOverview(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Revenue could not be loaded');
      });
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    let active = true;
    getRevenueBreakdown(periodFilter)
      .then((data) => {
        if (active) setBreakdown(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'The revenue chart could not be loaded');
      });
    return () => {
      active = false;
    };
  }, [periodFilter]);

  React.useEffect(() => {
    let active = true;
    getRevenueTransactions({
      status: statusFilter,
      search: debouncedSearch,
      page,
      limit,
      sort,
    })
      .then((data) => {
        if (active) setTransactions(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Transactions could not be loaded');
      });
    return () => {
      active = false;
    };
  }, [statusFilter, debouncedSearch, page, limit, sort]);

  const rows = transactions?.data || [];
  const chartData = breakdown?.data || [];
  const total = transactions?.meta.total ?? 0;
  const current = transactions?.meta.page ?? page;
  const totalPages = Math.max(1, transactions?.meta.totalPages || 1);
  const start = total === 0 ? 0 : (current - 1) * limit + 1;
  const end = Math.min(current * limit, total);
  const monthLabel = overview?.currentMonth?.label
    || new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <AppShell currentRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-serif font-semibold tracking-tight text-foreground">
              Revenue & Plans
            </h1>
            <p className="text-xs text-muted-foreground">
              Platform billing overview · {monthLabel}
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

        {error && (
          <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-[#6D3A1B] dark:text-[#D4A373] block">
                {overview ? formatNaira(overview.currentMonth?.amount ?? overview.totalRevenue.amount) : '—'}
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Total Revenue</p>
              <p className="text-[11px] text-muted-foreground">{monthLabel}</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-[#6D3A1B] dark:text-[#D4A373] block">
                {overview ? growthLabel(overview.momGrowth?.percentage ?? 0) : '—'}
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Month-on-Month Growth</p>
              <p className="text-[11px] text-muted-foreground">
                vs. {overview?.momGrowth.comparedWith || 'last month'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-[#6D3A1B] dark:text-[#D4A373] block">
                {overview ? overview.availablePlans.count : '—'}
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Available Plans</p>
              <p className="text-[11px] text-muted-foreground">Plans across all type of organizer</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-2xs">
            <CardContent className="p-5 space-y-1">
              <span className="text-3xl font-serif font-semibold text-[#6D3A1B] dark:text-[#D4A373] block">
                {overview ? overview.activeSubscriptions.count : '—'}
              </span>
              <p className="text-xs font-semibold text-foreground pt-1">Active Subscriptions</p>
              <p className="text-[11px] text-muted-foreground">Paid organizer plans</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/80 shadow-2xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Revenue Breakdown</CardTitle>
              <div className="relative">
                <select
                  aria-label="Filter Breakdown Period"
                  value={periodFilter}
                  onChange={(event) => setPeriodFilter(event.target.value)}
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
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/50" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                    width={56}
                    tickFormatter={(value) => formatNaira(Number(value))}
                  />
                  <Tooltip
                    formatter={(value) => [formatNaira(Number(value)), 'Revenue']}
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

        <div className="border border-border/80 rounded-2xl bg-card shadow-2xs overflow-hidden">
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60">
            <div>
              <h2 className="text-base font-semibold text-foreground">Transactions</h2>
              <p className="text-xs text-muted-foreground">
                Filterable by status · click a row for full detail
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center rounded-lg border border-border/80 p-0.5 bg-muted/30">
                {(['All', 'Paid', 'Failed', 'Pending'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      setStatusFilter(status);
                      setPage(1);
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-background text-foreground shadow-2xs font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-3.5 pr-12 py-1.5 text-xs rounded-lg border border-border/80 bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground bg-muted/60 border border-border/60">
                  ⌘ k
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground text-left font-medium">
                <tr>
                  <th className="py-3 px-3 w-10">
                    <Checkbox
                      checked={rows.length > 0 && selectedIds.length === rows.length}
                      onCheckedChange={(checked) => {
                        setSelectedIds(checked === true ? rows.map((row) => row.id) : []);
                      }}
                    />
                  </th>
                  <th className="py-3 px-3">Transaction ID</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Organizer</th>
                  <th className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSort((currentSort) => (
                          currentSort === 'date' ? 'amount-desc' : currentSort === 'amount-desc' ? 'amount-asc' : 'date'
                        ));
                        setPage(1);
                      }}
                      className="flex items-center gap-1"
                    >
                      <span>Amount</span>
                      <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Plan / Description</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map((txn) => {
                  const isSelected = selectedIds.includes(txn.id);
                  return (
                    <tr
                      key={txn.id}
                      onClick={() => setDetail(txn)}
                      className={`hover:bg-muted/20 transition-colors cursor-pointer ${isSelected ? 'bg-primary/5' : ''}`}
                    >
                      <td className="py-3 px-3" onClick={(event) => event.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => {
                            setSelectedIds((prev) => (
                              prev.includes(txn.id) ? prev.filter((id) => id !== txn.id) : [...prev, txn.id]
                            ));
                          }}
                        />
                      </td>
                      <td className="py-3 px-3 font-mono text-foreground font-medium">{txn.txId}</td>
                      <td className="py-3 px-3 text-muted-foreground">{formatDate(txn.date)}</td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-foreground">{txn.organizer}</p>
                        <span className="text-[10px] text-amber-800 dark:text-amber-400 font-medium">
                          {txn.organizerType}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-foreground">
                        {formatNaira(txn.amount)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusClass(txn.status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {statusLabel(txn.status)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{txn.plan || 'Ticket order'}</td>
                      <td className="py-3 px-3 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(event) => {
                            event.stopPropagation();
                            setDetail(txn);
                          }}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          aria-label={`View ${txn.txId}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 px-3 text-center text-muted-foreground">
                      No transactions match this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <select
                aria-label="Rows per page"
                value={String(limit)}
                onChange={(event) => {
                  setLimit(Number(event.target.value));
                  setPage(1);
                }}
                className="bg-background border border-border/80 rounded-md px-2 py-1 text-xs text-foreground focus:outline-none"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="text-muted-foreground ml-2">showing {start}–{end} of {total} rows</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={current <= 1}
                onClick={() => setPage(current - 1)}
                className="h-8 px-3 text-xs text-muted-foreground disabled:opacity-40"
              >
                Previous
              </Button>
              {pageNumbers(current, totalPages).map((number, index, list) => (
                <React.Fragment key={number}>
                  {index > 0 && number - list[index - 1] > 1 && (
                    <span className="px-1 text-muted-foreground">...</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setPage(number)}
                    className={`h-8 w-8 rounded-md text-xs font-semibold flex items-center justify-center ${
                      number === current ? 'bg-[#6D3A1B] text-white shadow-xs' : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    {number}
                  </button>
                </React.Fragment>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={current >= totalPages}
                onClick={() => setPage(current + 1)}
                className="h-8 px-3 text-xs text-foreground hover:bg-muted"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={Boolean(detail)} onOpenChange={(open) => { if (!open) setDetail(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {detail?.txId || 'Transaction'}
            </DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">Organizer</p>
                <p className="font-semibold text-foreground">{detail.organizer}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-semibold text-foreground">{detail.organizerType}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Buyer</p>
                <p className="font-semibold text-foreground">{detail.buyerName || 'Not recorded'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-semibold text-foreground">{detail.buyerEmail || 'Not recorded'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-semibold text-foreground">{formatNaira(detail.amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-semibold text-foreground">{statusLabel(detail.status)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Event</p>
                <p className="font-semibold text-foreground">{detail.plan || 'Ticket order'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Gateway</p>
                <p className="font-semibold text-foreground">{detail.paymentGateway || 'Not recorded'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-semibold text-foreground">{formatDate(detail.date)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Paid</p>
                <p className="font-semibold text-foreground">{formatDate(detail.paidAt)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
