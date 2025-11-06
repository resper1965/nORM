/**
 * Role-Based Access Control (RBAC)
 * Authorization utilities for client access
 */

import { createClient } from '@/lib/supabase/server';
import { AuthorizationError, NotFoundError } from '@/lib/errors/errors';
import type { ClientRole } from '@/lib/types/domain';

/**
 * Check if user has access to a client
 */
export async function hasClientAccess(
  userId: string,
  clientId: string,
  requiredRole?: ClientRole
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('client_users')
    .select('role')
    .eq('user_id', userId)
    .eq('client_id', clientId)
    .single();

  if (error || !data) {
    return false;
  }

  if (!requiredRole) {
    return true; // Any role is sufficient
  }

  // Role hierarchy: admin > editor > viewer
  const roleHierarchy: Record<ClientRole, number> = {
    admin: 3,
    editor: 2,
    viewer: 1,
  };

  return roleHierarchy[data.role] >= roleHierarchy[requiredRole];
}

/**
 * Require client access or throw error
 */
export async function requireClientAccess(
  userId: string,
  clientId: string,
  requiredRole?: ClientRole
): Promise<void> {
  const hasAccess = await hasClientAccess(userId, clientId, requiredRole);

  if (!hasAccess) {
    throw new AuthorizationError(
      `You don't have ${requiredRole || 'access'} to this client`
    );
  }
}

/**
 * Get user's role for a client
 */
export async function getUserClientRole(
  userId: string,
  clientId: string
): Promise<ClientRole | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('client_users')
    .select('role')
    .eq('user_id', userId)
    .eq('client_id', clientId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.role as ClientRole;
}

/**
 * Get all clients user has access to
 */
export async function getUserClients(userId: string): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('client_users')
    .select('client_id')
    .eq('user_id', userId);

  if (error || !data) {
    return [];
  }

  return data.map((row) => row.client_id);
}

