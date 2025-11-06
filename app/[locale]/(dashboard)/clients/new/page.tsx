import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ClientForm } from '@/components/clients/client-form';

export default async function NewClientPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Client</h1>
      <div className="max-w-2xl">
        <ClientForm />
      </div>
    </div>
  );
}

