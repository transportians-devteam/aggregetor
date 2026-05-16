import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { mockCompanies, mockFleetVerify, mockPenalties, formatINR } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, Mail, Phone, MapPin, Shield, Car, Leaf, Wallet, Calendar, Clock, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const CATEGORY_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b'];
const FUEL_COLORS = ['hsl(153,100%,42%)', '#f59e0b', '#94a3b8'];

const eventIcons: Record<string, typeof Shield> = {
  'License Granted': Shield,
  'Fleet Declared': Car,
  'Fleet Update': Car,
  'EV Milestone': Zap,
  'Penalty Issued': AlertTriangle,
  'Renewal Requested': Calendar,
};

const eventColors: Record<string, string> = {
  'License Granted': 'bg-blue-100 text-blue-600',
  'Fleet Declared': 'bg-emerald-100 text-emerald-600',
  'Fleet Update': 'bg-emerald-100 text-emerald-600',
  'EV Milestone': 'bg-accent/10 text-accent',
  'Penalty Issued': 'bg-red-100 text-red-600',
  'Renewal Requested': 'bg-amber-100 text-amber-600',
};

export default function AdminAggregatorDetail() {
  const { id } = useParams<{ id: string }>();
  const company = mockCompanies.find(c => c.id === id);

  if (!company) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Aggregator not found.</p>
          <Link to="/admin/aggregators" className="text-accent text-sm mt-2 inline-block">← Back to list</Link>
        </div>
      </DashboardLayout>
    );
  }

  const categoryData = Object.entries(company.fleetBreakdown)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ name: key, value }));
  const fuelData = Object.entries(company.fuelBreakdown).map(([key, value]) => ({ name: key, value }));
  const companyVehicles = mockFleetVerify.filter(r => r.aggregator === company.name);
  const companyPenalties = mockPenalties.filter(p => p.aggregator === company.name);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <Link to="/admin/aggregators" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Aggregators
        </Link>
        <div className="flex items-start gap-4">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-heading font-bold text-lg shrink-0", company.type === 'DSP' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700')}>
            {company.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-2xl font-bold">{company.name}</h1>
              <Badge variant="outline">{company.type}</Badge>
              <Badge className={cn("border", company.licenseStatus === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200')}>{company.licenseStatus}</Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-1">{company.licenseNo}</p>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Fleet Size', value: company.fleetSize.toLocaleString('en-IN'), icon: Car, color: 'text-foreground' },
          { label: 'EV Adoption', value: `${company.evPercent}%`, icon: Leaf, color: 'text-accent' },
          { label: 'Compliance', value: `${company.complianceRate}%`, icon: Shield, color: company.complianceRate >= 75 ? 'text-emerald-600' : 'text-amber-600' },
          { label: 'Wallet Balance', value: formatINR(company.walletBalance), icon: Wallet, color: 'text-foreground' },
        ].map(c => (
          <div key={c.label} className="glass rounded-xl p-4 flex items-start justify-between">
            <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{c.label}</p><p className={cn("text-xl font-heading font-bold mt-1", c.color)}>{c.value}</p></div>
            <div className="p-2 rounded-lg bg-secondary text-muted-foreground"><c.icon className="w-4 h-4" /></div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Company Info */}
        <div className="glass rounded-xl p-5">
          <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-muted-foreground" /> Company Details</h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> <span className="text-muted-foreground">Contact:</span> <span className="font-medium">{company.contactName}</span></div>
            <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> <span className="font-medium">{company.contactEmail}</span></div>
            <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> <span className="font-medium">{company.contactPhone}</span></div>
            <div className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" /> <span className="font-medium">{company.address}</span></div>
            <hr className="border-border" />
            <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> <span className="text-muted-foreground">Granted:</span> <span className="font-medium">{company.licenseGranted}</span></div>
            <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> <span className="text-muted-foreground">Expires:</span> <span className="font-medium">{company.licenseExpiry}</span></div>
            <div className="flex gap-1.5 flex-wrap pt-1">{company.categories.map(cat => <span key={cat} className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-accent/10 text-accent border border-accent/20">{cat}</span>)}</div>
          </div>
        </div>

        {/* Category Donut */}
        <div className="glass rounded-xl p-5">
          <h3 className="font-heading font-semibold text-sm mb-2 flex items-center gap-2"><Car className="w-4 h-4 text-muted-foreground" /> Vehicle Categories</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => v.toLocaleString('en-IN')} />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fuel Donut */}
        <div className="glass rounded-xl p-5">
          <h3 className="font-heading font-semibold text-sm mb-2 flex items-center gap-2"><Leaf className="w-4 h-4 text-accent" /> Fuel Type Mix</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={fuelData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {fuelData.map((_, i) => <Cell key={i} fill={FUEL_COLORS[i % FUEL_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => v.toLocaleString('en-IN')} />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Fleet Vehicles */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-heading font-semibold text-sm flex items-center gap-2"><Car className="w-4 h-4 text-muted-foreground" /> Fleet Vehicles ({companyVehicles.length})</h3>
            <Link to="/admin/fleet-verify" className="text-[10px] text-accent font-semibold hover:underline">View All →</Link>
          </div>
          {companyVehicles.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">No vehicle records in verification queue.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-4 py-2.5 font-medium text-[10px] text-muted-foreground uppercase">Reg No</th>
                    <th className="text-left px-4 py-2.5 font-medium text-[10px] text-muted-foreground uppercase">Category</th>
                    <th className="text-center px-4 py-2.5 font-medium text-[10px] text-muted-foreground uppercase">Fuel</th>
                    <th className="text-center px-4 py-2.5 font-medium text-[10px] text-muted-foreground uppercase">RC</th>
                    <th className="text-center px-4 py-2.5 font-medium text-[10px] text-muted-foreground uppercase">Ins.</th>
                    <th className="text-center px-4 py-2.5 font-medium text-[10px] text-muted-foreground uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {companyVehicles.map(v => (
                    <tr key={v.regNo} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-4 py-2.5 font-mono font-semibold">{v.regNo}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{v.category}</td>
                      <td className="px-4 py-2.5 text-center">
                        <Badge variant="outline" className={cn("text-[9px]", v.fuelType === 'Electric' && 'border-accent text-accent')}>{v.fuelType}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-center">{v.rcValid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <AlertTriangle className="w-3.5 h-3.5 text-red-500 mx-auto" />}</td>
                      <td className="px-4 py-2.5 text-center">{v.insuranceValid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <AlertTriangle className="w-3.5 h-3.5 text-red-500 mx-auto" />}</td>
                      <td className="px-4 py-2.5 text-center">
                        {v.verified ? <Badge className="bg-emerald-100 text-emerald-700 text-[9px] border border-emerald-200">Verified</Badge> : v.flagged ? <Badge className="bg-red-100 text-red-700 text-[9px] border border-red-200">Flagged</Badge> : <Badge variant="outline" className="text-[9px]">Pending</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* History Timeline */}
        <div className="glass rounded-xl p-5">
          <h3 className="font-heading font-semibold text-sm mb-5 flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> Activity History</h3>
          <div className="relative pl-6 border-l-2 border-border space-y-6">
            {[...company.history].reverse().map((h, i) => {
              const Icon = eventIcons[h.event] || Clock;
              const colorClass = eventColors[h.event] || 'bg-secondary text-muted-foreground';
              return (
                <div key={i} className="relative">
                  <div className={cn("absolute -left-[33px] top-0 w-8 h-8 rounded-lg flex items-center justify-center", colorClass)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="ml-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-semibold">{h.event}</p>
                      <span className="text-[10px] text-muted-foreground">{h.date}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{h.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Penalties */}
      {companyPenalties.length > 0 && (
        <div className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-heading font-semibold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Penalty History ({companyPenalties.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-5 py-2.5 font-medium text-[10px] text-muted-foreground uppercase">ID</th>
                  <th className="text-left px-5 py-2.5 font-medium text-[10px] text-muted-foreground uppercase">Type</th>
                  <th className="text-right px-5 py-2.5 font-medium text-[10px] text-muted-foreground uppercase">Amount</th>
                  <th className="text-center px-5 py-2.5 font-medium text-[10px] text-muted-foreground uppercase">Date</th>
                  <th className="text-center px-5 py-2.5 font-medium text-[10px] text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {companyPenalties.map(p => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="px-5 py-2.5 font-mono font-semibold">{p.id}</td>
                    <td className="px-5 py-2.5 text-muted-foreground">{p.type}</td>
                    <td className="px-5 py-2.5 text-right font-bold">{formatINR(p.amount)}</td>
                    <td className="px-5 py-2.5 text-center text-muted-foreground">{p.issuedDate}</td>
                    <td className="px-5 py-2.5 text-center">
                      <Badge className={cn("text-[9px] border",
                        p.status === 'Active' ? 'bg-red-100 text-red-700 border-red-200' :
                        p.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        'bg-amber-100 text-amber-700 border-amber-200'
                      )}>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
