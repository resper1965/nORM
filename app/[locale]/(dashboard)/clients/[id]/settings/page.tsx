import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { requireClientAccess } from '@/lib/auth/rbac';
import { ClientSettingsForm } from '@/components/clients/client-settings-form';
import Link from 'next/link';

export default async function ClientSettingsPage({
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

  // Verify access (admin or editor)
  await requireClientAccess(user.id, clientId, 'editor');

  // Get client details
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (clientError || !client) {
    notFound();
  }

  // Get keywords
  const { data: keywords } = await supabase
    .from('keywords')
    .select('*')
    .eq('client_id', clientId)
    .order('keyword', { ascending: true });

  // Get social accounts
  const { data: socialAccounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('client_id', clientId)
    .order('platform', { ascending: true });

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-foreground">
      <div>
        <Link href={`/clients/${clientId}`} className="text-primary hover:text-primary/80 transition-colors mb-4 inline-block">
          ← Back to Client
        </Link>
        <h1 className="text-3xl font-semibold tracking-[0.01em]">Client Settings</h1>
        <p className="text-muted-foreground mt-1">{client.name}</p>
      </div>

      <ClientSettingsForm
        client={client}
        keywords={keywords || []}
        socialAccounts={socialAccounts || []}
      />
    </div>
  );
}

