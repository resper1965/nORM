/**
 * CTR Optimizer
 * Optimizes titles and meta descriptions for higher Click-Through Rate
 * Uses power words, numbers, and emotional triggers
 * Critical for SEO - higher CTR = better ranking
 */

import { generateStructuredGemini, callGemini } from '@/lib/ai/gemini';
import { logger } from '@/lib/utils/logger';
import { z } from 'zod';

// Power words that increase CTR (Brazilian Portuguese)
export const POWER_WORDS = {
  urgency: ['Agora', 'Hoje', 'Urgente', 'Última Chance', 'Limitado', 'Rápido'],
  value: ['Grátis', 'Gratuito', 'Bônus', 'Desconto', 'Economize', 'Ganhe'],
  authority: ['Definitivo', 'Completo', 'Essencial', 'Oficial', 'Comprovado', 'Testado'],
  curiosity: ['Segredo', 'Surpreendente', 'Incrível', 'Revelado', 'Descoberto', 'Exclusivo'],
  numbers: ['7 Dicas', '10 Passos', '5 Erros', '3 Segredos', 'Top 10', 'Lista Completa'],
  benefit: ['Simples', 'Fácil', 'Garantido', 'Comprovado', 'Eficaz', 'Poderoso'],
  year: ['[2025]', '2025', 'Atualizado', 'Novo', 'Mais Recente'],
  question: ['Como', 'Por Que', 'O Que', 'Quando', 'Qual', 'Onde'],
};

export interface TitleVariation {
  title: string;
  meta_description: string;
  ctr_score: number; // 0-100
  power_words_used: string[];
  improvement_notes: string;
}

// Zod schema for title variations
const titleVariationsSchema = z.object({
  variations: z.array(z.object({
    title: z.string().max(70),
    meta_description: z.string().max(160),
    ctr_score: z.number().min(0).max(100),
    power_words: z.array(z.string()),
    why_better: z.string(),
  })),
});

/**
 * Generate high-CTR title variations
 */
export async function generateCTROptimizedTitles(
  originalTitle: string,
  topic: string,
  keywords: string[],
  options: {
    variationCount?: number;
    minCTRScore?: number;
  } = {}
): Promise<TitleVariation[]> {
  const { variationCount = 5, minCTRScore = 70 } = options;

  const powerWordsList = Object.values(POWER_WORDS).flat().join(', ');

  const prompt = `Você é um especialista em copywriting e SEO focado em otimização de CTR (Click-Through Rate).

**Tarefa:** Gere ${variationCount} variações de título e meta description otimizadas para maximizar CTR no Google.

**Título Original:**
${originalTitle}

**Tópico:** ${topic}
**Keywords:** ${keywords.join(', ')}

**Requisitos dos Títulos:**
1. Máximo 60-70 caracteres (ideal: 60)
2. Incluir palavra-chave principal
3. Usar power words: ${powerWordsList}
4. Usar números quando possível (7 Dicas, 10 Passos, etc.)
5. Criar curiosidade ou prometer benefício claro
6. Incluir ano [2025] para atualidade
7. Tom persuasivo mas não clickbait

**Requisitos das Meta Descriptions:**
1. Máximo 150-160 caracteres (ideal: 155)
2. Complementar o título (não repetir)
3. Incluir call-to-action sutil
4. Prometer benefício específico
5. Usar palavras-chave secundárias

**Fórmulas Comprovadas:**
- "Como [Fazer X]: [Número] Passos Simples [Ano]"
- "[Número] Segredos de [Tópico] Que [Benefício]"
- "Guia Completo de [Tópico]: [Número] Dicas [Ano]"
- "[Tópico]: O Que Você Precisa Saber [Ano]"

**Exemplos de Alto CTR:**
❌ Baixo CTR: "Gestão de Reputação Online"
✅ Alto CTR: "Gestão de Reputação Online: 7 Passos Simples [2025]"

❌ Baixo CTR: "Como melhorar SEO"
✅ Alto CTR: "SEO em 2025: 10 Técnicas Comprovadas Que Funcionam"

**Importante:**
- Títulos devem ser 100% em português brasileiro
- Evitar clickbait (não prometer o que não pode entregar)
- Focar em benefícios práticos e tangíveis

Retorne JSON com ${variationCount} variações ranqueadas por CTR score (0-100).`;

  try {
    const result = await callGemini(async () => {
      return await generateStructuredGemini(
        prompt,
        titleVariationsSchema,
        {
          model: 'pro',
          temperature: 0.7, // Maior criatividade para títulos variados
        }
      );
    });

    const variations: TitleVariation[] = result.variations
      .filter(v => v.ctr_score >= minCTRScore)
      .map(v => ({
        title: v.title,
        meta_description: v.meta_description,
        ctr_score: v.ctr_score,
        power_words_used: v.power_words,
        improvement_notes: v.why_better,
      }))
      .sort((a, b) => b.ctr_score - a.ctr_score); // Sort by CTR score desc

    logger.info('Generated CTR-optimized title variations', {
      originalTitle,
      variationsCount: variations.length,
      bestScore: variations[0]?.ctr_score || 0,
    });

    return variations;
  } catch (error) {
    logger.error('Failed to generate CTR-optimized titles', error as Error);
    return [];
  }
}

/**
 * Analyze CTR potential of a title
 */
export function analyzeCTRPotential(
  title: string,
  metaDescription: string
): {
  score: number;
  breakdown: {
    title_length: number;
    meta_length: number;
    has_numbers: boolean;
    power_words_count: number;
    has_year: boolean;
    has_question: boolean;
  };
  suggestions: string[];
} {
  const suggestions: string[] = [];
  let score = 0;

  // Title length (60-70 chars is optimal)
  const titleLength = title.length;
  if (titleLength >= 55 && titleLength <= 65) {
    score += 20;
  } else if (titleLength >= 50 && titleLength <= 70) {
    score += 15;
    suggestions.push(`Tamanho do título não ideal (${titleLength} chars). Ideal: 55-65 caracteres.`);
  } else {
    score += 5;
    suggestions.push(`Tamanho do título fora do ideal (${titleLength} chars). Ajuste para 55-65 caracteres.`);
  }

  // Meta description length (150-160 chars is optimal)
  const metaLength = metaDescription.length;
  if (metaLength >= 145 && metaLength <= 160) {
    score += 15;
  } else if (metaLength >= 120 && metaLength <= 170) {
    score += 10;
    suggestions.push(`Meta description não ideal (${metaLength} chars). Ideal: 145-160 caracteres.`);
  } else {
    score += 5;
    suggestions.push(`Meta description fora do ideal (${metaLength} chars). Ajuste para 145-160 caracteres.`);
  }

  // Has numbers (increases CTR by ~36%)
  const hasNumbers = /\d+/.test(title);
  if (hasNumbers) {
    score += 20;
  } else {
    suggestions.push('Adicione números ao título (ex: "7 Dicas", "10 Passos") para aumentar CTR em ~36%');
  }

  // Power words count
  const allPowerWords = Object.values(POWER_WORDS).flat();
  const titleLower = title.toLowerCase();
  const powerWordsFound = allPowerWords.filter(word =>
    titleLower.includes(word.toLowerCase())
  );

  if (powerWordsFound.length >= 2) {
    score += 20;
  } else if (powerWordsFound.length === 1) {
    score += 10;
    suggestions.push('Adicione mais power words (ex: Guia Completo, Segredos, Definitivo)');
  } else {
    score += 0;
    suggestions.push('Use power words para aumentar CTR (ex: Completo, Simples, Garantido, Segredos)');
  }

  // Has current year (increases perceived relevance)
  const hasYear = /202[45]|\[202[45]\]/.test(title);
  if (hasYear) {
    score += 15;
  } else {
    suggestions.push('Adicione o ano [2025] para indicar conteúdo atualizado');
  }

  // Has question (increases engagement)
  const hasQuestion = /^(como|por que|o que|quando|qual|onde)\b/i.test(title);
  if (hasQuestion) {
    score += 10;
  } else {
    suggestions.push('Considere formato de pergunta (ex: "Como Melhorar...?") para maior engajamento');
  }

  return {
    score: Math.min(100, score),
    breakdown: {
      title_length: titleLength,
      meta_length: metaLength,
      has_numbers: hasNumbers,
      power_words_count: powerWordsFound.length,
      has_year: hasYear,
      has_question: hasQuestion,
    },
    suggestions: suggestions.length > 0 ? suggestions : ['Título está bem otimizado para CTR!'],
  };
}

/**
 * A/B test titles (simulate CTR comparison)
 */
export interface ABTestResult {
  title_a: string;
  title_b: string;
  winner: 'A' | 'B' | 'tie';
  estimated_ctr_diff: number; // Percentage points
  recommendation: string;
}

export function compareтитlesForABTest(
  titleA: string,
  titleB: string
): ABTestResult {
  const scoreA = analyzeCTRPotential(titleA, '').score;
  const scoreB = analyzeCTRPotential(titleB, '').score;

  const diff = scoreB - scoreA;
  const estimatedCTRDiff = (diff / 100) * 5; // Approximate 5% CTR at 100 score

  let winner: 'A' | 'B' | 'tie';
  let recommendation: string;

  if (Math.abs(diff) < 5) {
    winner = 'tie';
    recommendation = 'Diferença mínima. Teste ambos em produção para dados reais.';
  } else if (diff > 0) {
    winner = 'B';
    recommendation = `Título B tem ${diff} pontos a mais. Estimativa: +${estimatedCTRDiff.toFixed(1)}% CTR.`;
  } else {
    winner = 'A';
    recommendation = `Título A tem ${Math.abs(diff)} pontos a mais. Estimativa: +${Math.abs(estimatedCTRDiff).toFixed(1)}% CTR.`;
  }

  return {
    title_a: titleA,
    title_b: titleB,
    winner,
    estimated_ctr_diff: estimatedCTRDiff,
    recommendation,
  };
}

/**
 * Extract power words from title
 */
export function extractPowerWords(title: string): string[] {
  const allPowerWords = Object.values(POWER_WORDS).flat();
  const titleLower = title.toLowerCase();

  return allPowerWords.filter(word =>
    titleLower.includes(word.toLowerCase())
  );
}
