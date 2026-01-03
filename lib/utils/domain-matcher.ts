/**
 * Domain Matching Utilities
 * For detecting if content belongs to a client
 */

import { createClient } from '@/lib/supabase/server';
import { logger } from './logger';

/**
 * Extract domain from URL
 * Returns domain without www prefix
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    let domain = urlObj.hostname;

    // Remove www. prefix if present
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }

    return domain.toLowerCase();
  } catch (error) {
    logger.warn(`Failed to extract domain from URL: ${url}`, { error });
    return null;
  }
}

/**
 * Check if a URL belongs to a client
 * Compares URL domain against client_domains table
 */
export async function isClientContent(
  url: string,
  clientId: string
): Promise<boolean> {
  const supabase = await createClient();

  try {
    const domain = extractDomain(url);

    if (!domain) {
      return false;
    }

    // Check if domain exists in client_domains
    const { data, error } = await supabase
      .from('client_domains')
      .select('id')
      .eq('client_id', clientId)
      .eq('domain', domain)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found, which is OK
      logger.error('Failed to check client domain', error);
      return false;
    }

    return !!data;
  } catch (error) {
    logger.error('Failed to check if URL is client content', error as Error, { url, clientId });
    return false;
  }
}

/**
 * Get all domains for a client
 */
export async function getClientDomains(clientId: string): Promise<string[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('client_domains')
      .select('domain')
      .eq('client_id', clientId);

    if (error) {
      logger.error('Failed to get client domains', error);
      return [];
    }

    return (data || []).map(d => d.domain);
  } catch (error) {
    logger.error('Failed to get client domains', error as Error);
    return [];
  }
}

/**
 * Batch check multiple URLs against client domains
 * More efficient than checking one-by-one
 */
export async function batchCheckClientContent(
  urls: string[],
  clientId: string
): Promise<Map<string, boolean>> {
  const supabase = await createClient();
  const resultMap = new Map<string, boolean>();

  try {
    // Get all client domains once
    const clientDomains = await getClientDomains(clientId);

    if (clientDomains.length === 0) {
      // No domains configured, all URLs are not client content
      urls.forEach(url => resultMap.set(url, false));
      return resultMap;
    }

    // Check each URL
    for (const url of urls) {
      const domain = extractDomain(url);

      if (!domain) {
        resultMap.set(url, false);
        continue;
      }

      const isClient = clientDomains.includes(domain);
      resultMap.set(url, isClient);
    }

    return resultMap;
  } catch (error) {
    logger.error('Failed to batch check client content', error as Error);

    // Return false for all URLs on error
    urls.forEach(url => resultMap.set(url, false));
    return resultMap;
  }
}

/**
 * Add a domain to a client
 */
export async function addClientDomain(
  clientId: string,
  domain: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // Normalize domain (remove www, convert to lowercase)
    let normalizedDomain = domain.trim().toLowerCase();

    if (normalizedDomain.startsWith('www.')) {
      normalizedDomain = normalizedDomain.substring(4);
    }

    // Remove http:// or https:// if present
    normalizedDomain = normalizedDomain.replace(/^https?:\/\//, '');

    // Remove trailing slash
    normalizedDomain = normalizedDomain.replace(/\/$/, '');

    // Extract just the domain (no path)
    const domainOnly = normalizedDomain.split('/')[0];

    const { error } = await supabase
      .from('client_domains')
      .insert({
        client_id: clientId,
        domain: domainOnly,
        verified: false, // Requires verification
      });

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return { success: false, error: 'Domain already exists for this client' };
      }

      logger.error('Failed to add client domain', error);
      return { success: false, error: 'Failed to add domain' };
    }

    return { success: true };
  } catch (error) {
    logger.error('Failed to add client domain', error as Error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Remove a domain from a client
 */
export async function removeClientDomain(
  clientId: string,
  domain: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('client_domains')
      .delete()
      .eq('client_id', clientId)
      .eq('domain', domain);

    if (error) {
      logger.error('Failed to remove client domain', error);
      return { success: false, error: 'Failed to remove domain' };
    }

    return { success: true };
  } catch (error) {
    logger.error('Failed to remove client domain', error as Error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
