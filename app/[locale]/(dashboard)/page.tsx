import { createClient } from '@/lib/supabase/server';
import { ReputationScoreCard } from '@/components/dashboard/reputation-score-card';
import { AlertsList } from '@/components/dashboard/alerts-list';
import { SERPPositionGrid } from '@/components/dashboard/serp-position-grid';
import { ReputationTrendChart } from '@/components/dashboard/reputation-trend-chart';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's clients
  const { data: clientUsers } = await supabase
    .from('client_users')
    .select('client_id')
    .eq('user_id', user.id)
    .limit(1);

  if (!clientUsers || clientUsers.length === 0) {
    // No clients yet, show onboarding
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Welcome to nORM</h1>
        <p className="text-gray-600 mb-4">
          Get started by adding your first client.
        </p>
        <a
          href="/clients/new"
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Client
        </a>
      </div>
    );
  }

  const clientId = clientUsers[0].client_id;

  // Fetch data in parallel
  const [reputationRes, alertsRes, serpRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/clients/${clientId}/reputation`, {
      headers: {
        'Cookie': (await import('next/headers')).cookies().toString(),
      },
    }).catch(() => null),
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/alerts?client_id=${clientId}&status=active&limit=10`, {
      headers: {
        'Cookie': (await import('next/headers')).cookies().toString(),
      },
    }).catch(() => null),
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/clients/${clientId}/serp`, {
      headers: {
        'Cookie': (await import('next/headers')).cookies().toString(),
      },
    }).catch(() => null),
  ]);

  const reputation = reputationRes?.ok ? await reputationRes.json() : null;
  const alerts = alertsRes?.ok ? await alertsRes.json() : { alerts: [] };
  const serp = serpRes?.ok ? await serpRes.json() : { results: [] };

  // Get reputation trend data
  const trendData = reputation
    ? [
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), score: reputation.score - (reputation.change || 0) },
        { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), score: reputation.score - (reputation.change || 0) * 0.6 },
        { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), score: reputation.score - (reputation.change || 0) * 0.3 },
        { date: new Date().toISOString(), score: reputation.score },
      ]
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReputationScoreCard score={reputation} isLoading={!reputation} />
        <AlertsList alerts={alerts.alerts || []} isLoading={!alertsRes} />
      </div>

      <ReputationTrendChart data={trendData} isLoading={!reputation} />

      <SERPPositionGrid results={serp.results || []} isLoading={!serpRes} />
    </div>
  );
}

