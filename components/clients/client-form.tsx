'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateDefaultKeywords } from '@/lib/clients/keyword-suggestions';

interface ClientFormProps {
  clientId?: string;
  initialData?: {
    name: string;
    industry?: string;
    website?: string;
  };
}

export function ClientForm({ clientId, initialData }: ClientFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || '');
  const [industry, setIndustry] = useState(initialData?.industry || '');
  const [website, setWebsite] = useState(initialData?.website || '');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateKeywords = () => {
    if (name.trim()) {
      const suggested = generateDefaultKeywords(name);
      setKeywords(suggested);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        clientId ? `/api/clients/${clientId}` : '/api/clients',
        {
          method: clientId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            industry: industry || null,
            website: website || null,
            keywords: keywords.length > 0 ? keywords : generateDefaultKeywords(name),
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save client');
      }

      const data = await response.json();
      router.push(`/clients/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Client Name *
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Company Name"
        />
      </div>

      <div>
        <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
          Industry
        </label>
        <input
          id="industry"
          type="text"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Technology, Healthcare, Legal"
        />
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700">
          Website
        </label>
        <input
          id="website"
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://example.com"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
            Keywords to Monitor
          </label>
          <button
            type="button"
            onClick={handleGenerateKeywords}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Generate Defaults
          </button>
        </div>
        <textarea
          id="keywords"
          value={keywords.join('\n')}
          onChange={(e) => setKeywords(e.target.value.split('\n').filter(Boolean))}
          rows={6}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter keywords, one per line"
        />
        <p className="mt-1 text-sm text-gray-500">
          {keywords.length} keyword{keywords.length !== 1 ? 's' : ''} configured
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : clientId ? 'Update Client' : 'Create Client'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

