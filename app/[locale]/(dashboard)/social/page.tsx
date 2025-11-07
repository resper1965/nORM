import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SocialFeed } from '@/components/social/social-feed';
import { getUserClients } from '@/lib/auth/rbac';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
      <div className="container mx-auto py-8 text-foreground">
        <h1 className="text-3xl font-semibold mb-4">Social Media Monitoring</h1>
        <p className="text-muted-foreground mb-6">
          No clients found. Please add a client first.
        </p>
        <Button asChild>
          <Link href="/clients/new">Add Client</Link>
        </Button>
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
    <div className="container mx-auto py-8 space-y-6 text-foreground">
      <h1 className="text-3xl font-semibold tracking-[0.01em]">Social Media Monitoring</h1>
      
      <div className="flex gap-4 mb-4">
        <select className="px-4 py-2 rounded-md border border-border bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/60">
          <option>All Platforms</option>
          <option>Instagram</option>
          <option>LinkedIn</option>
          <option>Facebook</option>
        </select>
        <select className="px-4 py-2 rounded-md border border-border bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/60">
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

