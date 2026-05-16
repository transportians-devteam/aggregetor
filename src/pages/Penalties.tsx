import { DashboardLayout } from '@/components/DashboardLayout';
import { AlertTriangle, CreditCard, Eye, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const penalties = [
  { id: 'P-2026-001', code: 'P001', desc: 'EV ratio non-compliance (Q1 2026)', type: 'monetary', amount: 50000, severity: 'major', status: 'pending', due: '2026-04-15' },
  { id: 'P-2026-002', code: 'P003', desc: 'Insurance lapse — 3 vehicles', type: 'monetary', amount: 15000, severity: 'minor', status: 'paid', due: '2026-03-01' },
  { id: 'P-2025-014', code: 'P002', desc: 'Late fortnightly declaration (Dec 2025)', type: 'monetary', amount: 10000, severity: 'minor', status: 'paid', due: '2026-01-15' },
  { id: 'P-2026-003', code: 'W001', desc: 'Warning: EV ratio approaching threshold', type: 'non_monetary', amount: 0, severity: 'warning', status: 'active', due: '-' },
  { id: 'P-2026-004', code: 'P004', desc: 'PUCC lapse — 5 vehicles', type: 'monetary', amount: 10000, severity: 'minor', status: 'pending', due: '2026-04-30' },
];

const severityColor: Record<string, string> = {
  warning: 'bg-amber-100 text-amber-700',
  minor: 'bg-blue-100 text-blue-700',
  major: 'bg-red-100 text-red-700',
  critical: 'bg-red-200 text-red-800',
};

const statusColor: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
  active: 'bg-blue-100 text-blue-700',
  appealed: 'bg-purple-100 text-purple-700',
};

export default function Penalties() {
  const totalPending = penalties.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">My Penalties</h1>
            <p className="text-sm text-muted-foreground mt-1">View violations and manage payments</p>
          </div>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export</Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-5 border border-border">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Total Pending</p>
            <p className="text-2xl font-heading font-bold text-destructive">₹{totalPending.toLocaleString()}</p>
          </div>
          <div className="glass rounded-xl p-5 border border-border">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Total Paid (All Time)</p>
            <p className="text-2xl font-heading font-bold text-green-600">₹25,000</p>
          </div>
          <div className="glass rounded-xl p-5 border border-border">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Active Warnings</p>
            <p className="text-2xl font-heading font-bold text-amber-600">1</p>
          </div>
        </div>

        {/* Table */}
        <div className="glass rounded-xl overflow-hidden border border-border">
          <div className="p-4 border-b border-border bg-muted/50 flex items-center justify-between">
            <h3 className="font-heading font-semibold text-sm">All Penalties & Warnings</h3>
            <Button variant="ghost" size="sm"><Filter className="w-4 h-4 mr-2" />Filter</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Severity</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Due Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
              </tr></thead>
              <tbody>
                {penalties.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                    <td className="p-3 font-mono text-xs">{p.id}</td>
                    <td className="p-3 font-medium max-w-[250px]">{p.desc}</td>
                    <td className="p-3 capitalize">{p.type.replace('_', '-')}</td>
                    <td className="p-3 font-semibold">{p.amount > 0 ? `₹${p.amount.toLocaleString()}` : '—'}</td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${severityColor[p.severity]}`}>{p.severity}</span></td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[p.status]}`}>{p.status}</span></td>
                    <td className="p-3 text-muted-foreground">{p.due}</td>
                    <td className="p-3">
                      {p.status === 'pending' && <Button size="sm" className="h-7 text-xs"><CreditCard className="w-3 h-3 mr-1" />Pay via Wallet</Button>}
                      {p.status === 'paid' && <Button variant="ghost" size="sm" className="h-7 text-xs"><Eye className="w-3 h-3 mr-1" />Receipt</Button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
