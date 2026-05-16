import { DashboardLayout } from '@/components/DashboardLayout';
import { evTargets, currentCompliance } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';

function Gauge({ label, current, target }: { label: string; current: number; target: number }) {
  const pct = Math.min((current / target) * 100, 100);
  const ok = current >= target;
  return (
    <div className="glass rounded-xl p-5 text-center">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">{label}</p>
      <div className="relative w-28 h-28 mx-auto mb-3">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" strokeWidth="8" className="stroke-secondary" />
          <circle
            cx="50" cy="50" r="40" fill="none" strokeWidth="8"
            strokeDasharray={`${pct * 2.51} 251`}
            strokeLinecap="round"
            className={ok ? 'stroke-accent' : 'stroke-warning'}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-heading font-bold">{current}%</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Target: {target}%</p>
      <Badge variant={ok ? 'default' : 'secondary'} className={`mt-2 ${ok ? 'bg-accent text-accent-foreground' : ''}`}>
        {ok ? 'On Track' : 'Below Target'}
      </Badge>
    </div>
  );
}

export default function EVCompliance() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">EV Compliance</h1>
        <p className="text-sm text-muted-foreground">Phase-wise electric vehicle adoption targets</p>
      </div>

      {/* Current Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Gauge label="2-Wheeler" current={currentCompliance.twoW} target={100} />
        <Gauge label="3-Wheeler" current={currentCompliance.threeW} target={25} />
        <Gauge label="4-Wheeler" current={currentCompliance.fourW} target={15} />
      </div>

      {/* Phase-wise Target Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-heading font-semibold text-sm">Phase-wise EV Targets</h3>
          <p className="text-xs text-muted-foreground">As per Transport Department notification</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-5 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">Phase</th>
                <th className="text-center px-5 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">2-Wheeler</th>
                <th className="text-center px-5 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">3-Wheeler</th>
                <th className="text-center px-5 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">4-Wheeler</th>
              </tr>
            </thead>
            <tbody>
              {evTargets.map((t, i) => (
                <tr key={i} className={`border-b border-border/50 ${i === evTargets.length - 1 ? 'bg-accent/5 font-semibold' : ''}`}>
                  <td className="px-5 py-3 text-xs font-medium">{t.phase}</td>
                  <td className="px-5 py-3 text-center text-xs">{t.twoW}%</td>
                  <td className="px-5 py-3 text-center text-xs">{t.threeW}%</td>
                  <td className="px-5 py-3 text-center text-xs">{t.fourW}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
