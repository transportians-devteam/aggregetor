import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Download, Filter, Search, ChevronDown, Activity, Car, Zap, FileText } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyVehicles } from '@/services/vehicleService';

export default function Fleet() {
  const [activeTab, setActiveTab] = useState('4W');
  const { data: fleetData = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getMyVehicles
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="font-heading text-2xl font-bold text-foreground">My Fleet</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 text-primary border-primary/20 bg-primary/5 hover:bg-primary/10">
              <Activity className="w-4 h-4" /> Activity
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> Export
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>
        </div>

        {/* Top Data Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-4 border border-border flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Vehicles</p>
              <p className="text-2xl font-heading font-bold text-foreground mt-1">1,240</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Car className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="glass rounded-xl p-4 border border-border flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active EVs</p>
              <p className="text-2xl font-heading font-bold text-green-600 mt-1">558</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="glass rounded-xl p-4 border border-border flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Compliance Issues</p>
              <p className="text-2xl font-heading font-bold text-amber-600 mt-1">12</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="glass rounded-xl border border-border p-6 shadow-sm bg-background">
          
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {['2W', '3W', '4W'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
                  activeTab === tab 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Controls: Show Entries & Search */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Show</span>
              <div className="relative">
                <select className="appearance-none bg-muted/50 border border-border rounded-md px-3 py-1.5 pr-8 outline-none focus:ring-2 focus:ring-primary/20">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Search:</span>
              <div className="relative">
                <input 
                  type="text" 
                  className="bg-muted/30 border border-border rounded-md px-3 py-1.5 w-48 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left py-4 px-2 font-semibold text-muted-foreground whitespace-nowrap">S. No</th>
                  <th className="text-left py-4 px-2 font-semibold text-muted-foreground whitespace-nowrap">Vehicle No</th>
                  <th className="text-left py-4 px-2 font-semibold text-muted-foreground whitespace-nowrap">Category</th>
                  <th className="text-left py-4 px-2 font-semibold text-muted-foreground whitespace-nowrap">Vehicle Type</th>
                  <th className="text-left py-4 px-2 font-semibold text-muted-foreground whitespace-nowrap">Fuel</th>
                  <th className="text-left py-4 px-2 font-semibold text-muted-foreground whitespace-nowrap">RC Status</th>
                  <th className="text-left py-4 px-2 font-semibold text-muted-foreground whitespace-nowrap">Insurance</th>
                  <th className="text-left py-4 px-2 font-semibold text-muted-foreground whitespace-nowrap">Pucc</th>
                  <th className="text-left py-4 px-2 font-semibold text-muted-foreground whitespace-nowrap">License Verified</th>
                  <th className="text-center py-4 px-2 font-semibold text-muted-foreground whitespace-nowrap">Details</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={10} className="text-center py-8 text-muted-foreground">Loading fleet data...</td></tr>
                ) : fleetData.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-8 text-muted-foreground">No vehicles found. Onboard some vehicles first.</td></tr>
                ) : fleetData.map((row, i) => (
                  <tr key={row.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors last:border-0">
                    <td className="py-4 px-2 font-medium text-muted-foreground whitespace-nowrap">{i + 1}</td>
                    <td className="py-4 px-2 font-mono font-medium whitespace-nowrap">{row.registrationNumber}</td>
                    <td className="py-4 px-2 text-muted-foreground whitespace-nowrap">{row.category}</td>
                    <td className="py-4 px-2 font-medium text-foreground whitespace-nowrap">{row.vehicleClass}</td>
                    <td className="py-4 px-2 text-muted-foreground whitespace-nowrap">{row.fuelType}</td>
                    <td className="py-4 px-2 text-muted-foreground whitespace-nowrap">Active</td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      {row.insuranceStatus === 'ACTIVE' ? (
                        <span className="text-foreground font-medium uppercase">{row.insuranceStatus}</span>
                      ) : (
                        <span className="bg-red-500 text-white px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm">{row.insuranceStatus}</span>
                      )}
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      {row.puccStatus === 'ACTIVE' || row.puccStatus === 'Not Applicable' ? (
                        <span className="text-muted-foreground">{row.puccStatus}</span>
                      ) : (
                        <span className="bg-red-500 text-white px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm">{row.puccStatus}</span>
                      )}
                    </td>
                    <td className="py-4 px-2 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${row.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {row.status === 'ACTIVE' ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-center whitespace-nowrap">
                      <button className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-1.5 rounded-md text-xs font-bold transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination (dummy visually) */}
          <div className="flex items-center justify-between mt-6 text-sm text-muted-foreground">
            <p>Showing 1 to 6 of 6 entries</p>
            <div className="flex gap-1">
              <button className="px-3 py-1 rounded border border-border hover:bg-muted disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 rounded border border-primary bg-primary/10 text-primary font-medium">1</button>
              <button className="px-3 py-1 rounded border border-border hover:bg-muted disabled:opacity-50" disabled>Next</button>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
