import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/StatCard';
import { feeStructure, formatINR } from '@/lib/mockData';
import { Wallet as WalletIcon, CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { getMyWallet } from '@/services/walletService';

export default function WalletPage() {
  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: getMyWallet
  });

  const transactions = wallet?.transactions || [];
  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Fee & Wallet</h1>
          <p className="text-sm text-muted-foreground">Manage payments and view transactions</p>
        </div>
        <Button variant="accent" className="gap-2">
          <CreditCard className="w-4 h-4" /> Pay Now
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <StatCard label="Wallet Balance" value={isLoading ? 'Loading...' : formatINR(wallet?.balance || 0)} icon={<WalletIcon className="w-5 h-5" />} trend="Current Balance" />
        <StatCard label="Total Fees Due" value={formatINR(0)} icon={<CreditCard className="w-5 h-5" />} trend="No pending fees" />
      </div>

      {/* Fee Breakdown */}
      <div className="glass rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-heading font-semibold text-sm">Annual Fee per Vehicle</h3>
          <p className="text-xs text-muted-foreground">EVs attract zero annual fee</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-5 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">Fuel Type</th>
                <th className="text-center px-5 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">2W</th>
                <th className="text-center px-5 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">3W</th>
                <th className="text-center px-5 py-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">4W</th>
              </tr>
            </thead>
            <tbody>
              {feeStructure.map((f) => (
                <tr key={f.fuelType} className={`border-b border-border/50 ${f.fuelType.includes('Electric') ? 'bg-accent/5' : ''}`}>
                  <td className="px-5 py-3 text-xs font-medium">{f.fuelType}</td>
                  <td className="px-5 py-3 text-center text-xs">{f.twoW}</td>
                  <td className="px-5 py-3 text-center text-xs">{f.threeW}</td>
                  <td className="px-5 py-3 text-center text-xs">{f.fourW}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-heading font-semibold text-sm">Transaction History</h3>
        </div>
        <div className="divide-y divide-border/50">
          {transactions.length === 0 && !isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No transactions found</div>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${t.transactionType === 'CREDIT' ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'}`}>
                    {t.transactionType === 'CREDIT' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{t.description || 'Wallet Transaction'}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(t.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · TXN-{t.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold font-mono ${t.transactionType === 'CREDIT' ? 'text-accent' : 'text-foreground'}`}>
                    {t.transactionType === 'CREDIT' ? '+' : '-'}{formatINR(t.amount)}
                  </p>
                  <Badge variant="outline" className="text-[10px]">SUCCESS</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
