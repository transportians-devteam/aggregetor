import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, BarChart3, Bell, Car, ChevronLeft, ChevronRight, CircleHelp, Clock, FileCheck, FileText, Gauge, GitBranch, Leaf, LogOut, Radio, Settings2, ShieldCheck, User, UserMinus, UserPlus, Wallet } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  listApplicationsForReview,
  listAppellateApplications,
  listMyApplications,
  listDocuments,
} from '@/services/registrationService';
import { listNotifications } from '@/services/notificationService';

const operatorNav = [
  ['Dashboard', Gauge, '/dashboard'], ['My Fleet', Car, '/fleet'], ['Onboarding', UserPlus, '/onboarding'],
  ['Applications', FileText, '/applications'], ['Reports', BarChart3, '/reports'],
  ['System Offboarding', UserMinus, '/offboarding'], ['Compliance', Leaf, '/ev-compliance'],
  ['Safety & CCC', Radio, '/safety'],
  ['Penalties', AlertTriangle, '/penalties'], ['Activity', Clock, '/history'], ['Wallet', Wallet, '/wallet'],
  ['Notifications', Bell, '/notifications'], ['My Profile', User, '/profile'], ['Help', CircleHelp, '/help'],
  ['Process Flow', GitBranch, '/process-flow'],
] as const;
const authorityNav = [
  ['Authority Dashboard', Gauge, '/admin'], ['Applications', FileCheck, '/admin/applications'],
  ['Compliance', ShieldCheck, '/admin/compliance'], ['Enforcement', AlertTriangle, '/admin/enforcement'],
  ['Safety & CCC', Radio, '/safety'],
  ['Government MIS', Car, '/admin/mis'], ['Notifications', Bell, '/notifications'], ['My Profile', User, '/profile'],
  ['Portal Content', Settings2, '/admin/content'],
  ['Process Flow', GitBranch, '/process-flow'],
] as const;

export function AppSidebar({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { auth, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const isOperator = auth.role === 'aggregator' || auth.role === 'dsp';
  const compact = !mobile && collapsed;
  const appellateOnly = auth.role === 'appellate_officer';
  const isAuthority = !isOperator && Boolean(auth.role) && auth.role !== 'enforcement';

  // Authority applications query - automatically refetches when authority actions occur
  const authorityAppsQuery = useQuery({
    queryKey: ['authority-applications', auth.role],
    queryFn: appellateOnly ? listAppellateApplications : () => listApplicationsForReview(),
    enabled: isAuthority,
    staleTime: 10_000,
  });

  // Operator applications query - automatically refetches when operator submits or appeals
  const operatorAppsQuery = useQuery({
    queryKey: ['my-applications'],
    queryFn: listMyApplications,
    enabled: isOperator,
    staleTime: 10_000,
  });

  const latestOperatorApp = operatorAppsQuery.data?.[0];
  const hasActiveLicense = Boolean(
    operatorAppsQuery.data?.some((app) => app.status === 'LICENSE_ISSUED')
  );

  // Documents query for the operator's active application to catch reverted documents
  const operatorDocsQuery = useQuery({
    queryKey: ['application-documents', latestOperatorApp?.id],
    queryFn: () => listDocuments(latestOperatorApp!.id),
    enabled: isOperator && Boolean(latestOperatorApp?.id),
    staleTime: 10_000,
  });

  const revertedDocsCount = (operatorDocsQuery.data ?? []).filter(
    (d) => d.verificationStatus === 'REJECTED' && d.currentVersion
  ).length;

  const preLicenseAllowedLabels = new Set([
    'Applications',
    'Notifications',
    'My Profile',
    'Process Flow',
    'Help',
  ]);

  const items = (isOperator ? operatorNav : authorityNav).filter(([label]) => {
    if (isOperator && !hasActiveLicense) {
      return preLicenseAllowedLabels.has(label);
    }
    if (label === 'Applications') return auth.role !== 'enforcement';
    if (label === 'Compliance') return auth.role !== 'appellate_officer';
    if (label === 'Enforcement') return auth.role !== 'officer';
    if (label === 'Government MIS') return auth.role !== 'appellate_officer';
    if (label === 'Portal Content') return auth.role === 'admin';
    return true;
  });

  // Unread notifications query
  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: listNotifications,
    enabled: Boolean(auth.user),
    staleTime: 15_000,
  });

  const unreadNotificationsCount = (notificationsQuery.data ?? []).filter((n) => !n.readAt).length;

  // Calculate pending count requiring action based on role
  const pendingCount = (() => {
    if (isAuthority && authorityAppsQuery.data) {
      return authorityAppsQuery.data.filter((app) =>
        app.status === 'SUBMITTED' ||
        app.status === 'UNDER_REVIEW' ||
        app.status === 'DC_APPROVED' ||
        app.status === 'APPEAL_SUBMITTED' ||
        app.status === 'APPELLATE_REVIEW_PENDING' ||
        app.status === 'UNDER_APPELLATE_REVIEW' ||
        app.status === 'APPELLATE_APPROVED'
      ).length;
    }
    if (isOperator && operatorAppsQuery.data) {
      const hasDeficiency = operatorAppsQuery.data.some((app) => app.status === 'DEFICIENCY_RAISED');
      return revertedDocsCount > 0 ? revertedDocsCount : (hasDeficiency ? 1 : 0);
    }
    return 0;
  })();

  return (
    <aside
      className={cn(
        'relative flex h-full max-h-dvh flex-col bg-sidebar text-sidebar-foreground transition-all duration-200 select-none',
        compact ? 'w-16' : mobile ? 'w-[86vw] max-w-72' : 'w-72 md:w-64'
      )}
    >
      <div className="shrink-0 border-b border-sidebar-border p-4">
        <Link onClick={onNavigate} to={isOperator ? (hasActiveLicense ? '/dashboard' : '/applications') : '/admin'} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
            <img
              src="/delhi-sarkar.png"
              alt="Delhi Sarkar"
              className="h-8 w-auto object-contain brightness-0 invert"
            />
          </div>
          {!compact && (
            <span className="min-w-0">
              <b className="block text-sm leading-tight">GACP</b>
              <small className="block truncate text-sidebar-foreground/60 text-[10px]">
                Transport Dept · NCT Delhi
              </small>
            </span>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2 py-3 no-scrollbar">
        {items.map(([label, Icon, path]) => {
          const isApplicationsItem = label === 'Applications';
          const isNotificationsItem = label === 'Notifications';
          const badgeCount = isApplicationsItem
            ? pendingCount
            : isNotificationsItem
              ? unreadNotificationsCount
              : 0;
          const showBadge = badgeCount > 0;

          return (
            <Link
              onClick={onNavigate}
              key={path}
              to={path}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                location.pathname === path
                  ? 'bg-sidebar-accent font-semibold text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
              )}
            >
              <div className="relative shrink-0">
                <Icon className="h-4 w-4" />
                {compact && showBadge && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-amber-500 ring-2 ring-sidebar" />
                )}
              </div>
              {!compact && (
                <>
                  <span className="truncate flex-1">{label}</span>
                  {showBadge && (
                    <span
                      className={cn(
                        "ml-auto inline-flex items-center justify-center rounded-full px-2 py-0.2 text-[10px] font-bold ring-1 ring-inset",
                        isOperator && isApplicationsItem && revertedDocsCount > 0
                          ? "bg-rose-500 text-white ring-rose-500/30 animate-pulse"
                          : "bg-amber-500 text-amber-100 ring-amber-500/30"
                      )}
                    >
                      {isOperator && isApplicationsItem && revertedDocsCount > 0
                        ? `${badgeCount} Reverted`
                        : badgeCount}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-4">
        {!compact && (
          <div className="mb-3 min-w-0">
            <p className="truncate text-xs font-medium">{auth.user?.name}</p>
            <p className="truncate text-[10px] capitalize text-sidebar-foreground/50">{auth.role?.replaceAll('_', ' ')}</p>
          </div>
        )}
        <button
          onClick={() => void logout()}
          className="flex w-full items-center gap-2 text-xs text-sidebar-foreground/60 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!compact && 'Sign out'}
        </button>
      </div>

      {!mobile && (
        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={() => setCollapsed(value => !value)}
          className="absolute -right-3 top-20 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-sm transition hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      )}
    </aside>
  );
}
