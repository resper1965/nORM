'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit, CheckCircle2, XCircle } from 'lucide-react';

interface WordPressSite {
  id: string;
  client_id: string;
  name: string;
  site_url: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

export default function WordPressSettingsPage() {
  const t = useTranslations('settings');

  const [sites, setSites] = useState<WordPressSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<WordPressSite | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    site_url: '',
    username: '',
    application_password: '',
    client_id: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load sites on mount
  useEffect(() => {
    loadSites();
  }, []);

  async function loadSites() {
    try {
      const response = await fetch('/api/wordpress/sites');
      if (!response.ok) throw new Error('Failed to load sites');

      const data = await response.json();
      setSites(data.sites || []);
    } catch (error) {
      console.error('Failed to load WordPress sites:', error);
      alert('Failed to load WordPress sites');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      site_url: '',
      username: '',
      application_password: '',
      client_id: '',
    });
    setFormErrors({});
    setEditingSite(null);
  }

  function openCreateDialog() {
    resetForm();
    setIsDialogOpen(true);
  }

  function openEditDialog(site: WordPressSite) {
    setFormData({
      name: site.name,
      site_url: site.site_url,
      username: site.username,
      application_password: '', // Don't populate password for security
      client_id: site.client_id,
    });
    setEditingSite(site);
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    try {
      const url = editingSite
        ? `/api/wordpress/sites/${editingSite.id}`
        : '/api/wordpress/sites';

      const method = editingSite ? 'PUT' : 'POST';

      // Only include password if it was changed
      const payload = editingSite && !formData.application_password
        ? {
            name: formData.name,
            site_url: formData.site_url,
            username: formData.username,
          }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'Connection Failed') {
          setFormErrors({ connection: data.message });
          return;
        }
        throw new Error(data.message || 'Failed to save site');
      }

      setSuccessMessage(
        editingSite
          ? 'WordPress site updated successfully'
          : 'WordPress site added successfully'
      );

      setIsDialogOpen(false);
      resetForm();
      loadSites();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save site:', error);
      alert(error instanceof Error ? error.message : 'Failed to save site');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(siteId: string) {
    if (!confirm('Are you sure you want to delete this WordPress site?')) {
      return;
    }

    try {
      const response = await fetch(`/api/wordpress/sites/${siteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete site');

      setSuccessMessage('WordPress site deleted successfully');
      loadSites();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to delete WordPress site:', error);
      alert('Failed to delete WordPress site');
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      {successMessage && (
        <div className="flex items-start gap-2 p-4 bg-green-50 border border-green-200 rounded-md">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">WordPress Integration</h1>
          <p className="text-muted-foreground mt-2">
            Manage WordPress sites for automatic content publishing
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Site
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingSite ? 'Edit WordPress Site' : 'Add WordPress Site'}
                </DialogTitle>
                <DialogDescription>
                  {editingSite
                    ? 'Update WordPress site connection details'
                    : 'Connect a new WordPress site for content publishing'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {formErrors.connection && (
                  <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-md">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{formErrors.connection}</p>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="name">Site Name</Label>
                  <Input
                    id="name"
                    placeholder="My WordPress Blog"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="site_url">Site URL</Label>
                  <Input
                    id="site_url"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.site_url}
                    onChange={(e) => setFormData({ ...formData, site_url: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="username">WordPress Username</Label>
                  <Input
                    id="username"
                    placeholder="admin"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="application_password">
                    Application Password
                    {editingSite && (
                      <span className="text-sm text-muted-foreground ml-2">
                        (leave blank to keep current)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="application_password"
                    type="password"
                    placeholder="xxxx xxxx xxxx xxxx"
                    value={formData.application_password}
                    onChange={(e) =>
                      setFormData({ ...formData, application_password: e.target.value })
                    }
                    required={!editingSite}
                  />
                  <p className="text-xs text-muted-foreground">
                    Generate an application password in WordPress under Users → Profile
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Testing Connection...' : editingSite ? 'Update' : 'Add Site'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground text-center mb-4">
              No WordPress sites configured yet.
              <br />
              Add a site to start publishing content automatically.
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Site
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sites.map((site) => (
            <Card key={site.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{site.name}</CardTitle>
                      {site.is_active ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <CardDescription className="mt-1">
                      <a
                        href={site.site_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {site.site_url}
                      </a>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(site)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(site.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>Username: {site.username}</p>
                  <p className="text-xs mt-1">
                    Added: {new Date(site.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
