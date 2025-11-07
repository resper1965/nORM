import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireClientAccess } from '@/lib/auth/rbac';
import { logger } from '@/lib/utils/logger';
import { AppError, ValidationError, NotFoundError } from '@/lib/errors/errors';
import type { GenerateContentRequest, GenerateContentResponse, ErrorResponse } from '@/lib/types/api';
import { z } from 'zod';

const generateContentSchema = z.object({
  client_id: z.string().uuid(),
  topic: z.string().min(1),
  article_count: z.number().int().min(1).max(5).optional().default(3),
  trigger_mention_id: z.string().uuid().optional(),
});

/**
 * POST /api/generate-content
 * Generate AI content articles
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = generateContentSchema.safeParse(body);

    if (!validation.success) {
      throw new ValidationError('Invalid request data', validation.error.issues);
    }

    const { client_id, topic, article_count, trigger_mention_id } = validation.data;

    // Check access
    await requireClientAccess(user.id, client_id, 'editor');

    // Get client information
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name')
      .eq('id', client_id)
      .single();

    if (clientError || !client) {
      throw new NotFoundError('Client', client_id);
    }

    // Get client keywords
    const { data: keywords } = await supabase
      .from('keywords')
      .select('keyword')
      .eq('client_id', client_id)
      .eq('is_active', true)
      .limit(10);

    const targetKeywords = keywords?.map(k => k.keyword) || [];

    // Use AI agents for content generation with evaluation
    const { orchestrateContentGenerationWithEvaluation, createAgentContext } = await import('@/lib/ai/agents/orchestrator');
    const { ContentGeneratorAgent } = await import('@/lib/ai/agents/content-generator-agent');

    const context = createAgentContext(
      client_id,
      client.name,
      user.id,
      { triggerMentionId: trigger_mention_id }
    );

    const agent = new ContentGeneratorAgent(context);
    const agentResult = await agent.execute({
      topic,
      targetKeywords: targetKeywords.length > 0 ? targetKeywords : [topic],
      articleCount: article_count,
      triggerMentionId: trigger_mention_id || undefined,
    });

    if (!agentResult.success || !agentResult.data) {
      throw new AppError(agentResult.error || 'Content generation failed', 500);
    }

    const generatedArticles = agentResult.data.articles;
    const generationTime = agentResult.data.generationTime;
    const qualityMetrics = agentResult.data.qualityMetrics;

    // Save generated content to database
    const contentToInsert = agentResult.data.articles.map(article => ({
      client_id,
      title: article.title,
      content: article.content,
      meta_description: article.metaDescription,
      target_keywords: article.targetKeywords,
      word_count: article.wordCount,
      seo_score: article.seoScore || null,
      readability_score: article.readabilityScore || null,
      status: 'draft',
      trigger_mention_id: trigger_mention_id || null,
      created_by: user.id,
    }));

    const { data: savedContent, error: saveError } = await supabase
      .from('generated_content')
      .insert(contentToInsert)
      .select();

    if (saveError) {
      logger.error('Failed to save generated content', saveError);
      throw new AppError('Failed to save generated content', 500);
    }

    const response: GenerateContentResponse = {
      articles: (savedContent || []).map((item, index) => {
        const generatedArticle = generatedArticles[index];
        return {
        ...item,
        title: generatedArticle?.title ?? item.title,
        content: generatedArticle?.content ?? item.content,
        meta_description: generatedArticle?.metaDescription ?? item.meta_description,
        target_keywords: generatedArticle?.targetKeywords ?? item.target_keywords,
        word_count: generatedArticle?.wordCount ?? item.word_count,
        seo_score: generatedArticle?.seoScore ?? item.seo_score ?? undefined,
        readability_score: generatedArticle?.readabilityScore ?? item.readability_score ?? undefined,
        status: item.status,
      }; }),
      generation_time_ms: generationTime,
      quality_metrics: qualityMetrics,
    };

    return NextResponse.json<GenerateContentResponse>(response);
  } catch (error) {
    logger.error('Error in POST /api/generate-content', error as Error);

    if (error instanceof AppError) {
      return NextResponse.json<ErrorResponse>(
        { error: error.code || 'ERROR', message: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json<ErrorResponse>(
      { error: 'Internal Server Error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

