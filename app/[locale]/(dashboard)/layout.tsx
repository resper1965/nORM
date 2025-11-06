import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

