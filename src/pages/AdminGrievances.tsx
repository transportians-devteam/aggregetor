import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { mockAdminGrievances, type AdminGrievance } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Search, Clock, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Send, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  'Under Review': 'bg-blue-100 text-blue-700 border-blue-200',
  Resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Escalated: 'bg-red-100 text-red-700 border-red-200',
};

const priorityColors: Record<string, string> = {
  Low: 'bg-secondary text-muted-foreground',
  Medium: 'bg-amber-100 text-amber-700',
  High: 'bg-red-100 text-red-700',
};

export default function AdminGrievances() {
  const [grievances, setGrievances] = useState<AdminGrievance[]>(mockAdminGrievances);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');

  const filtered = grievances
    .filter(g => filterStatus === 'All' || g.status === filterStatus)
    .filter(g => g.subject.toLowerCase().includes(search.toLowerCase()) || g.aggregator.toLowerCase().includes(search.toLowerCase()));

  const pending = grievances.filter(g => g.status === 'Pending').length;
  const escalated = grievances.filter(g => g.status === 'Escalated').length;

  const resolve = (id: string) => {
    setGrievances(prev => prev.map(g => g.id === id ? { ...g, status: 'Resolved' as const } : g));
    toast.success(`Grievance ${id} resolved`);
    setExpandedId(null);
  };

  const takeForReview = (id: string) => {
    setGrievances(prev => prev.map(g => g.id === id ? { ...g, status: 'Under Review' as const } : g));
    toast.success(`Grievance ${id} taken for review`);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Grievance Review</h1>
        <p className="text-sm text-muted-foreground">Handle all aggregator grievances, respond and resolve within SLA.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: grievances.length, icon: MessageSquare, color: 'text-foreground', bg: 'bg-accent/10 text-accent' },
          { label: 'Pending', value: pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 text-amber-600' },
          { label: 'Escalated', value: escalated, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100 text-red-600' },
          { label: 'Resolved', value: grievances.filter(g => g.status === 'Resolved').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100 text-emerald-600' },
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

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-card" placeholder="Search grievances..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 items-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {['All', 'Pending', 'Under Review', 'Escalated', 'Resolved'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all", filterStatus === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/40')}>{s}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <div className="glass rounded-xl p-12 text-center text-muted-foreground text-sm">No grievances match your filter.</div>}
        {filtered.map(g => {
          const isExpanded = expandedId === g.id;
          return (
            <div key={g.id} className="glass rounded-xl overflow-hidden transition-shadow hover:shadow-lg">
              <button onClick={() => { setExpandedId(isExpanded ? null : g.id); setReplyText(''); }} className="w-full px-5 py-4 flex items-center gap-4 text-left">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", g.priority === 'High' ? 'bg-red-100 text-red-600' : g.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-secondary text-muted-foreground')}>
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-heading font-semibold text-sm truncate">{g.subject}</p>
                    <Badge className={cn("text-[10px] border", statusColors[g.status])}>{g.status}</Badge>
                    <Badge className={cn("text-[10px]", priorityColors[g.priority])}>{g.priority}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{g.id} · {g.aggregator} · Filed {g.filedDate} · SLA {g.slaDeadline}</p>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</p>
                    <p className="text-sm leading-relaxed">{g.description}</p>
                  </div>
                  {g.status !== 'Resolved' && (
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase mb-1 block">Officer Response</label>
                      <div className="flex gap-2">
                        <input className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-sm" placeholder="Type your response..."
                          value={replyText} onChange={e => setReplyText(e.target.value)} />
                        <Button variant="accent" size="sm" className="gap-1.5" onClick={() => { resolve(g.id); setReplyText(''); }} disabled={!replyText.trim()}>
                          <Send className="w-3.5 h-3.5" /> Respond & Resolve
                        </Button>
                      </div>
                    </div>
                  )}
                  {g.status !== 'Resolved' && g.status !== 'Under Review' && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => takeForReview(g.id)}>Take for Review</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
