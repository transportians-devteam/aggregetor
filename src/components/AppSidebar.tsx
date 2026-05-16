import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Car, Leaf, Wallet, MessageSquare,
  ShieldCheck, Users, LogOut, Zap, ChevronLeft, ChevronRight,
  UserPlus, UserMinus, AlertTriangle, Clock, User, HelpCircle, Lock
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const aggregatorNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'My Fleet', icon: Car, path: '/fleet' },
  { label: 'Onboarding', icon: UserPlus, path: '/onboarding' },
  { label: 'Offboarding', icon: UserMinus, path: '/offboarding' },
  { label: 'EV Compliance', icon: Leaf, path: '/ev-compliance' },
  { label: 'My Penalties', icon: AlertTriangle, path: '/penalties' },
  { label: 'History', icon: Clock, path: '/history' },
  { label: 'Fee & Wallet', icon: Wallet, path: '/wallet' },
  { label: 'My Profile', icon: User, path: '/profile' },
  { label: 'Grievance Centre', icon: MessageSquare, path: '/grievances' },
  { label: 'Help', icon: HelpCircle, path: '/help' },
  { label: 'Change Password', icon: Lock, path: '/change-password' },
];

const officerNav = [
  { label: 'Admin Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Aggregators & DSPs', icon: ShieldCheck, path: '/admin/aggregators' },
  { label: 'License Applications', icon: Users, path: '/admin/applications' },
  { label: 'Fleet Verification', icon: Car, path: '/admin/fleet-verify' },
  { label: 'EV Compliance', icon: Leaf, path: '/admin/ev-monitor' },
  { label: 'Penalties & Actions', icon: AlertTriangle, path: '/admin/penalties' },
  { label: 'Grievance Review', icon: MessageSquare, path: '/admin/grievances' },
];

const enforcementNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Fleet Verification', icon: Car, path: '/fleet' },
  { label: 'Compliance Check', icon: ShieldCheck, path: '/ev-compliance' },
];

export function AppSidebar() {
  const { auth, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = auth.role === 'officer' ? officerNav
    : auth.role === 'enforcement' ? enforcementNav
    : aggregatorNav;

  return (
    <aside className={cn(
      "flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 min-h-screen relative",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-heading font-bold text-sm text-sidebar-accent-foreground">GACP</p>
              <p className="text-[10px] text-sidebar-foreground/60 leading-tight">Transport Dept · NCT Delhi</p>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const active = item.path === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User & logout */}
      <div className="p-4 border-t border-sidebar-border">
        {!collapsed && auth.user && (
          <div className="mb-3">
            <p className="text-xs font-medium text-sidebar-accent-foreground">{auth.user.name}</p>
            <p className="text-[10px] text-sidebar-foreground/50">{auth.user.company || auth.user.designation}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs text-sidebar-foreground/50 hover:text-destructive transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && 'Sign Out'}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border flex items-center justify-center text-sidebar-foreground/50 hover:text-sidebar-primary transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
