/**
 * Alert Generator
 * Generates alerts based on reputation events
 */

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { sendImmediateAlert } from '@/lib/notifications/alert-notifications';
import type { Alert, AlertType, AlertSeverity } from '@/lib/types/domain';

export interface AlertCondition {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  relatedResourceId?: string;
  relatedResourceType?: 'mention' | 'social_post' | 'serp_result';
}

interface GenerateAlertsParams {
  clientId: string;
  periodStart: Date;
  periodEnd: Date;
}

/**
 * Generate all alerts for a client in the given period
 * Main orchestrator function
 */
export async function generateAlertsForClient(
  params: GenerateAlertsParams
): Promise<Alert[]> {
  const { clientId, periodStart, periodEnd } = params;

  logger.info('Generating alerts for client', { clientId, periodStart, periodEnd });

  try {
    const allAlerts: Alert[] = [];

    // 1. Detect score drops
    const scoreDropAlerts = await detectScoreDropAlerts(clientId, periodStart, periodEnd);
    allAlerts.push(...scoreDropAlerts);

    // 2. Detect negative content in SERP
    const negativeSERPAlerts = await detectNegativeSERPAlerts(clientId, periodStart, periodEnd);
    allAlerts.push(...negativeSERPAlerts);

    // 3. Detect SERP position changes
    const serpChangeAlerts = await detectSERPChangeAlerts(clientId, periodStart, periodEnd);
    allAlerts.push(...serpChangeAlerts);

    // 4. Detect negative social mentions
    const socialNegativeAlerts = await detectSocialNegativeAlerts(clientId, periodStart, periodEnd);
    allAlerts.push(...socialNegativeAlerts);

    // 5. Detect critical events (combinations)
    const criticalEventAlerts = await detectCriticalEvents(clientId, periodStart, periodEnd);
    allAlerts.push(...criticalEventAlerts);

    // 6. Deduplicate alerts
    const uniqueAlerts = deduplicateAlerts(allAlerts);

    // 7. Save to database
    const savedAlerts = await saveAlertsToDatabase(uniqueAlerts);

    logger.info('Alerts generated successfully', {
      clientId,
      total_alerts: savedAlerts.length,
      by_severity: {
        critical: savedAlerts.filter(a => a.severity === 'critical').length,
        high: savedAlerts.filter(a => a.severity === 'high').length,
        medium: savedAlerts.filter(a => a.severity === 'medium').length,
        low: savedAlerts.filter(a => a.severity === 'low').length,
      },
    });

    return savedAlerts;
  } catch (error) {
    logger.error('Failed to generate alerts', error as Error, { clientId });
    throw error;
  }
}

/**
 * Detect alerts for score drops
 * Severity based on score drop amount
 */
async function detectScoreDropAlerts(
  clientId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<Alert[]> {
  const supabase = await createClient();
  const alerts: Alert[] = [];

  // Get current period score
  const { data: currentScores } = await supabase
    .from('reputation_scores')
    .select('score, period_start, period_end')
    .eq('client_id', clientId)
    .gte('period_start', periodStart.toISOString().split('T')[0])
    .lte('period_end', periodEnd.toISOString().split('T')[0])
    .order('calculated_at', { ascending: false })
    .limit(1);

  if (!currentScores || currentScores.length === 0) {
    return alerts;
  }

  const currentScore = currentScores[0].score;

  // Get previous period score (30 days before)
  const previousPeriodEnd = new Date(periodStart);
  previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);

  const previousPeriodStart = new Date(previousPeriodEnd);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - 30);

  const { data: previousScores } = await supabase
    .from('reputation_scores')
    .select('score')
    .eq('client_id', clientId)
    .gte('period_start', previousPeriodStart.toISOString().split('T')[0])
    .lte('period_end', previousPeriodEnd.toISOString().split('T')[0])
    .order('calculated_at', { ascending: false })
    .limit(1);

  if (!previousScores || previousScores.length === 0) {
    return alerts;
  }

  const previousScore = previousScores[0].score;
  const scoreDrop = previousScore - currentScore;

  // Only alert if score dropped (not increased or stable)
  if (scoreDrop >= 3) {
    const severity = getSeverityFromScoreDrop(scoreDrop);

    alerts.push({
      id: '', // Will be set by database
      client_id: clientId,
      alert_type: 'score_drop' as AlertType,
      severity,
      title: `Score de reputação caiu ${scoreDrop.toFixed(1)} pontos`,
      message: `O score de reputação caiu de ${previousScore.toFixed(1)} para ${currentScore.toFixed(1)} (queda de ${scoreDrop.toFixed(1)} pontos).`,
      status: 'active',
      email_sent: false,
      created_at: new Date(),
    });
  }

  return alerts;
}

/**
 * Detect negative content appearing in SERP results
 */
async function detectNegativeSERPAlerts(
  clientId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<Alert[]> {
  const supabase = await createClient();
  const alerts: Alert[] = [];

  // Get client keywords
  const { data: keywords } = await supabase
    .from('keywords')
    .select('id, keyword')
    .eq('client_id', clientId)
    .eq('is_active', true);

  if (!keywords || keywords.length === 0) {
    return alerts;
  }

  const keywordIds = keywords.map(k => k.id);

  // Get SERP results with negative content in top 10
  const { data: serpResults } = await supabase
    .from('serp_results')
    .select('id, keyword_id, position, title, snippet, url')
    .in('keyword_id', keywordIds)
    .gte('checked_at', periodStart.toISOString())
    .lte('checked_at', periodEnd.toISOString())
    .lte('position', 10) // Only top 10 positions
    .order('position', { ascending: true });

  if (!serpResults || serpResults.length === 0) {
    return alerts;
  }

  // Check for negative keywords in title/snippet
  const negativeKeywords = [
    'fraude', 'golpe', 'scam', 'falso', 'fake',
    'problema', 'reclamação', 'reclamacao', 'insatisfação',
    'péssimo', 'pessimo', 'ruim', 'horrível', 'terrível',
    'não recomendo', 'nao recomendo', 'evite', 'cuidado',
    'processo', 'ação judicial', 'condenado', 'multa',
  ];

  for (const result of serpResults) {
    const text = `${result.title} ${result.snippet}`.toLowerCase();

    const hasNegativeContent = negativeKeywords.some(keyword =>
      text.includes(keyword.toLowerCase())
    );

    if (hasNegativeContent) {
      const keyword = keywords.find(k => k.id === result.keyword_id);
      const severity: AlertSeverity = result.position <= 3 ? 'critical' :
                                       result.position <= 5 ? 'high' : 'medium';

      alerts.push({
        id: '',
        client_id: clientId,
        alert_type: 'negative_content' as AlertType,
        severity,
        title: `Conteúdo negativo na posição ${result.position} do Google`,
        message: `Detectado conteúdo negativo para "${keyword?.keyword}" na posição ${result.position}: ${result.title}`,
        related_serp_result_id: result.id,
        status: 'active',
        email_sent: false,
        created_at: new Date(),
      });
    }
  }

  return alerts;
}

/**
 * Detect significant SERP position changes
 */
async function detectSERPChangeAlerts(
  clientId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<Alert[]> {
  const supabase = await createClient();
  const alerts: Alert[] = [];

  // Get client keywords
  const { data: keywords } = await supabase
    .from('keywords')
    .select('id, keyword')
    .eq('client_id', clientId)
    .eq('is_active', true);

  if (!keywords || keywords.length === 0) {
    return alerts;
  }

  const keywordIds = keywords.map(k => k.id);

  // Get current period SERP results (latest for each keyword)
  const { data: currentResults } = await supabase
    .from('serp_results')
    .select('keyword_id, position, checked_at')
    .in('keyword_id', keywordIds)
    .gte('checked_at', periodStart.toISOString())
    .lte('checked_at', periodEnd.toISOString())
    .eq('is_client_content', true) // Only client's own content
    .order('checked_at', { ascending: false });

  if (!currentResults || currentResults.length === 0) {
    return alerts;
  }

  // Get latest position for each keyword in current period
  const currentPositions = new Map<string, number>();
  for (const result of currentResults) {
    if (!currentPositions.has(result.keyword_id)) {
      currentPositions.set(result.keyword_id, result.position);
    }
  }

  // Get previous period results (7 days before current period)
  const previousPeriodEnd = new Date(periodStart);
  previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);

  const previousPeriodStart = new Date(previousPeriodEnd);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);

  const { data: previousResults } = await supabase
    .from('serp_results')
    .select('keyword_id, position')
    .in('keyword_id', keywordIds)
    .gte('checked_at', previousPeriodStart.toISOString())
    .lte('checked_at', previousPeriodEnd.toISOString())
    .eq('is_client_content', true)
    .order('checked_at', { ascending: false });

  if (!previousResults || previousResults.length === 0) {
    return alerts;
  }

  // Get latest position for each keyword in previous period
  const previousPositions = new Map<string, number>();
  for (const result of previousResults) {
    if (!previousPositions.has(result.keyword_id)) {
      previousPositions.set(result.keyword_id, result.position);
    }
  }

  // Compare positions and generate alerts for significant changes
  for (const [keywordId, currentPosition] of currentPositions) {
    const previousPosition = previousPositions.get(keywordId);

    if (previousPosition === undefined) {
      continue; // No comparison possible
    }

    const positionDrop = currentPosition - previousPosition; // Positive = drop, negative = improvement

    // Alert if dropped 3+ positions
    if (positionDrop >= 3) {
      const keyword = keywords.find(k => k.id === keywordId);
      const severity: AlertSeverity = positionDrop >= 10 ? 'critical' :
                                       positionDrop >= 5 ? 'high' : 'medium';

      alerts.push({
        id: '',
        client_id: clientId,
        alert_type: 'serp_change' as AlertType,
        severity,
        title: `Queda de ${positionDrop} posições no Google`,
        message: `A palavra-chave "${keyword?.keyword}" caiu da posição ${previousPosition} para ${currentPosition} (queda de ${positionDrop} posições).`,
        status: 'active',
        email_sent: false,
        created_at: new Date(),
      });
    }
  }

  return alerts;
}

/**
 * Detect negative mentions on social media
 */
async function detectSocialNegativeAlerts(
  clientId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<Alert[]> {
  const supabase = await createClient();
  const alerts: Alert[] = [];

  // Get social accounts for this client
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('id, platform, account_name')
    .eq('client_id', clientId)
    .eq('is_active', true);

  if (!accounts || accounts.length === 0) {
    return alerts;
  }

  const accountIds = accounts.map(a => a.id);

  // Get negative social posts with high engagement
  const { data: posts } = await supabase
    .from('social_posts')
    .select('id, social_account_id, content, sentiment, sentiment_score, engagement_likes, engagement_comments, engagement_shares, published_at')
    .in('social_account_id', accountIds)
    .gte('published_at', periodStart.toISOString())
    .lte('published_at', periodEnd.toISOString())
    .eq('sentiment', 'negative');

  if (!posts || posts.length === 0) {
    return alerts;
  }

  // Generate alerts for high-engagement negative posts
  for (const post of posts) {
    const engagement = (post.engagement_likes || 0) +
                      (post.engagement_comments || 0) +
                      (post.engagement_shares || 0);

    // Only alert for posts with significant engagement
    if (engagement >= 10) {
      const account = accounts.find(a => a.id === post.social_account_id);
      const sentimentScore = post.sentiment_score || 0;

      // More negative sentiment = higher severity
      const severity: AlertSeverity = sentimentScore <= -0.7 ? 'critical' :
                                       sentimentScore <= -0.5 ? 'high' :
                                       sentimentScore <= -0.3 ? 'medium' : 'low';

      alerts.push({
        id: '',
        client_id: clientId,
        alert_type: 'social_negative' as AlertType,
        severity,
        title: `Menção negativa no ${account?.platform || 'social media'}`,
        message: `Post negativo com alto engajamento (${engagement} interações) detectado em ${account?.account_name || 'conta social'}.`,
        related_social_post_id: post.id,
        status: 'active',
        email_sent: false,
        created_at: new Date(),
      });
    }
  }

  return alerts;
}

/**
 * Detect critical events (severe combinations)
 * These are combinations of factors that indicate serious reputation issues
 */
async function detectCriticalEvents(
  clientId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<Alert[]> {
  const supabase = await createClient();
  const alerts: Alert[] = [];

  // Get current score
  const { data: currentScores } = await supabase
    .from('reputation_scores')
    .select('score')
    .eq('client_id', clientId)
    .gte('period_start', periodStart.toISOString().split('T')[0])
    .lte('period_end', periodEnd.toISOString().split('T')[0])
    .order('calculated_at', { ascending: false })
    .limit(1);

  const currentScore = currentScores?.[0]?.score || 50;

  // Critical Event 1: Score below 30 (very poor reputation)
  if (currentScore < 30) {
    alerts.push({
      id: '',
      client_id: clientId,
      alert_type: 'critical_event' as AlertType,
      severity: 'critical',
      title: 'Score de reputação crítico',
      message: `ATENÇÃO: O score de reputação está em ${currentScore.toFixed(1)}/100, indicando sérios problemas de reputação online.`,
      status: 'active',
      email_sent: false,
      created_at: new Date(),
    });
  }

  // Critical Event 2: Multiple negative mentions in short time
  const { data: negativeMentions } = await supabase
    .from('news_mentions')
    .select('id')
    .eq('client_id', clientId)
    .eq('sentiment', 'negative')
    .gte('scraped_at', periodStart.toISOString())
    .lte('scraped_at', periodEnd.toISOString());

  const negativeCount = negativeMentions?.length || 0;

  if (negativeCount >= 5) {
    alerts.push({
      id: '',
      client_id: clientId,
      alert_type: 'critical_event' as AlertType,
      severity: 'critical',
      title: 'Múltiplas menções negativas detectadas',
      message: `ATENÇÃO: Foram detectadas ${negativeCount} menções negativas em um curto período de tempo.`,
      status: 'active',
      email_sent: false,
      created_at: new Date(),
    });
  }

  return alerts;
}

/**
 * Deduplicate alerts based on type, severity, and content similarity
 */
function deduplicateAlerts(alerts: Alert[]): Alert[] {
  const uniqueAlerts = new Map<string, Alert>();

  for (const alert of alerts) {
    // Create a key based on type + severity + title
    const key = `${alert.alert_type}_${alert.severity}_${alert.title}`;

    // Keep the first occurrence of each unique alert
    if (!uniqueAlerts.has(key)) {
      uniqueAlerts.set(key, alert);
    }
  }

  return Array.from(uniqueAlerts.values());
}

/**
 * Save alerts to database, avoiding duplicates within 24h
 */
async function saveAlertsToDatabase(alerts: Alert[]): Promise<Alert[]> {
  if (alerts.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const savedAlerts: Alert[] = [];

  // Check for duplicates in last 24 hours
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  for (const alert of alerts) {
    // Check if similar alert exists in last 24h
    const { data: existingAlerts } = await supabase
      .from('alerts')
      .select('id')
      .eq('client_id', alert.client_id)
      .eq('alert_type', alert.alert_type)
      .eq('severity', alert.severity)
      .gte('created_at', yesterday.toISOString())
      .limit(1);

    // Skip if duplicate found
    if (existingAlerts && existingAlerts.length > 0) {
      logger.info('Skipping duplicate alert', {
        client_id: alert.client_id,
        type: alert.alert_type,
        severity: alert.severity,
      });
      continue;
    }

    // Insert new alert
    const { data: inserted, error } = await supabase
      .from('alerts')
      .insert({
        client_id: alert.client_id,
        alert_type: alert.alert_type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        related_mention_id: alert.related_mention_id,
        related_social_post_id: alert.related_social_post_id,
        related_serp_result_id: alert.related_serp_result_id,
        status: alert.status,
        email_sent: alert.email_sent,
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to save alert', error, { alert });
      continue;
    }

    if (inserted) {
      savedAlerts.push(inserted as Alert);

      // Send critical alerts immediately
      if (inserted.severity === 'critical') {
        try {
          await sendImmediateAlert(inserted as Alert);
          logger.info('Critical alert sent immediately', { alertId: inserted.id });
        } catch (emailError) {
          logger.error('Failed to send immediate critical alert', emailError as Error, {
            alertId: inserted.id,
          });
          // Don't fail the entire process if email fails
        }
      }
    }
  }

  return savedAlerts;
}

/**
 * Determine alert severity based on score drop
 */
export function getSeverityFromScoreDrop(scoreDrop: number): AlertSeverity {
  if (scoreDrop >= 10) return 'critical';
  if (scoreDrop >= 5) return 'high';
  if (scoreDrop >= 3) return 'medium';
  return 'low';
}

/**
 * Check if alert conditions are met and generate alerts
 * Legacy function - kept for backwards compatibility
 */
export function checkAlertConditions(
  clientId: string,
  conditions: AlertCondition[]
): Alert[] {
  return conditions.map((condition) => ({
    id: '', // Will be generated by database
    client_id: clientId,
    alert_type: condition.type,
    severity: condition.severity,
    title: condition.title,
    message: condition.message,
    related_mention_id: condition.relatedResourceType === 'mention'
      ? condition.relatedResourceId
      : undefined,
    related_social_post_id: condition.relatedResourceType === 'social_post'
      ? condition.relatedResourceId
      : undefined,
    related_serp_result_id: condition.relatedResourceType === 'serp_result'
      ? condition.relatedResourceId
      : undefined,
    status: 'active' as const,
    email_sent: false,
    created_at: new Date(),
  }));
}
