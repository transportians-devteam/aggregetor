import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { mockPenalties, mockCompanies, formatINR, type PenaltyRecord } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BanknoteIcon, ShieldOff, Plus, Search, X, DollarSign, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const penaltyTypes = ['Late Declaration', 'EV Non-Compliance', 'Insurance Lapse', 'Data Mismatch', 'PUCC Violation'];

const statusColors: Record<string, string> = {
  Active: 'bg-red-100 text-red-700 border-red-200',
  Paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Waived: 'bg-blue-100 text-blue-700 border-blue-200',
  Appealed: 'bg-amber-100 text-amber-700 border-amber-200',
};

export default function AdminPenalties() {
  const [penalties, setPenalties] = useState<PenaltyRecord[]>(mockPenalties);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [newAgg, setNewAgg] = useState(mockCompanies[0].name);
  const [newType, setNewType] = useState(penaltyTypes[0]);
  const [newAmount, setNewAmount] = useState('50000');
  const [newDesc, setNewDesc] = useState('');

  const filtered = penalties.filter(p =>
    p.aggregator.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalActive = penalties.filter(p => p.status === 'Active').length;
  const totalCollection = penalties.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = penalties.filter(p => p.status === 'Active').reduce((s, p) => s + p.amount, 0);

  const issuePenalty = () => {
    if (!newDesc.trim()) { toast.error('Please add a description'); return; }
    const newPen: PenaltyRecord = {
      id: `PEN-2026-${String(penalties.length + 1).padStart(3, '0')}`,
      aggregator: newAgg, type: newType, amount: parseInt(newAmount) || 50000,
      issuedDate: new Date().toLocaleDateString('en-GB'), status: 'Active', description: newDesc,
    };
    setPenalties(prev => [newPen, ...prev]);
    setShowNew(false); setNewDesc('');
    toast.success(`Penalty ${newPen.id} issued to ${newAgg}`);
  };

  const waivePenalty = (id: string) => {
    setPenalties(prev => prev.map(p => p.id === id ? { ...p, status: 'Waived' as const } : p));
    toast.success(`Penalty ${id} waived`);
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Penalties &amp; Enforcement</h1>
          <p className="text-sm text-muted-foreground">Issue penalties, track payments, and enforce compliance.</p>
        </div>
        <Button variant="accent" size="sm" className="gap-1.5" onClick={() => setShowNew(!showNew)}>
          {showNew ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showNew ? 'Cancel' : 'Issue Penalty'}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: penalties.length, icon: AlertTriangle, color: 'text-foreground', bg: 'bg-accent/10 text-accent' },
          { label: 'Active', value: totalActive, icon: ShieldOff, color: 'text-red-600', bg: 'bg-red-100 text-red-600' },
          { label: 'Pending ₹', value: formatINR(totalPending), icon: BanknoteIcon, color: 'text-amber-600', bg: 'bg-amber-100 text-amber-600' },
          { label: 'Collected ₹', value: formatINR(totalCollection), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100 text-emerald-600' },
        ].map(c => (
          <div key={c.label} className="glass rounded-xl p-4 flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{c.label}</p>
              <p className={cn("text-xl font-heading font-bold mt-1", c.color)}>{c.value}</p>
            </div>
            <div className={cn("p-2 rounded-lg", c.bg)}><c.icon className="w-4 h-4" /></div>
          </div>
        ))}
      </div>

      {showNew && (
        <div className="glass rounded-xl p-6 mb-6 border-2 border-accent/30">
          <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2"><Scale className="w-4 h-4 text-accent" /> Issue New Penalty</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Aggregator</label>
              <select value={newAgg} onChange={e => setNewAgg(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm">{mockCompanies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Type</label>
              <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm">{penaltyTypes.map(t => <option key={t}>{t}</option>)}</select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Amount (₹)</label>
              <input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm" />
            </div>
            <div className="flex items-end"><Button variant="accent" className="w-full gap-1.5" onClick={issuePenalty}><AlertTriangle className="w-4 h-4" /> Issue</Button></div>
          </div>
          <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm resize-none h-20" placeholder="Describe the violation..." />
        </div>
      )}

      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-card" placeholder="Search penalties..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                {['ID','Aggregator','Type','Amount','Issued','Status','Actions'].map(h => (
                  <th key={h} className={cn("px-5 py-3 font-medium text-[10px] text-muted-foreground uppercase tracking-wider", h === 'Amount' ? 'text-right' : h === 'Actions' || h === 'Status' || h === 'Issued' ? 'text-center' : 'text-left')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 text-xs font-mono font-semibold">{p.id}</td>
                  <td className="px-5 py-3 text-xs font-medium">{p.aggregator}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{p.type}</td>
                  <td className="px-5 py-3 text-xs text-right font-bold">{formatINR(p.amount)}</td>
                  <td className="px-5 py-3 text-xs text-center text-muted-foreground">{p.issuedDate}</td>
                  <td className="px-5 py-3 text-center"><Badge className={cn("text-[10px] border", statusColors[p.status])}>{p.status}</Badge></td>
                  <td className="px-5 py-3 text-center">
                    {p.status === 'Active' && <Button size="sm" variant="ghost" className="h-7 px-2.5 text-[10px] text-blue-600 hover:bg-blue-50" onClick={() => waivePenalty(p.id)}>Waive</Button>}
                    {p.status === 'Appealed' && <span className="text-[10px] text-muted-foreground">Under appeal</span>}
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
