/**
 * Utilitário alternativo para criar cliente Supabase em Server Components
 * Usa o padrão recomendado pelo Supabase SSR
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Exemplo de uso em uma página Server Component:
 * 
 * ```tsx
 * import { createSupabaseClient } from '@/lib/utils/supabase-server'
 * 
 * export default async function Page() {
 *   const supabase = await createSupabaseClient()
 *   const { data: clients } = await supabase.from('clients').select()
 *   
 *   return (
 *     <ul>
 *       {clients?.map((client) => (
 *         <li key={client.id}>{client.name}</li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */
export async function createSupabaseClient() {
  return await createClient();
}

