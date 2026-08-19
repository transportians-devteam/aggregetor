import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { auth } = useAuth();
  const [navigationOpen, setNavigationOpen] = useState(false);
  if (!auth.isLoggedIn) return null;
  const home = auth.role === 'aggregator' || auth.role === 'dsp' ? '/dashboard' : '/admin';

  return <div className="min-h-dvh w-full bg-background md:flex md:items-start">
    <div className="sticky top-0 z-30 hidden h-dvh shrink-0 border-r border-sidebar-border shadow-sm md:block"><AppSidebar /></div>

    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/95 px-4 shadow-sm backdrop-blur md:hidden">
      <Link to={home} className="flex min-w-0 items-center gap-2"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar"><Zap className="h-5 w-5 text-sidebar-primary" /></span><span className="min-w-0"><b className="block text-sm">GACP</b><small className="block truncate text-[10px] capitalize text-muted-foreground">{auth.role?.replaceAll('_', ' ')}</small></span></Link>
      <button type="button" aria-label="Open navigation" aria-expanded={navigationOpen} onClick={() => setNavigationOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-lg border bg-card"><Menu className="h-5 w-5" /></button>
    </header>

    {navigationOpen && <div className="fixed inset-0 z-50 md:hidden"><button aria-label="Close navigation" className="absolute inset-0 bg-black/55" onClick={() => setNavigationOpen(false)} /><div className="absolute inset-y-0 left-0 max-w-[86vw] shadow-2xl"><AppSidebar mobile onNavigate={() => setNavigationOpen(false)} /></div><button aria-label="Close navigation" onClick={() => setNavigationOpen(false)} className="absolute left-[calc(min(86vw,18rem)-3rem)] top-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white"><X className="h-5 w-5" /></button></div>}

    <main className="min-w-0 flex-1"><div className="grain min-h-[calc(100dvh-4rem)] md:min-h-dvh"><div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 md:p-8">{children}</div></div></main>
  </div>;
}
