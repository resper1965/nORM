import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ReputationScoreCard } from '@/components/dashboard/reputation-score-card';
import { AlertsList } from '@/components/dashboard/alerts-list';
import { SERPPositionGrid } from '@/components/dashboard/serp-position-grid';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const clientId = params.id;

  // Verify access
  const { data: clientUser } = await supabase
    .from('client_users')
    .select('role')
    .eq('user_id', user.id)
    .eq('client_id', clientId)
    .single();

  if (!clientUser) {
    notFound();
  }

  // Get client details
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (clientError || !client) {
    notFound();
  }

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

  return (
    <div className="container mx-auto py-8 space-y-6 text-foreground">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/clients" className="text-primary hover:text-primary/80 transition-colors mb-2 inline-block">
            ← Back to Clients
          </Link>
          <h1 className="text-3xl font-semibold tracking-[0.01em]">{client.name}</h1>
          {client.industry && (
            <p className="text-muted-foreground mt-1">{client.industry}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/clients/${clientId}/settings`}>Settings</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReputationScoreCard score={reputation} isLoading={!reputation} />
        <AlertsList alerts={alerts.alerts || []} isLoading={!alertsRes} />
      </div>

      <SERPPositionGrid results={serp.results || []} isLoading={!serpRes} />
    </div>
  );
}

