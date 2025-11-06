import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SocialFeed } from '@/components/social/social-feed';
import { getUserClients } from '@/lib/auth/rbac';

export default async function SocialPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's clients
  const userClientIds = await getUserClients(user.id);

  if (userClientIds.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Social Media Monitoring</h1>
        <p className="text-gray-600 mb-4">
          No clients found. Please add a client first.
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

  // Fetch social mentions
  const clientId = userClientIds[0];
  const mentionsRes = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/social/mentions?client_id=${clientId}&limit=50`,
    {
      headers: {
        'Cookie': (await import('next/headers')).cookies().toString(),
      },
    }
  ).catch(() => null);

  const mentions = mentionsRes?.ok ? await mentionsRes.json() : { mentions: [] };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Social Media Monitoring</h1>
      
      <div className="flex gap-4 mb-4">
        <select className="px-4 py-2 border rounded">
          <option>All Platforms</option>
          <option>Instagram</option>
          <option>LinkedIn</option>
          <option>Facebook</option>
        </select>
        <select className="px-4 py-2 border rounded">
          <option>All Sentiment</option>
          <option>Positive</option>
          <option>Neutral</option>
          <option>Negative</option>
        </select>
      </div>

      <SocialFeed posts={mentions.mentions || []} isLoading={!mentionsRes} />
    </div>
  );
}

