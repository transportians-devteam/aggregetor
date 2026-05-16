import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { type ApplicationStatus } from '@/lib/mockData';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApplications, updateApplicationStatus as updateStatusApi, ApplicationDto } from '@/services/adminService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Search, ChevronDown, ChevronUp, Check, X, MessageSquare, FileText, Building2, Phone, Mail, MapPin, Leaf, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const statusColors: Record<ApplicationStatus, string> = {
  'Pending': 'bg-amber-100 text-amber-800 border-amber-200',
  'Under Review': 'bg-blue-100 text-blue-800 border-blue-200',
  'Approved': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Rejected': 'bg-red-100 text-red-800 border-red-200',
  'More Info Requested': 'bg-purple-100 text-purple-800 border-purple-200',
};

const statusFilters: ApplicationStatus[] = ['Pending', 'Under Review', 'Approved', 'Rejected', 'More Info Requested'];

export default function AdminApplications() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'All'>('All');
  const [search, setSearch] = useState('');

  const { data: applications = [] } = useQuery({
    queryKey: ['applications'],
    queryFn: getApplications,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateStatusApi(id, status),
    onSuccess: (_, { id, status }) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      const label = status === 'Approved' ? '✅ Approved' : status === 'Rejected' ? '❌ Rejected' : `📋 ${status}`;
      toast.success(`Application ${id} → ${label}`);
    },
    onError: () => {
      toast.error('Failed to update application status');
    }
  });

  const filtered = applications
    .filter(a => filterStatus === 'All' || a.status === filterStatus)
    .filter(a => a.companyName.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()));

  const pendingCount = applications.filter(a => a.status === 'Pending').length;
  const reviewCount = applications.filter(a => a.status === 'Under Review').length;

  const updateStatus = (id: string, status: ApplicationStatus) => {
    updateMutation.mutate({ id, status });
  };

  const toggleDocVerified = (appId: string, docIndex: number) => {
    // Optimistic UI for document verification
    queryClient.setQueryData(['applications'], (old: ApplicationDto[] | undefined) => {
      if (!old) return old;
      return old.map(a => {
        if (a.id !== appId) return a;
        const docs = [...a.documents];
        docs[docIndex] = { ...docs[docIndex], verified: !docs[docIndex].verified };
        return { ...a, documents: docs };
      });
    });
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">License Applications</h1>
        <p className="text-sm text-muted-foreground">Review, verify documents, and approve/reject aggregator license applications.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: applications.length, color: 'text-foreground' },
          { label: 'Pending', value: pendingCount, color: 'text-amber-600' },
          { label: 'Under Review', value: reviewCount, color: 'text-blue-600' },
          { label: 'Approved', value: applications.filter(a => a.status === 'Approved').length, color: 'text-emerald-600' },
        ].map(c => (
          <div key={c.label} className="glass rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{c.label}</p>
            <p className={cn("text-2xl font-heading font-bold mt-1", c.color)}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/30"
            placeholder="Search by company or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setFilterStatus('All')}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border", filterStatus === 'All' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/40')}
          >All</button>
          {statusFilters.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border", filterStatus === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:border-primary/40')}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="glass rounded-xl p-12 text-center text-muted-foreground text-sm">No applications match your filter.</div>
        )}
        {filtered.map(app => {
          const isExpanded = expandedId === app.id;
          const docsVerified = app.documents.filter(d => d.verified).length;
          const docsTotal = app.documents.length;

          return (
            <div key={app.id} className="glass rounded-xl overflow-hidden transition-shadow hover:shadow-lg">
              {/* Header Row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : app.id)}
                className="w-full px-5 py-4 flex items-center gap-4 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-heading font-semibold text-sm truncate">{app.companyName}</p>
                    <Badge className={cn("text-[10px] font-bold border", statusColors[app.status as ApplicationStatus])}>{app.status}</Badge>
                    <Badge variant="outline" className="text-[10px]">{app.companyType}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {app.id} · Filed {app.filedDate} · {app.categories.join(', ')} · Docs {docsVerified}/{docsTotal}
                  </p>
                </div>
                <div className="shrink-0 text-muted-foreground">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-border">
                  <div className="grid md:grid-cols-2 gap-6 pt-5">
                    {/* Company Info */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Company Details</h4>
                      <div className="space-y-2.5 text-sm">
                        <div className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-muted-foreground" /> <span className="text-muted-foreground">CIN:</span> <span className="font-medium font-mono text-xs">{app.cin}</span></div>
                        <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-muted-foreground" /> <span className="text-muted-foreground">Contact:</span> <span className="font-medium">{app.contactName}</span></div>
                        <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-muted-foreground" /> <span className="font-medium text-xs">{app.contactEmail}</span></div>
                        <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-muted-foreground" /> <span className="font-medium text-xs">{app.contactPhone}</span></div>
                        <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-muted-foreground" /> <span className="font-medium text-xs">{app.address}</span></div>
                        <div className="flex items-center gap-2"><Leaf className="w-3.5 h-3.5 text-accent" /> <span className="text-accent font-semibold text-xs">{app.evCommitment}</span></div>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Fleet Categories</h4>
                        <div className="flex gap-2 flex-wrap">
                          {app.categories.map(c => (
                            <span key={c} className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-accent/10 text-accent border border-accent/20">{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Document Verification */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Document Checklist (DC Verification)</h4>
                      <div className="space-y-2">
                        {app.documents.map((doc, di) => (
                          <div key={doc.name} className={cn("flex items-center justify-between rounded-lg border p-3 transition-all", doc.verified ? 'bg-emerald-50 border-emerald-200' : doc.uploaded ? 'bg-card border-border' : 'bg-red-50 border-red-200')}>
                            <div className="flex items-center gap-2.5">
                              <div className={cn("w-6 h-6 rounded-md flex items-center justify-center text-[10px]", doc.verified ? 'bg-emerald-500 text-white' : doc.uploaded ? 'bg-secondary text-muted-foreground' : 'bg-red-200 text-red-600')}>
                                {doc.verified ? <Check className="w-3 h-3" /> : doc.uploaded ? <FileText className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              </div>
                              <div>
                                <p className="text-xs font-medium">{doc.name}</p>
                                <p className="text-[10px] text-muted-foreground">{!doc.uploaded ? 'Not uploaded' : doc.verified ? 'Verified ✓' : 'Pending verification'}</p>
                              </div>
                            </div>
                            {doc.uploaded && (
                              <div className="flex gap-1.5">
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px]" onClick={() => {}}><Eye className="w-3 h-3" /></Button>
                                <Button
                                  size="sm"
                                  variant={doc.verified ? 'outline' : 'default'}
                                  className={cn("h-7 px-2.5 text-[10px] font-bold", doc.verified ? 'border-emerald-300 text-emerald-700' : 'bg-primary')}
                                  onClick={() => toggleDocVerified(app.id, di)}
                                >
                                  {doc.verified ? 'Undo' : 'Verify'}
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {(app.status === 'Pending' || app.status === 'Under Review' || app.status === 'More Info Requested') && (
                    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => updateStatus(app.id, 'More Info Requested')}>
                        <MessageSquare className="w-3.5 h-3.5" /> Request More Info
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={() => updateStatus(app.id, 'Rejected')}>
                        <X className="w-3.5 h-3.5" /> Reject
                      </Button>
                      {app.status !== 'Under Review' && (
                        <Button size="sm" className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700" onClick={() => updateStatus(app.id, 'Under Review')}>
                          <Eye className="w-3.5 h-3.5" /> Take for Review
                        </Button>
                      )}
                      <Button variant="accent" size="sm" className="gap-1.5 text-xs" onClick={() => updateStatus(app.id, 'Approved')}>
                        <Check className="w-3.5 h-3.5" /> Approve License
                      </Button>
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
