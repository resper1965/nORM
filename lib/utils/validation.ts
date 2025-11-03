/**
 * Utilitários de validação usando Zod
 */

import { z } from 'zod';

// Schemas comuns de validação
export const emailSchema = z.string().email('Email inválido');

export const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter no mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número');

export const urlSchema = z.string().url('URL inválida');

// Helper para validação de formulários
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError<unknown> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error };
}

// Helper para formatar erros do Zod para exibição
export function formatZodErrors(error: z.ZodError<unknown>): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path.join('.') || 'root';
    formatted[path] = issue.message;
  });
  
  return formatted;
}

