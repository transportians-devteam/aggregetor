import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/StatCard';
import { mockApplications, mockPenalties, mockAdminGrievances, mockFleetVerify, formatINR } from '@/lib/mockData';
import { Shield, Car, Leaf, Wallet, AlertTriangle, Users, FileText, MessageSquare, ArrowRight, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '@/services/adminService';

export default function Admin() {
  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
  });

  const aggregators = stats?.aggregators || [];
  const chartData = aggregators.map(c => ({ name: c.name, ev: c.evPercent, nonEv: 100 - c.evPercent }));

  const totalFleet = stats?.totalFleet || 0;
  const avgCompliance = stats?.avgCompliance || 0;
  const totalFees = stats?.totalFees || 0;
  const pendingApps = mockApplications.filter(a => a.status === 'Pending' || a.status === 'Under Review').length;
  const activePenalties = mockPenalties.filter(p => p.status === 'Active').length;
  const openGrievances = mockAdminGrievances.filter(g => g.status !== 'Resolved').length;
  const flaggedVehicles = mockFleetVerify.filter(r => r.flagged).length;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Transport Department · Government Officer View</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Licensed Aggregators" value={aggregators.length} icon={<Shield className="w-5 h-5" />} />
        <StatCard label="Total Fleet" value={totalFleet.toLocaleString('en-IN')} icon={<Car className="w-5 h-5" />} />
        <StatCard label="Avg Compliance" value={`${avgCompliance}%`} icon={<Leaf className="w-5 h-5" />} />
        <StatCard label="Fee Collection" value={formatINR(totalFees)} icon={<Wallet className="w-5 h-5" />} />
      </div>

      {/* Action Cards (Quick Nav) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Pending Applications', value: pendingApps, icon: Users, path: '/admin/applications', color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Flagged Vehicles', value: flaggedVehicles, icon: AlertTriangle, path: '/admin/fleet-verify', color: 'text-red-600', bg: 'bg-red-100' },
          { label: 'Active Penalties', value: activePenalties, icon: FileText, path: '/admin/penalties', color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Open Grievances', value: openGrievances, icon: MessageSquare, path: '/admin/grievances', color: 'text-purple-600', bg: 'bg-purple-100' },
        ].map(card => (
          <Link key={card.label} to={card.path} className="glass rounded-xl p-5 hover:shadow-lg transition-all hover:-translate-y-0.5 group cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className={cn("p-2.5 rounded-lg", card.bg, card.color)}><card.icon className="w-5 h-5" /></div>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className={cn("text-2xl font-heading font-bold", card.color)}>{card.value}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Chart */}
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-accent" /> EV Adoption by Aggregator</h3>
            <Link to="/admin/ev-monitor" className="text-[10px] font-semibold text-accent hover:underline flex items-center gap-1">View Details <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: '12px' }} />
                <Bar dataKey="ev" stackId="a" fill="hsl(153,100%,42%)" radius={[0, 0, 0, 0]} name="EV %" />
                <Bar dataKey="nonEv" stackId="a" fill="hsl(220,14%,89%)" radius={[4, 4, 0, 0]} name="Non-EV %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-heading font-semibold text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> Recent Applications</h3>
            <Link to="/admin/applications" className="text-[10px] font-semibold text-accent hover:underline flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="divide-y divide-border/50">
            {mockApplications.slice(0, 4).map(a => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                <div>
                  <p className="text-xs font-semibold">{a.companyName}</p>
                  <p className="text-[10px] text-muted-foreground">{a.companyType} · Filed {a.filedDate}</p>
                </div>
                <Badge className={cn("text-[10px] border",
                  a.status === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                  a.status === 'Under Review' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                  a.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                  'bg-red-100 text-red-700 border-red-200'
                )}>{a.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-heading font-semibold text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> Licensee Compliance Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                {['Aggregator','License','Fleet','EV %','Compliance','Status'].map(h => (
                  <th key={h} className={cn("px-5 py-3 font-medium text-[10px] text-muted-foreground uppercase tracking-wider", h === 'Aggregator' || h === 'License' ? 'text-left' : 'text-center')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {aggregators.map(c => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 text-xs font-semibold">{c.name}</td>
                  <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{c.licenseNo}</td>
                  <td className="px-5 py-3 text-center text-xs">{c.fleetSize.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-3 text-center text-xs font-bold">{c.evPercent}%</td>
                  <td className="px-5 py-3 text-center text-xs">{c.complianceRate}%</td>
                  <td className="px-5 py-3 text-center">
                    <Badge className={c.licenseStatus === 'Active' ? 'bg-accent text-accent-foreground' : 'bg-warning text-warning-foreground'}>{c.licenseStatus}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
