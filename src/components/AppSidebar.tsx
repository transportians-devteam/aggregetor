import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, BarChart3, Bell, Car, ChevronLeft, ChevronRight, CircleHelp, Clock, FileCheck, FileText, Gauge, Leaf, LogOut, Settings2, ShieldCheck, User, UserMinus, UserPlus, Wallet, Zap } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const operatorNav = [
  ['Dashboard', Gauge, '/dashboard'], ['My Fleet', Car, '/fleet'], ['Onboarding', UserPlus, '/onboarding'],
  ['Applications', FileText, '/applications'], ['Reports', BarChart3, '/reports'],
  ['System Offboarding', UserMinus, '/offboarding'], ['Compliance', Leaf, '/ev-compliance'],
  ['Penalties', AlertTriangle, '/penalties'], ['Activity', Clock, '/history'], ['Wallet', Wallet, '/wallet'],
  ['Notifications', Bell, '/notifications'], ['My Profile', User, '/profile'], ['Help', CircleHelp, '/help'],
] as const;
const authorityNav = [
  ['Authority Dashboard', Gauge, '/admin'], ['Applications', FileCheck, '/admin/applications'],
  ['Compliance', ShieldCheck, '/admin/compliance'], ['Enforcement', AlertTriangle, '/admin/enforcement'],
  ['Government MIS', Car, '/admin/mis'], ['Notifications', Bell, '/notifications'], ['My Profile', User, '/profile'],
  ['Portal Content', Settings2, '/admin/content'],
] as const;

export function AppSidebar({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { auth, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const isOperator = auth.role === 'aggregator' || auth.role === 'dsp';
  const items = (isOperator ? operatorNav : authorityNav).filter(([label]) => {
    if (label === 'Applications') return auth.role !== 'enforcement';
    if (label === 'Compliance') return auth.role !== 'appellate_officer';
    if (label === 'Enforcement') return auth.role !== 'officer';
    if (label === 'Government MIS') return auth.role !== 'appellate_officer';
    if (label === 'Portal Content') return auth.role === 'admin';
    return true;
  });
  const compact = !mobile && collapsed;
  return <aside className={cn('relative flex h-full min-h-dvh flex-col overflow-y-auto bg-sidebar text-sidebar-foreground transition-all', compact ? 'w-16' : mobile ? 'w-[86vw] max-w-72' : 'w-72 md:w-64')}>
    <div className="border-b border-sidebar-border p-4"><Link onClick={onNavigate} to={isOperator ? '/dashboard' : '/admin'} className="flex items-center gap-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary"><Zap className="h-5 w-5 text-sidebar-primary-foreground" /></span>{!compact && <span className="min-w-0"><b className="block text-sm">GACP</b><small className="block truncate text-sidebar-foreground/60">Transport Dept · NCT Delhi</small></span>}</Link></div>
    <nav className="flex-1 space-y-1 px-2 py-4">{items.map(([label, Icon, path]) => <Link onClick={onNavigate} key={path} to={path} className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm', location.pathname === path ? 'bg-sidebar-accent font-semibold text-sidebar-primary' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50')}><Icon className="h-4 w-4 shrink-0" />{!compact && label}</Link>)}</nav>
    <div className="border-t border-sidebar-border p-4">{!compact && <div className="mb-3 min-w-0"><p className="truncate text-xs font-medium">{auth.user?.name}</p><p className="truncate text-[10px] capitalize text-sidebar-foreground/50">{auth.role?.replaceAll('_', ' ')}</p></div>}<button onClick={() => void logout()} className="flex w-full items-center gap-2 text-xs text-sidebar-foreground/60 hover:text-destructive"><LogOut className="h-4 w-4" />{!compact && 'Sign out'}</button></div>
    {!mobile && <button aria-label="Toggle sidebar" onClick={() => setCollapsed(value => !value)} className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-sidebar">{collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}</button>}
  </aside>;
}
