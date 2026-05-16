import { ReactNode } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { auth } = useAuth();

  if (!auth.isLoggedIn) return null;

  return (
    <div className="flex min-h-screen w-full items-start">
      <div className="sticky top-0 h-screen shrink-0 border-r border-sidebar-border shadow-sm z-30">
        <AppSidebar />
      </div>
      <main className="flex-1 w-full min-w-0">
        <div className="grain min-h-screen">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
