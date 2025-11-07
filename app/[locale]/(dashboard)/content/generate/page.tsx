'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GenerateContentPage() {
  const router = useRouter();
  const [clientId, setClientId] = useState('');
  const [topic, setTopic] = useState('');
  const [articleCount, setArticleCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);

  // Load clients on mount
  useEffect(() => {
    const loadClients = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: clientUsers } = await supabase
        .from('client_users')
        .select('client_id, clients!inner(id, name)')
        .eq('user_id', user.id);

      if (clientUsers) {
        const clientList = clientUsers.map((cu: any) => ({
          id: cu.clients.id,
          name: cu.clients.name,
        }));
        setClients(clientList);
        if (clientList.length > 0) {
          setClientId(clientList[0].id);
        }
      }
    };
    loadClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          topic,
          article_count: articleCount,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to generate content');
      }

      const data = await response.json();
      router.push(`/content?generated=${data.articles[0]?.id || ''}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-foreground">
      <div>
        <Link href="/content" className="text-primary hover:text-primary/80 transition-colors mb-4 inline-block">
          ← Back to Content
        </Link>
        <h1 className="text-3xl font-semibold tracking-[0.01em]">Generate Content</h1>
        <p className="text-muted-foreground mt-2">
          Create AI-powered articles to improve your online reputation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card text-card-foreground rounded-xl border border-border p-6 space-y-6">
        {error && (
          <div className="bg-destructive/15 border border-destructive/40 text-destructive px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="client" className="block text-sm font-medium text-foreground/80 mb-2">
            Client *
          </label>
          <select
            id="client"
            required
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="block w-full px-3 py-2 rounded-md border border-border bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/60"
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-foreground/80 mb-2">
            Topic *
          </label>
          <input
            id="topic"
            type="text"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="block w-full px-3 py-2 rounded-md border border-border bg-transparent text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/60"
            placeholder="e.g., Benefits of our product, Industry trends, Customer success stories"
          />
          <p className="mt-1 text-sm text-muted-foreground">
            Describe the topic or theme for the articles
          </p>
        </div>

        <div>
          <label htmlFor="articleCount" className="block text-sm font-medium text-foreground/80 mb-2">
            Number of Articles
          </label>
          <input
            id="articleCount"
            type="number"
            min="1"
            max="5"
            value={articleCount}
            onChange={(e) => setArticleCount(parseInt(e.target.value, 10))}
            className="block w-full px-3 py-2 rounded-md border border-border bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/60"
          />
          <p className="mt-1 text-sm text-muted-foreground">
            Generate 1-5 articles (default: 3)
          </p>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="px-5">
            {loading ? 'Generating...' : 'Generate Content'}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/content">
              Cancel
            </Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

