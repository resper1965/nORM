'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function GenerateContentPage() {
  const router = useRouter();
  const [clientId, setClientId] = useState('');
  const [topic, setTopic] = useState('');
  const [articleCount, setArticleCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);

  // Load clients on mount
  useState(() => {
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
  });

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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/content" className="text-blue-500 hover:underline mb-4 inline-block">
          ← Back to Content
        </Link>
        <h1 className="text-3xl font-bold">Generate Content</h1>
        <p className="text-gray-600 mt-2">
          Create AI-powered articles to improve your online reputation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-2">
            Client *
          </label>
          <select
            id="client"
            required
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
            Topic *
          </label>
          <input
            id="topic"
            type="text"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Benefits of our product, Industry trends, Customer success stories"
          />
          <p className="mt-1 text-sm text-gray-500">
            Describe the topic or theme for the articles
          </p>
        </div>

        <div>
          <label htmlFor="articleCount" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Articles
          </label>
          <input
            id="articleCount"
            type="number"
            min="1"
            max="5"
            value={articleCount}
            onChange={(e) => setArticleCount(parseInt(e.target.value, 10))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Generate 1-5 articles (default: 3)
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Content'}
          </button>
          <Link
            href="/content"
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

