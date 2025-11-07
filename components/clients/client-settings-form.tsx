'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Client, Keyword, SocialAccount } from '@/lib/types/domain';

interface ClientSettingsFormProps {
  client: Client;
  keywords: Keyword[];
  socialAccounts: SocialAccount[];
}

export function ClientSettingsForm({ client, keywords: initialKeywords, socialAccounts: initialSocialAccounts }: ClientSettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(client.name);
  const [industry, setIndustry] = useState(client.industry || '');
  const [website, setWebsite] = useState(client.website || '');
  const [keywords, setKeywords] = useState(initialKeywords);
  const [newKeyword, setNewKeyword] = useState('');
  const [socialAccounts, setSocialAccounts] = useState(initialSocialAccounts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${client.id}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: newKeyword.trim() }),
      });

      if (!response.ok) throw new Error('Failed to add keyword');

      const data = await response.json();
      setKeywords([...keywords, data.keyword]);
      setNewKeyword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add keyword');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${client.id}/keywords/${keywordId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete keyword');

      setKeywords(keywords.filter((k) => k.id !== keywordId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete keyword');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          industry: industry || null,
          website: website || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update client');
      }

      setSuccess(true);
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-destructive/15 border border-destructive/40 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-primary/15 border border-primary/30 text-primary px-4 py-3 rounded-md">
          Settings saved successfully!
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-card text-card-foreground rounded-xl border border-border p-6">
        <h2 className="text-xl font-semibold tracking-[0.01em] mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground/80 mb-2">
              Client Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-3 py-2 rounded-md border border-border bg-transparent text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/60"
            />
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-foreground/80 mb-2">
              Industry
            </label>
            <input
              id="industry"
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="block w-full px-3 py-2 rounded-md border border-border bg-transparent text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/60"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-foreground/80 mb-2">
              Website
            </label>
            <input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="block w-full px-3 py-2 rounded-md border border-border bg-transparent text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/60"
            />
          </div>

          <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Keywords */}
      <div className="bg-card text-card-foreground rounded-xl border border-border p-6">
        <h2 className="text-xl font-semibold tracking-[0.01em] mb-4">Keywords to Monitor</h2>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
              placeholder="Enter keyword"
              className="flex-1 px-3 py-2 rounded-md border border-border bg-transparent text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/60"
            />
            <Button onClick={handleAddKeyword} disabled={loading || !newKeyword.trim()} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {keywords.map((keyword) => (
              <div
                key={keyword.id}
                className="flex items-center justify-between p-3 border border-border/60 rounded-lg"
              >
                <div>
                  <span className="font-medium">{keyword.keyword}</span>
                  {keyword.alert_threshold && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      Alert threshold: {keyword.alert_threshold} positions
                    </span>
                  )}
                </div>
                <Button
                  onClick={() => handleDeleteKeyword(keyword.id)}
                  disabled={loading}
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Accounts */}
      <div className="bg-card text-card-foreground rounded-xl border border-border p-6">
        <h2 className="text-xl font-semibold tracking-[0.01em] mb-4">Social Media Accounts</h2>
        {socialAccounts.length === 0 ? (
          <p className="text-muted-foreground">No social accounts configured yet.</p>
        ) : (
          <div className="space-y-2">
            {socialAccounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 border border-border/60 rounded-lg"
              >
                <div>
                  <span className="font-medium capitalize">{account.platform}</span>
                  {account.account_name && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      @{account.account_name}
                    </span>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  account.is_active
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted/40 text-muted-foreground'
                }`}>
                  {account.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

