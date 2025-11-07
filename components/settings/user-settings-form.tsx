'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';

interface UserSettingsFormProps {
  user: User;
  profile: any;
}

export function UserSettingsForm({ user, profile }: UserSettingsFormProps) {
  const [email, setEmail] = useState(user.email || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();

      // Update user email if changed
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email,
        });

        if (emailError) {
          throw new Error(emailError.message);
        }
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: fullName || null,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        throw new Error('Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card text-card-foreground rounded-xl border border-border p-6 space-y-6">
      <h2 className="text-xl font-semibold tracking-[0.01em]">Profile Settings</h2>

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

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full px-3 py-2 rounded-md border border-border bg-transparent text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/60"
          />
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-foreground/80 mb-2">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="block w-full px-3 py-2 rounded-md border border-border bg-transparent text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/60"
          />
        </div>

        <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

