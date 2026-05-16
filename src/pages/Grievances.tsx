import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { mockGrievances } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Clock } from 'lucide-react';

const statusColors: Record<string, string> = {
  Resolved: 'bg-accent text-accent-foreground',
  'Under Review': 'bg-warning text-warning-foreground',
  Pending: 'bg-secondary text-secondary-foreground',
};

export default function Grievances() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Grievance Centre</h1>
        <p className="text-sm text-muted-foreground">Submit complaints and track resolution · 24hr SLA acknowledgment</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Submit Form */}
        <div className="glass rounded-xl p-5">
          <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-accent" /> New Grievance
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject</label>
              <Input placeholder="Brief description" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
              <textarea
                className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Provide details of your grievance..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <Button variant="accent" className="w-full gap-2">
              <Send className="w-4 h-4" /> Submit Grievance
            </Button>
          </div>
        </div>

        {/* Grievance Table */}
        <div className="lg:col-span-2 glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-heading font-semibold text-sm">My Grievances</h3>
          </div>
          <div className="divide-y divide-border/50">
            {mockGrievances.map((g) => (
              <div key={g.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium">{g.subject}</p>
                  <p className="text-[10px] text-muted-foreground">{g.id} · Filed {g.filed}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" /> SLA: {g.slaDeadline}
                  </div>
                  <Badge className={statusColors[g.status] || ''}>{g.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
