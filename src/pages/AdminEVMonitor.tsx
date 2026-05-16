import { DashboardLayout } from '@/components/DashboardLayout';
import { mockCompanies, evTargets, currentCompliance } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Leaf, AlertTriangle, TrendingUp, Target, Car, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const companyChartData = mockCompanies.map(c => ({
  name: c.name,
  ev: c.evPercent,
  nonEv: 100 - c.evPercent,
  fleet: c.fleetSize,
}));

const pieData = [
  { name: 'Electric', value: mockCompanies.reduce((s, c) => s + Math.round(c.fleetSize * c.evPercent / 100), 0), color: 'hsl(153,100%,42%)' },
  { name: 'CNG', value: mockCompanies.reduce((s, c) => s + Math.round(c.fleetSize * (100 - c.evPercent) * 0.6 / 100), 0), color: 'hsl(45,100%,55%)' },
  { name: 'Petrol/Diesel', value: mockCompanies.reduce((s, c) => s + Math.round(c.fleetSize * (100 - c.evPercent) * 0.4 / 100), 0), color: 'hsl(220,14%,80%)' },
];

const currentPhaseIdx = 3; // 3 Years
const currentTarget = evTargets[currentPhaseIdx];

export default function AdminEVMonitor() {
  const avgEV = Math.round(mockCompanies.reduce((s, c) => s + c.evPercent, 0) / mockCompanies.length);
  const totalFleet = mockCompanies.reduce((s, c) => s + c.fleetSize, 0);
  const totalEVs = mockCompanies.reduce((s, c) => s + Math.round(c.fleetSize * c.evPercent / 100), 0);
  const nonCompliant = mockCompanies.filter(c => c.evPercent < 25).length;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">EV Compliance Monitor</h1>
        <p className="text-sm text-muted-foreground">City-wide electric vehicle adoption tracking for all licensed aggregators.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'City EV Average', value: `${avgEV}%`, icon: Leaf, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Total EVs', value: totalEVs.toLocaleString('en-IN'), icon: Zap, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Non-Compliant', value: nonCompliant, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
          { label: 'Current Phase Target', value: `${currentTarget.fourW}% (4W)`, icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
        ].map(c => (
          <div key={c.label} className="glass rounded-xl p-4 flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{c.label}</p>
              <p className={cn("text-2xl font-heading font-bold mt-1", c.color)}>{c.value}</p>
            </div>
            <div className={cn("p-2 rounded-lg", c.bg, c.color)}><c.icon className="w-4 h-4" /></div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6 mb-6">
        {/* Stacked Bar Chart */}
        <div className="lg:col-span-3 glass rounded-xl p-5">
          <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" /> EV vs Non-EV by Aggregator
          </h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={companyChartData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" unit="%" />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: '12px' }}
                />
                <Bar dataKey="ev" stackId="a" fill="hsl(153,100%,42%)" radius={[0, 0, 0, 0]} name="EV %" />
                <Bar dataKey="nonEv" stackId="a" fill="hsl(220,14%,89%)" radius={[4, 4, 0, 0]} name="Non-EV %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-2 glass rounded-xl p-5">
          <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
            <Car className="w-4 h-4 text-accent" /> Fleet Fuel Mix ({totalFleet.toLocaleString('en-IN')} vehicles)
          </h3>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  stroke="none"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Tooltip formatter={(val: number) => val.toLocaleString('en-IN')} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Phase-wise Target Progress */}
      <div className="glass rounded-xl p-5 mb-6">
        <h3 className="font-heading font-semibold text-sm mb-5 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" /> Phase-wise EV Targets (Current: {evTargets[currentPhaseIdx].phase})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          {evTargets.map((t, i) => {
            const isCurrent = i === currentPhaseIdx;
            const isPast = i < currentPhaseIdx;
            return (
              <div key={t.phase} className={cn("rounded-xl p-4 text-center border transition-all", isCurrent ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105' : isPast ? 'bg-accent/5 border-accent/20' : 'bg-secondary/50 border-border')}>
                {isCurrent && <p className="text-[9px] font-bold uppercase tracking-wider mb-1 text-accent">Current</p>}
                <p className={cn("text-[10px] font-bold uppercase tracking-wider", isCurrent ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{t.phase}</p>
                <p className={cn("text-xl font-heading font-bold mt-1", isCurrent ? '' : isPast ? 'text-accent' : 'text-muted-foreground')}>{t.fourW}%</p>
                <p className={cn("text-[9px] mt-0.5", isCurrent ? 'text-primary-foreground/60' : 'text-muted-foreground')}>4W Target</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Non-Compliant Alert Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-heading font-semibold text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Aggregator Compliance Status
          </h3>
          <Badge variant="outline" className="text-[10px]">{nonCompliant} Non-Compliant</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-5 py-3 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">Aggregator</th>
                <th className="text-center px-5 py-3 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">Fleet Size</th>
                <th className="text-center px-5 py-3 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">EV %</th>
                <th className="text-center px-5 py-3 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">Target ({currentTarget.fourW}%)</th>
                <th className="text-center px-5 py-3 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">Gap</th>
                <th className="text-center px-5 py-3 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...mockCompanies].sort((a, b) => a.evPercent - b.evPercent).map(c => {
                const gap = currentTarget.fourW - c.evPercent;
                const compliant = gap <= 0;
                return (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 text-xs font-semibold">{c.name}</td>
                    <td className="px-5 py-3 text-xs text-center">{c.fleetSize.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3 text-xs text-center font-bold">{c.evPercent}%</td>
                    <td className="px-5 py-3 text-center">
                      <div className="w-full bg-secondary rounded-full h-2 mx-auto max-w-[100px]">
                        <div
                          className={cn("h-2 rounded-full transition-all", compliant ? 'bg-accent' : c.evPercent > currentTarget.fourW * 0.5 ? 'bg-amber-400' : 'bg-red-400')}
                          style={{ width: `${Math.min((c.evPercent / currentTarget.fourW) * 100, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className={cn("px-5 py-3 text-xs text-center font-bold", compliant ? 'text-accent' : 'text-red-500')}>
                      {compliant ? 'On Track' : `-${gap}%`}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Badge className={cn("text-[10px] border", compliant ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : c.evPercent > currentTarget.fourW * 0.5 ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-red-100 text-red-700 border-red-200')}>
                        {compliant ? 'Compliant' : c.evPercent > currentTarget.fourW * 0.5 ? 'At Risk' : 'Non-Compliant'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
