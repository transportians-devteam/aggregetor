import { DashboardLayout } from '@/components/DashboardLayout';
import { Building2, User, FileText, Mail, Phone, MapPin, Edit2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Profile() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">My Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">Company details and compliance officer information</p>
          </div>
          <Button variant="outline" size="sm"><Edit2 className="w-4 h-4 mr-2" />Edit Profile</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Company Details */}
          <div className="glass rounded-xl border border-border p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary"><Building2 className="w-5 h-5" /></div>
              <h2 className="font-heading font-semibold">Company Details</h2>
            </div>
            {[
              { label: 'Company Name', value: 'Delhi EV Transit Pvt. Ltd.' },
              { label: 'License Number', value: 'GACP-2024-00147' },
              { label: 'GST Number', value: '07AABCT1234F1ZV' },
              { label: 'PAN Number', value: 'AABCT1234F' },
              { label: 'Registered Address', value: 'Plot 42, Sector 18, Dwarka, New Delhi — 110075' },
              { label: 'License Expiry', value: '2027-03-31' },
              { label: 'Status', value: 'Active' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-start">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{item.label}</span>
                <span className="text-sm font-medium text-right max-w-[60%]">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Compliance Officer */}
          <div className="glass rounded-xl border border-border p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary"><User className="w-5 h-5" /></div>
              <h2 className="font-heading font-semibold">Compliance Officer</h2>
            </div>
            {[
              { label: 'Name', value: 'Priya Sharma', icon: User },
              { label: 'Email', value: 'priya.sharma@delhievtransit.com', icon: Mail },
              { label: 'Phone', value: '+91 98765 43210', icon: Phone },
              { label: 'Designation', value: 'Head of Fleet Compliance', icon: Building2 },
              { label: 'Office Address', value: 'Tower B, 4th Floor, Dwarka', icon: MapPin },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="glass rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border mb-5">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary"><FileText className="w-5 h-5" /></div>
            <h2 className="font-heading font-semibold">Uploaded Documents</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'GST Certificate', status: 'verified', date: '2024-01-15' },
              { name: 'PAN Card', status: 'verified', date: '2024-01-15' },
              { name: 'Aggregator License', status: 'verified', date: '2024-03-01' },
              { name: 'Bank Guarantee', status: 'pending', date: '2026-03-20' },
            ].map(doc => (
              <div key={doc.name} className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <FileText className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium mb-1">{doc.name}</p>
                <p className="text-xs text-muted-foreground mb-2">Uploaded: {doc.date}</p>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${doc.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{doc.status}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4"><Upload className="w-4 h-4 mr-2" />Upload New Document</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
