import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { UserSettingsForm } from '@/components/settings/user-settings-form';

export default async function SettingsPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <UserSettingsForm user={user} profile={profile || null} />
    </div>
  );
}

