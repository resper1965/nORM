import { Sidebar } from './sidebar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="p-8 space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}

