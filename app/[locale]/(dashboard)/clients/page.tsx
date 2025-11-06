import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Link
          href="/clients/new"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No clients found.</p>
          <Link
            href="/clients/new"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Your First Client
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client: any) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{client.name}</h2>
              {client.industry && (
                <p className="text-sm text-gray-600 mb-2">{client.industry}</p>
              )}
              <div className="flex items-center gap-2 mt-4">
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    client.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
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

