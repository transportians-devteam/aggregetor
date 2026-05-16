import { DashboardLayout } from '@/components/DashboardLayout';
import { Clock, Car, Users, CreditCard, FileText, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const logs = [
  { id: 1, action: 'vehicle.onboarded', entity: 'DL01AB1234', user: 'Admin', time: '2026-03-25 10:30', detail: 'Vehicle onboarded via CSV bulk upload' },
  { id: 2, action: 'penalty.paid', entity: 'P-2026-002', user: 'Admin', time: '2026-03-24 15:12', detail: 'Penalty of ₹15,000 paid via wallet' },
  { id: 3, action: 'driver.onboarded', entity: 'Rajesh Kumar', user: 'Admin', time: '2026-03-24 11:45', detail: 'Driver verified via SARATHI API' },
  { id: 4, action: 'wallet.recharged', entity: 'Wallet', user: 'Admin', time: '2026-03-23 09:00', detail: 'Recharged ₹50,000 via Razorpay' },
  { id: 5, action: 'vehicle.offboarded', entity: 'DL05IJ7890', user: 'Admin', time: '2026-03-22 16:30', detail: 'Reason: Sold' },
  { id: 6, action: 'declaration.submitted', entity: 'Mar 1-15 Declaration', user: 'Admin', time: '2026-03-16 23:55', detail: 'Fortnightly declaration submitted on time' },
  { id: 7, action: 'penalty.created', entity: 'P-2026-003', user: 'System', time: '2026-03-15 00:01', detail: 'Auto-generated: EV ratio warning' },
  { id: 8, action: 'profile.updated', entity: 'Profile', user: 'Admin', time: '2026-03-10 14:20', detail: 'Compliance officer email updated' },
];

const actionIcons: Record<string, typeof Car> = {
  'vehicle.onboarded': Car,
  'vehicle.offboarded': Car,
  'driver.onboarded': Users,
  'penalty.paid': CreditCard,
  'penalty.created': FileText,
  'wallet.recharged': CreditCard,
  'declaration.submitted': FileText,
  'profile.updated': FileText,
};

const actionColors: Record<string, string> = {
  'vehicle.onboarded': 'bg-green-100 text-green-700',
  'vehicle.offboarded': 'bg-red-100 text-red-700',
  'driver.onboarded': 'bg-green-100 text-green-700',
  'penalty.paid': 'bg-blue-100 text-blue-700',
  'penalty.created': 'bg-amber-100 text-amber-700',
  'wallet.recharged': 'bg-purple-100 text-purple-700',
  'declaration.submitted': 'bg-green-100 text-green-700',
  'profile.updated': 'bg-slate-100 text-slate-700',
};

export default function History() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">History</h1>
            <p className="text-sm text-muted-foreground mt-1">Complete audit trail of all actions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Filter</Button>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export</Button>
          </div>
        </div>

        <div className="glass rounded-xl border border-border overflow-hidden">
          <div className="divide-y divide-border">
            {logs.map(log => {
              const Icon = actionIcons[log.action] || Clock;
              return (
                <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-muted/20 transition-colors">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${actionColors[log.action] || 'bg-muted text-muted-foreground'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{log.action}</span>
                      <span className="text-sm font-semibold">{log.entity}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.detail}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground">{log.time}</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">by {log.user}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
