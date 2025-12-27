/**
 * Internal Linking Optimizer
 * Automatically adds internal links between client's articles using Gemini AI
 * Critical for SEO - internal links improve topical authority and crawlability
 */

import { createClient } from '@/lib/supabase/server';
import { generateStructuredGemini, callGemini } from '@/lib/ai/gemini';
import { logger } from '@/lib/utils/logger';
import { z } from 'zod';

export interface InternalLinkSuggestion {
  anchorText: string;
  targetUrl: string;
  targetTitle: string;
  position: number; // Character position in content
  relevanceScore: number; // 0-100
  reason: string;
}

// Zod schema for link suggestions
const linkSuggestionsSchema = z.object({
  links: z.array(z.object({
    anchor_text: z.string(),
    target_url: z.string(),
    relevance_score: z.number().min(0).max(100),
    position_hint: z.string(), // "no parágrafo 3", "após mencionar X"
    reason: z.string(),
  })),
});

/**
 * Generate internal link suggestions for a piece of content
 */
export async function generateInternalLinks(
  content: string,
  contentTitle: string,
  clientId: string,
  options: {
    maxLinks?: number;
    minRelevanceScore?: number;
  } = {}
): Promise<InternalLinkSuggestion[]> {
  const { maxLinks = 5, minRelevanceScore = 70 } = options;

  const supabase = await createClient();

  // Get all published articles from the same client
  const { data: relatedArticles, error } = await supabase
    .from('generated_content')
    .select('id, title, wordpress_url, target_keywords, meta_description')
    .eq('client_id', clientId)
    .eq('status', 'published')
    .not('wordpress_url', 'is', null)
    .limit(50); // Limit for performance

  if (error || !relatedArticles || relatedArticles.length === 0) {
    logger.warn('No related articles found for internal linking', { clientId });
    return [];
  }

  // Build article list for Gemini
  const articleList = relatedArticles
    .map(a => `- "${a.title}" (${a.wordpress_url})\n  Keywords: ${a.target_keywords?.join(', ') || 'N/A'}\n  Descrição: ${a.meta_description || 'N/A'}`)
    .join('\n\n');

  const prompt = `Você é um especialista em SEO e internal linking.

Analise o seguinte artigo e sugira links internos relevantes para outros artigos do mesmo site.

**Artigo atual:**
Título: ${contentTitle}

Conteúdo (primeiros 2000 caracteres):
${content.substring(0, 2000)}

**Artigos disponíveis para linkagem:**
${articleList}

**Instruções:**
1. Identifique até ${maxLinks} oportunidades de link interno
2. Escolha apenas artigos altamente relevantes (score >= ${minRelevanceScore})
3. Use anchor text natural e contextual (não "clique aqui")
4. Varie os anchor texts (não repetir)
5. Links devem agregar valor ao leitor

**Critérios de relevância:**
- Mesmo tópico ou subtópico
- Keywords relacionadas
- Complementa a informação do parágrafo
- Fluxo natural de leitura

Retorne JSON com array de links sugeridos.`;

  try {
    const result = await callGemini(async () => {
      return await generateStructuredGemini(
        prompt,
        linkSuggestionsSchema,
        {
          model: 'pro', // Pro para melhor análise de contexto
          temperature: 0.3, // Baixa criatividade para sugestões precisas
        }
      );
    });

    // Map results to InternalLinkSuggestion format
    const suggestions: InternalLinkSuggestion[] = result.links
      .filter(link => link.relevance_score >= minRelevanceScore)
      .map(link => {
        // Find the article to get full URL
        const article = relatedArticles.find(a =>
          a.wordpress_url === link.target_url ||
          a.title === link.target_url
        );

        return {
          anchorText: link.anchor_text,
          targetUrl: article?.wordpress_url || link.target_url,
          targetTitle: article?.title || '',
          position: 0, // Will be calculated when inserting
          relevanceScore: link.relevance_score,
          reason: link.reason,
        };
      });

    logger.info('Generated internal link suggestions', {
      clientId,
      contentTitle,
      suggestionsCount: suggestions.length,
    });

    return suggestions;
  } catch (error) {
    logger.error('Failed to generate internal links', error as Error);
    return [];
  }
}

/**
 * Insert internal links into HTML content
 */
export function insertInternalLinks(
  htmlContent: string,
  suggestions: InternalLinkSuggestion[]
): string {
  let modifiedContent = htmlContent;

  // Sort by relevance (highest first)
  const sortedSuggestions = [...suggestions].sort((a, b) =>
    b.relevanceScore - a.relevanceScore
  );

  for (const suggestion of sortedSuggestions) {
    // Find the anchor text in content (case-insensitive)
    const regex = new RegExp(`\\b${escapeRegExp(suggestion.anchorText)}\\b`, 'gi');

    // Replace only the first occurrence to avoid over-linking
    let replaced = false;
    modifiedContent = modifiedContent.replace(regex, (match) => {
      if (replaced) return match; // Skip if already replaced
      replaced = true;
      return `<a href="${suggestion.targetUrl}" title="${suggestion.targetTitle}">${match}</a>`;
    });

    if (replaced) {
      logger.debug('Inserted internal link', {
        anchorText: suggestion.anchorText,
        targetUrl: suggestion.targetUrl,
      });
    }
  }

  return modifiedContent;
}

/**
 * Escape special regex characters
 */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Analyze internal linking structure for a client
 */
export async function analyzeInternalLinkingStructure(
  clientId: string
): Promise<{
  totalArticles: number;
  articlesWithInternalLinks: number;
  averageLinksPerArticle: number;
  orphanArticles: number; // Articles with no internal links
  recommendations: string[];
}> {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from('generated_content')
    .select('id, title, content, wordpress_url')
    .eq('client_id', clientId)
    .eq('status', 'published');

  if (!articles || articles.length === 0) {
    return {
      totalArticles: 0,
      articlesWithInternalLinks: 0,
      averageLinksPerArticle: 0,
      orphanArticles: 0,
      recommendations: ['Nenhum artigo publicado ainda'],
    };
  }

  // Count internal links in each article
  let totalLinks = 0;
  let articlesWithLinks = 0;
  let orphanCount = 0;

  for (const article of articles) {
    const linkCount = (article.content.match(/<a\s+(?:[^>]*?\s+)?href=/gi) || []).length;
    totalLinks += linkCount;

    if (linkCount > 0) {
      articlesWithLinks++;
    } else {
      orphanCount++;
    }
  }

  const avgLinks = articles.length > 0 ? totalLinks / articles.length : 0;

  // Generate recommendations
  const recommendations: string[] = [];

  if (orphanCount > 0) {
    recommendations.push(`${orphanCount} artigos sem links internos (órfãos) - adicione links para melhorar SEO`);
  }

  if (avgLinks < 3) {
    recommendations.push('Média de links por artigo baixa (< 3) - aumente para 3-5 links por artigo');
  }

  if (articlesWithLinks / articles.length < 0.5) {
    recommendations.push('Menos de 50% dos artigos têm links internos - priorize adicionar links');
  }

  if (recommendations.length === 0) {
    recommendations.push('Estrutura de internal linking está boa! Continue mantendo 3-5 links por artigo.');
  }

  return {
    totalArticles: articles.length,
    articlesWithInternalLinks: articlesWithLinks,
    averageLinksPerArticle: Math.round(avgLinks * 10) / 10,
    orphanArticles: orphanCount,
    recommendations,
  };
}

/**
 * Batch add internal links to all orphan articles
 */
export async function addLinksToOrphanArticles(
  clientId: string
): Promise<{ processed: number; linksAdded: number }> {
  const supabase = await createClient();

  // Find orphan articles (no internal links)
  const { data: articles } = await supabase
    .from('generated_content')
    .select('id, title, content, wordpress_url')
    .eq('client_id', clientId)
    .eq('status', 'published');

  if (!articles) return { processed: 0, linksAdded: 0 };

  let processed = 0;
  let totalLinksAdded = 0;

  for (const article of articles) {
    // Check if article has internal links
    const hasLinks = /<a\s+(?:[^>]*?\s+)?href=/gi.test(article.content);
    if (hasLinks) continue; // Skip if already has links

    // Generate and insert links
    const suggestions = await generateInternalLinks(
      article.content,
      article.title,
      clientId,
      { maxLinks: 5, minRelevanceScore: 70 }
    );

    if (suggestions.length > 0) {
      const updatedContent = insertInternalLinks(article.content, suggestions);

      // Update article in database
      await supabase
        .from('generated_content')
        .update({ content: updatedContent })
        .eq('id', article.id);

      processed++;
      totalLinksAdded += suggestions.length;

      logger.info('Added internal links to orphan article', {
        articleId: article.id,
        linksAdded: suggestions.length,
      });
    }
  }

  return { processed, linksAdded: totalLinksAdded };
}
