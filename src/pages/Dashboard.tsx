import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/StatCard';
import { Shield, Car, Leaf, Wallet, Clock, AlertTriangle } from 'lucide-react';
import { getDaysTo2030, formatINR } from '@/lib/mockData';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/services/dashboardService';

const COLORS = ['hsl(153,100%,42%)', 'hsl(220,14%,89%)'];

export default function Dashboard() {
  const { auth } = useAuth();
  const daysTo2030 = getDaysTo2030();
  
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  const evPercent = stats?.evPercent || 0;
  const evData = [
    { name: 'EV', value: evPercent },
    { name: 'Non-EV', value: 100 - evPercent },
  ];
  
  const categories = stats?.categories || [
    { label: '2-Wheeler', current: 0, target: 100, status: 'red' },
    { label: '3-Wheeler', current: 0, target: 25, status: 'red' },
    { label: '4-Wheeler', current: 0, target: 15, status: 'red' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, {auth.user?.name || 'User'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="License Status" value="Active" icon={<Shield className="w-5 h-5" />} trend="Valid until 31/12/2026" trendUp />
        <StatCard label="Fleet Size" value={(stats?.fleetSize || 0).toLocaleString('en-IN')} icon={<Car className="w-5 h-5" />} trend="Live Count" trendUp />
        <StatCard label="Wallet Balance" value={formatINR(stats?.walletBalance || 0)} icon={<Wallet className="w-5 h-5" />} />
        <StatCard label="Next Declaration" value="3 Days" icon={<Clock className="w-5 h-5" />} trend="Due 28/03/2026" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* EV Donut */}
        <div className="glass rounded-xl p-5">
          <h3 className="font-heading font-semibold text-sm mb-4">EV Fleet Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={evData} innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={0}>
                  {evData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center -mt-4">
            <p className="text-3xl font-heading font-bold text-accent">{evPercent}%</p>
            <p className="text-xs text-muted-foreground">Electric Vehicles</p>
          </div>
        </div>

        {/* EV Progress by Category */}
        <div className="glass rounded-xl p-5 lg:col-span-2">
          <h3 className="font-heading font-semibold text-sm mb-4">EV Compliance by Category</h3>
          <div className="space-y-5">
            {categories.map((cat) => (
              <div key={cat.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium">{cat.label}</span>
                  <span className="text-muted-foreground">{cat.current}% / {cat.target}% target</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      cat.status === 'green' ? 'bg-accent' : cat.status === 'amber' ? 'bg-warning' : 'bg-destructive'
                    }`}
                    style={{ width: `${(cat.current / cat.target) * 100}%` }}
                  />
                </div>
                {cat.status === 'red' && (
                  <p className="flex items-center gap-1 text-[10px] text-destructive mt-1">
                    <AlertTriangle className="w-3 h-3" /> Below compliance threshold
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2030 Countdown */}
      <div className="mt-6 glass rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent/10">
            <Leaf className="w-8 h-8 text-accent animate-pulse-glow" />
          </div>
          <div>
            <p className="font-heading font-bold text-lg">Mission 2030: 100% EV</p>
            <p className="text-xs text-muted-foreground">Mandatory full electric compliance by April 1, 2030</p>
          </div>
        </div>
        <div className="text-center sm:text-right">
          <p className="text-4xl font-heading font-extrabold text-accent">{daysTo2030.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">days remaining</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
