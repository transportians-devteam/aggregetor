import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { mockFleetVerify, mockCompanies, type FleetVerifyRecord } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, Search, ShieldCheck, AlertTriangle, CheckCircle2, Clock, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminFleetVerify() {
  const [records, setRecords] = useState<FleetVerifyRecord[]>(mockFleetVerify);
  const [selectedAggregator, setSelectedAggregator] = useState<string>('All');
  const [search, setSearch] = useState('');

  const aggregators = ['All', ...Array.from(new Set(mockFleetVerify.map(r => r.aggregator)))];
  const filtered = records
    .filter(r => selectedAggregator === 'All' || r.aggregator === selectedAggregator)
    .filter(r => r.regNo.toLowerCase().includes(search.toLowerCase()));

  const verifiedCount = filtered.filter(r => r.verified).length;
  const flaggedCount = filtered.filter(r => r.flagged).length;
  const pendingCount = filtered.filter(r => !r.verified && !r.flagged).length;

  const handleVerify = (regNo: string) => {
    setRecords(prev => prev.map(r => r.regNo === regNo ? { ...r, verified: true, flagged: false, lastChecked: new Date().toLocaleDateString('en-GB') } : r));
    toast.success(`${regNo} marked as verified ✓`);
  };

  const handleFlag = (regNo: string) => {
    setRecords(prev => prev.map(r => r.regNo === regNo ? { ...r, flagged: true, verified: false, lastChecked: new Date().toLocaleDateString('en-GB') } : r));
    toast.error(`${regNo} flagged for issues ⚠`);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Fleet Verification</h1>
        <p className="text-sm text-muted-foreground">Inspect aggregator fleets — verify RC, insurance, PUCC compliance for each vehicle.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Vehicles', value: filtered.length, icon: Car, color: 'text-foreground', bg: 'bg-accent/10 text-accent' },
          { label: 'Verified', value: verifiedCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100 text-emerald-600' },
          { label: 'Flagged', value: flaggedCount, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100 text-red-600' },
          { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 text-amber-600' },
        ].map(c => (
          <div key={c.label} className="glass rounded-xl p-4 flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{c.label}</p>
              <p className={cn("text-2xl font-heading font-bold mt-1", c.color)}>{c.value}</p>
            </div>
            <div className={cn("p-2 rounded-lg", c.bg)}><c.icon className="w-4 h-4" /></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/30"
            placeholder="Search by Reg No..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {aggregators.map(a => (
            <button
              key={a}
              onClick={() => setSelectedAggregator(a)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border", selectedAggregator === a ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/40')}
            >{a}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">Reg No</th>
                <th className="text-left px-4 py-3 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">Aggregator</th>
                <th className="text-left px-4 py-3 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">Category</th>
                <th className="text-center px-4 py-3 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">Fuel</th>
                <th className="text-center px-4 py-3 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">RC</th>
                <th className="text-center px-4 py-3 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">Insurance</th>
                <th className="text-center px-4 py-3 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">PUCC</th>
                <th className="text-center px-4 py-3 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-3 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">Last Checked</th>
                <th className="text-center px-4 py-3 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.regNo} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono font-semibold">{r.regNo}</td>
                  <td className="px-4 py-3 text-xs font-medium">{r.aggregator}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.category}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="outline" className={cn("text-[10px]", r.fuelType === 'Electric' && 'border-accent text-accent')}>{r.fuelType}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">{r.rcValid ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <AlertTriangle className="w-4 h-4 text-red-500 mx-auto" />}</td>
                  <td className="px-4 py-3 text-center">{r.insuranceValid ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <AlertTriangle className="w-4 h-4 text-red-500 mx-auto" />}</td>
                  <td className="px-4 py-3 text-center">{r.puccValid ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <AlertTriangle className="w-4 h-4 text-red-500 mx-auto" />}</td>
                  <td className="px-4 py-3 text-center">
                    {r.verified ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px]">Verified</Badge>
                    ) : r.flagged ? (
                      <Badge className="bg-red-100 text-red-700 border border-red-200 text-[10px]">Flagged</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">Pending</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-[10px] text-muted-foreground">{r.lastChecked}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      {!r.verified && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-emerald-600 hover:bg-emerald-50" onClick={() => handleVerify(r.regNo)}>
                          <ShieldCheck className="w-3 h-3 mr-1" /> Verify
                        </Button>
                      )}
                      {!r.flagged && (
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-red-600 hover:bg-red-50" onClick={() => handleFlag(r.regNo)}>
                          <AlertTriangle className="w-3 h-3 mr-1" /> Flag
                        </Button>
                      )}
                    </div>
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
