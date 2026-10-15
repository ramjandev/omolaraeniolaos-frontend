import * as React from 'react';
import { Receipt, DollarSign, Download } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatsMetricCard } from '@/components/shared/StatsMetricCard';
import { MOCK_AGENCY_INVOICES } from '@/lib/mock-data/agency';

export default function AgencyBillingPage() {
  return (
    <AppShell
      currentRole="organizer_agency"
      title="Invoices & Client Billing"
      subtitle="Track agency service invoices, client disbursements, and milestone retainers."
      primaryAction={{
        label: 'Create Invoice',
        href: '/organizer/agency/billing',
      }}
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsMetricCard
            title="Total Billed YTD"
            value="$114,500.00"
            change="+24% vs Q2"
            isPositive={true}
            icon={DollarSign}
          />
          <StatsMetricCard
            title="Outstanding Collections"
            value="$34,500.00"
            description="1 invoice pending payment"
            icon={Receipt}
          />
          <StatsMetricCard
            title="Agency Net Commission"
            value="$17,175.00"
            description="15% standard commission"
            icon={DollarSign}
          />
        </div>

        <Card className="border-border/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-border/80 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Billing Ledger</h3>
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>Export Statements</span>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground text-left font-medium uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Event Project</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Issued</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {MOCK_AGENCY_INVOICES.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/20">
                    <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-foreground">{inv.clientName}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">{inv.eventTitle}</td>
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      ${inv.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">{inv.issueDate}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">{inv.dueDate}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize ${
                          inv.status === 'paid'
                            ? 'text-emerald-600 border-emerald-300'
                            : inv.status === 'pending'
                            ? 'text-amber-600 border-amber-300'
                            : 'text-rose-600 border-rose-300'
                        }`}
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        Download PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
