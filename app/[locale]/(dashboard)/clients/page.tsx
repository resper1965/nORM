import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function ClientsPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's clients
  const { data: clientUsers, error } = await supabase
    .from('client_users')
    .select(`
      client_id,
      role,
      clients (
        id,
        name,
        industry,
        is_active,
        created_at
      )
    `)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching clients:', error);
  }

  const clients = clientUsers?.map((cu: any) => cu.clients).filter(Boolean) || [];

  return (
    <div className="container mx-auto py-8 text-foreground">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold tracking-[0.01em]">Clients</h1>
        <Button asChild>
          <Link href="/clients/new">Add Client</Link>
        </Button>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12 bg-card text-card-foreground border border-border rounded-xl">
          <p className="text-muted-foreground mb-4">No clients found.</p>
          <Button asChild>
            <Link href="/clients/new">Add Your First Client</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client: any) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="block p-6 border border-border/60 rounded-xl bg-card text-card-foreground transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-30px_rgba(0,0,0,0.45)]"
            >
              <h2 className="text-xl font-semibold mb-2">{client.name}</h2>
              {client.industry && (
                <p className="text-sm text-muted-foreground mb-2">{client.industry}</p>
              )}
              <div className="flex items-center gap-2 mt-4">
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    client.is_active
                      ? 'bg-primary/15 text-primary'
                      : 'bg-muted/40 text-muted-foreground'
                  }`}
                >
                  {client.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

