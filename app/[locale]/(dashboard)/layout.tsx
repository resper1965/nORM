import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: React.ReactNode }) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    return <DashboardLayout>{children}</DashboardLayout>;
  } catch (error) {
    // If there's any error, redirect to login
    redirect('/login');
  }
}

