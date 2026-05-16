import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({ label, value, icon, trend, trendUp, className }: StatCardProps) {
  return (
    <div className={cn("glass rounded-xl p-5 animate-count-up", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-heading font-bold mt-1">{value}</p>
          {trend && (
            <p className={cn("text-xs mt-1 font-medium", trendUp ? "text-accent" : "text-destructive")}>
              {trend}
            </p>
          )}
        </div>
        <div className="p-2 rounded-lg bg-accent/10 text-accent">
          {icon}
        </div>
      </div>
    </div>
  );
}
