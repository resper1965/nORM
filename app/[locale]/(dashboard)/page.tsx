import { createClient } from '@/lib/supabase/server';
import { ReputationScoreCard } from '@/components/dashboard/reputation-score-card';
import { AlertsList } from '@/components/dashboard/alerts-list';
import { SERPPositionGrid } from '@/components/dashboard/serp-position-grid';
import { ReputationTrendChart } from '@/components/dashboard/reputation-trend-chart';
import { redirect } from 'next/navigation';
import { getUserClients } from '@/lib/auth/rbac';
import { calculateReputationScore, calculateTrend } from '@/lib/reputation/calculator';

export const dynamic = 'force-dynamic';

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

  // Calculate reputation score
  const periodEnd = new Date();
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - 30);

  let reputation = null;
  try {
    const { score, breakdown } = await calculateReputationScore({
      clientId,
      periodStart,
      periodEnd,
    });

    const previousPeriodEnd = periodStart;
    const previousPeriodStart = new Date(previousPeriodEnd);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);

    const { score: previousScore } = await calculateReputationScore({
      clientId,
      periodStart: previousPeriodStart,
      periodEnd: previousPeriodEnd,
    });

    const trend = calculateTrend(score, previousScore);
    const change = score - previousScore;

    reputation = {
      score,
      breakdown,
      trend,
      change: Math.round(change * 100) / 100,
    };
  } catch (error) {
    console.error('Error calculating reputation:', error);
  }

  // Get alerts
  const userClientIds = await getUserClients(user.id);
  const { data: alertsData } = await supabase
    .from('alerts')
    .select('*')
    .in('client_id', userClientIds)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(10);

  // Get SERP results
  const { data: serpData } = await supabase
    .from('serp_results')
    .select(`
      *,
      keywords!inner (
        id,
        keyword,
        client_id
      )
    `)
    .eq('keywords.client_id', clientId)
    .order('checked_at', { ascending: false })
    .limit(1000);

  // Get latest result for each keyword
  const keywordMap = new Map();
  for (const result of serpData || []) {
    const keywordId = (result as any).keywords.id;
    if (!keywordMap.has(keywordId)) {
      keywordMap.set(keywordId, result);
    }
  }

  const serpResults = Array.from(keywordMap.values()).map((result: any) => ({
    keyword: result.keywords.keyword,
    position: result.position,
    url: result.url,
    title: result.title,
    snippet: result.snippet,
    checked_at: result.checked_at,
  }));

  // Get reputation trend data
  const { data: scoresData } = await supabase
    .from('reputation_scores')
    .select('score, calculated_at')
    .eq('client_id', clientId)
    .gte('calculated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('calculated_at', { ascending: true });

  const trendData = (scoresData || []).map((score) => ({
    date: score.calculated_at,
    score: score.score,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReputationScoreCard score={reputation} isLoading={!reputation} />
        <AlertsList alerts={alertsData || []} isLoading={false} />
      </div>

      <ReputationTrendChart data={trendData} isLoading={false} />

      <SERPPositionGrid results={serpResults} isLoading={false} />
    </div>
  );
}
