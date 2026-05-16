import { DashboardLayout } from '@/components/DashboardLayout';
import { Car, Users, Upload, Trash2, AlertTriangle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const vehicleData = [
  { reg: 'DL01AB1234', type: '4W', fuel: 'EV', status: 'active' },
  { reg: 'DL02CD5678', type: '2W', fuel: 'Petrol', status: 'active' },
  { reg: 'DL03EF9012', type: '4W', fuel: 'CNG', status: 'active' },
  { reg: 'DL04GH3456', type: '3W', fuel: 'EV', status: 'active' },
];

const driverData = [
  { name: 'Rajesh Kumar', dl: 'DL-0420110012345', expiry: '2028-03-10', status: 'active', challans: 1 },
  { name: 'Amit Singh', dl: 'DL-0520130054321', expiry: '2025-11-20', status: 'active', challans: 6 },
  { name: 'Sunil Verma', dl: 'DL-0620140098765', expiry: '2024-01-15', status: 'auto-flagged', challans: 2 },
];

const reasons = ['Sold', 'Scrapped', 'Transferred', 'Accident', 'Compliance Violation', 'Owner Request', 'Other'];

export default function Offboarding() {
  const [tab, setTab] = useState<'vehicle' | 'driver'>('vehicle');
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Offboarding</h1>
          <p className="text-sm text-muted-foreground mt-1">Remove vehicles and drivers from your fleet</p>
        </div>

        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
          <button onClick={() => { setTab('vehicle'); setSelected([]); }} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'vehicle' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <Car className="w-4 h-4 inline mr-2" />Vehicle Offboarding
          </button>
          <button onClick={() => { setTab('driver'); setSelected([]); }} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'driver' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <Users className="w-4 h-4 inline mr-2" />Driver Offboarding
          </button>
        </div>

        {selected.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <p className="text-sm font-medium flex-1">{selected.length} item(s) selected for offboarding</p>
            <select className="border border-border rounded-lg px-3 py-2 text-sm bg-background">
              <option value="">Select reason...</option>
              {reasons.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-2" />Confirm Offboarding</Button>
          </div>
        )}

        {tab === 'vehicle' ? (
          <div className="space-y-4">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Search vehicles..." className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm bg-background" />
              </div>
              <Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-2" />Bulk CSV Offboard</Button>
            </div>

            <div className="glass rounded-xl overflow-hidden border border-border">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/30">
                  <th className="p-3 w-10"><input type="checkbox" className="rounded" /></th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Reg No</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Fuel</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                </tr></thead>
                <tbody>
                  {vehicleData.map(v => (
                    <tr key={v.reg} className={`border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer ${selected.includes(v.reg) ? 'bg-destructive/5' : ''}`} onClick={() => toggleSelect(v.reg)}>
                      <td className="p-3"><input type="checkbox" checked={selected.includes(v.reg)} readOnly className="rounded" /></td>
                      <td className="p-3 font-mono font-medium">{v.reg}</td>
                      <td className="p-3">{v.type}</td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${v.fuel === 'EV' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{v.fuel}</span></td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">{v.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="glass rounded-xl p-4 border border-amber-200 bg-amber-50/50">
              <p className="text-sm font-medium text-amber-800"><AlertTriangle className="w-4 h-4 inline mr-2" />Auto-offboarding triggers: Expired DL (&gt;30 days), Pending challans (&gt;5), Suspended license</p>
            </div>
            <div className="glass rounded-xl overflow-hidden border border-border">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/30">
                  <th className="p-3 w-10"><input type="checkbox" className="rounded" /></th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">DL Number</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">DL Expiry</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Challans</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                </tr></thead>
                <tbody>
                  {driverData.map(d => (
                    <tr key={d.dl} className={`border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer ${selected.includes(d.dl) ? 'bg-destructive/5' : ''}`} onClick={() => toggleSelect(d.dl)}>
                      <td className="p-3"><input type="checkbox" checked={selected.includes(d.dl)} readOnly className="rounded" /></td>
                      <td className="p-3 font-medium">{d.name}</td>
                      <td className="p-3 font-mono text-xs">{d.dl}</td>
                      <td className="p-3 text-muted-foreground">{d.expiry}</td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${d.challans > 5 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{d.challans}</span></td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${d.status === 'auto-flagged' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{d.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
