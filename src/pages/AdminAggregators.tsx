import { DashboardLayout } from '@/components/DashboardLayout';
import { formatINR } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Building2, ArrowRight, Search, Leaf, Car, Wallet, Shield, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '@/services/adminService';

export default function AdminAggregators() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Aggregator' | 'DSP'>('All');

  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
  });

  const aggregators = (stats?.aggregators || []).map(agg => ({
    ...agg,
    type: 'Aggregator', 
    categories: ['2W', '3W', '4W']
  }));

  const filtered = aggregators
    .filter(c => filterType === 'All' || c.type === filterType)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.licenseNo.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Aggregators &amp; DSPs</h1>
        <p className="text-sm text-muted-foreground">All licensed aggregators and delivery service providers operating in NCT of Delhi.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterType('All')}>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Licensed</p>
          <p className="text-2xl font-heading font-bold mt-1">{aggregators.length}</p>
        </div>
        <div className="glass rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterType('Aggregator')}>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Aggregators</p>
          <p className="text-2xl font-heading font-bold mt-1 text-blue-600">{aggregators.filter(c => c.type === 'Aggregator').length}</p>
        </div>
        <div className="glass rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterType('DSP')}>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Delivery SPs</p>
          <p className="text-2xl font-heading font-bold mt-1 text-purple-600">{aggregators.filter(c => c.type === 'DSP').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/30" placeholder="Search by name or license..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 items-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {(['All', 'Aggregator', 'DSP'] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)} className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all", filterType === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/40')}>{t}</button>
          ))}
        </div>
      </div>

      {/* Row Cards */}
      <div className="space-y-3">
        {filtered.map(c => (
          <Link
            key={c.id}
            to={`/admin/aggregators/${c.id}`}
            className="glass rounded-xl p-5 hover:shadow-lg transition-all group block"
          >
            <div className="flex items-center gap-5">
              {/* Avatar + Name */}
              <div className="flex items-center gap-3 min-w-[180px] shrink-0">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-heading font-bold text-base shrink-0", c.type === 'DSP' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700')}>
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-heading font-bold">{c.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">{c.type}</Badge>
                    <Badge className={cn("text-[9px] px-1.5 py-0 border", c.licenseStatus === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200')}>{c.licenseStatus}</Badge>
                  </div>
                </div>
              </div>

              {/* Stats Strip */}
              <div className="hidden md:flex items-center gap-6 flex-1 min-w-0 text-xs">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Fleet</p>
                  <p className="font-heading font-bold text-base mt-0.5">{c.fleetSize.toLocaleString('en-IN')}</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">EV</p>
                  <p className="font-heading font-bold text-base mt-0.5 text-accent">{c.evPercent}%</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Compliance</p>
                  <p className={cn("font-heading font-bold text-base mt-0.5", c.complianceRate >= 75 ? 'text-emerald-600' : c.complianceRate >= 50 ? 'text-amber-600' : 'text-red-600')}>{c.complianceRate}%</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Wallet</p>
                  <p className="font-heading font-bold text-base mt-0.5">{formatINR(c.walletBalance)}</p>
                </div>
              </div>

              {/* EV Progress + Categories */}
              <div className="hidden lg:flex flex-col gap-2 min-w-[200px] shrink-0">
                <div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>EV Target</span>
                    <span className="font-bold text-foreground">{c.evPercent}% / 50%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div className={cn("h-1.5 rounded-full transition-all", c.evPercent >= 50 ? 'bg-accent' : c.evPercent >= 25 ? 'bg-amber-400' : 'bg-red-400')} style={{ width: `${Math.min((c.evPercent / 50) * 100, 100)}%` }} />
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {c.categories.map(cat => (
                    <span key={cat} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{cat}</span>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="shrink-0 ml-auto pl-4">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Mobile-only stats (shown below on small screens) */}
            <div className="md:hidden grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-border/50 text-xs text-center">
              <div><p className="text-[10px] text-muted-foreground">Fleet</p><p className="font-bold">{c.fleetSize.toLocaleString('en-IN')}</p></div>
              <div><p className="text-[10px] text-muted-foreground">EV</p><p className="font-bold text-accent">{c.evPercent}%</p></div>
              <div><p className="text-[10px] text-muted-foreground">Compliance</p><p className="font-bold">{c.complianceRate}%</p></div>
              <div><p className="text-[10px] text-muted-foreground">Wallet</p><p className="font-bold">{formatINR(c.walletBalance)}</p></div>
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
