/**
 * Alert Generator
 * Generates alerts based on reputation events
 */

import { createClient } from "@/lib/supabase/server";
import type { Alert, AlertType, AlertSeverity } from "@/lib/types/domain";
import { logger } from "@/lib/utils/logger";
import { sendAlertEmail, getAlertRecipients } from "@/lib/notifications/email";
import { env } from "@/lib/config/env";

export interface AlertCondition {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  relatedResourceId?: string;
  relatedResourceType?: "mention" | "social_post" | "serp_result";
}

interface ScoreComparison {
  current: number;
  previous: number;
}

interface GenerateAlertsParams {
  clientId: string;
  periodStart: Date;
  periodEnd: Date;
}

/**
 * Check if alert conditions are met and generate alerts
 * This is the core function called by cron jobs or event triggers
 */
export async function generateAndSaveAlerts(
  clientId: string,
  scoreComparison?: ScoreComparison
): Promise<Alert[]> {
  const supabase = await createClient();
  const alerts: Omit<Alert, "id" | "created_at">[] = [];

  try {
    // 1. Check for Score Drops
    if (scoreComparison) {
      const drop = scoreComparison.previous - scoreComparison.current;
      if (drop >= 3) {
        const severity = getSeverityFromScoreDrop(drop);
        alerts.push({
          client_id: clientId,
          alert_type: severity === "critical" ? "critical" : "score_drop",
          severity,
          title: `Reputation Score Drop: -${drop.toFixed(1)} points`,
          message: `Your reputation score dropped from ${scoreComparison.previous} to ${scoreComparison.current}.`,
          status: "active",
          email_sent: false,
        });
      }
    }

    // 2. Check for recent Negative Mentions (last 24h)
    // We only alert if we haven't alerted about this specific mention before
    const { data: negativeMentions } = await supabase
      .from("news_mentions")
      .select("id, title, url, source")
      .eq("client_id", clientId)
      .eq("sentiment", "negative")
      .gte(
        "scraped_at",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      );

    if (negativeMentions && negativeMentions.length > 0) {
      // Check which ones already have alerts
      const mentionedIds = negativeMentions.map((m) => m.id);
      const { data: existingAlerts } = await supabase
        .from("alerts")
        .select("related_mention_id")
        .in("related_mention_id", mentionedIds);

      const alertedMentionIds = new Set(
        existingAlerts?.map((a) => a.related_mention_id) || []
      );

      for (const mention of negativeMentions) {
        if (!alertedMentionIds.has(mention.id)) {
          alerts.push({
            client_id: clientId,
            alert_type: "negative_mention",
            severity: "high",
            title: `Negative Mention Detected: ${mention.source}`,
            message: `A negative article titled "${mention.title}" was detected.`,
            related_mention_id: mention.id,
            status: "active",
            email_sent: false,
          });
        }
      }
    }

    // 3. Check for SERP Position Changes (>3 positions drop)
    // Get client keywords
    const { data: clientKeywords } = await supabase
      .from("keywords")
      .select("id, keyword")
      .eq("client_id", clientId)
      .eq("is_active", true);

    if (clientKeywords && clientKeywords.length > 0) {
      const keywordIds = clientKeywords.map((k) => k.id);
      
      // For each keyword, get the most recent check and the one before
      for (const keyword of clientKeywords) {
        // Get latest SERP results for this keyword (most recent check)
        const { data: latestResults } = await supabase
          .from("serp_results")
          .select("id, position, url, title, checked_at")
          .eq("keyword_id", keyword.id)
          .not("position", "is", null)
          .order("checked_at", { ascending: false })
          .limit(20);

        if (!latestResults || latestResults.length === 0) continue;

        // Get the timestamp of the most recent check
        const latestCheckTime = latestResults[0].checked_at;
        
        // Get previous SERP results (before the latest check)
        const { data: previousResults } = await supabase
          .from("serp_results")
          .select("id, position, url, title")
          .eq("keyword_id", keyword.id)
          .not("position", "is", null)
          .lt("checked_at", latestCheckTime)
          .order("checked_at", { ascending: false })
          .limit(20);

        if (!previousResults || previousResults.length === 0) continue;

        // Create maps for easy lookup: url -> position
        const latestByUrl = new Map<string, { id: string; position: number }>();
        for (const result of latestResults) {
          if (result.url && result.position) {
            latestByUrl.set(result.url, { id: result.id, position: result.position });
          }
        }

        const previousByUrl = new Map<string, number>();
        for (const result of previousResults) {
          if (result.url && result.position) {
            previousByUrl.set(result.url, result.position);
          }
        }

        // Check for position drops (>3 positions)
        for (const [url, latest] of latestByUrl.entries()) {
          const previousPosition = previousByUrl.get(url);
          if (previousPosition && latest.position) {
            const positionDrop = previousPosition - latest.position;
            if (positionDrop > 3) {
              // Check if we already alerted about this SERP result
              const { data: existingSerpAlerts } = await supabase
                .from("alerts")
                .select("related_serp_result_id")
                .eq("related_serp_result_id", latest.id)
                .eq("alert_type", "serp_change")
                .limit(1);

              if (!existingSerpAlerts || existingSerpAlerts.length === 0) {
                alerts.push({
                  client_id: clientId,
                  alert_type: "serp_change",
                  severity: positionDrop > 10 ? "high" : "medium",
                  title: `SERP Position Drop for "${keyword.keyword}"`,
                  message: `Position dropped from ${previousPosition} to ${latest.position} (${positionDrop} positions).`,
                  related_serp_result_id: latest.id,
                  status: "active",
                  email_sent: false,
                });
              }
            }
          }
        }
      }
    }

    // 4. Check for Negative Content in Top 3 SERP Positions
    if (clientKeywords && clientKeywords.length > 0) {
      const keywordIds = clientKeywords.map((k) => k.id);
      
      // Get SERP results in top 3 positions
      const { data: topSerpResults } = await supabase
        .from("serp_results")
        .select("id, keyword_id, position, url, title, domain")
        .in("keyword_id", keywordIds)
        .lte("position", 3)
        .not("position", "is", null)
        .order("checked_at", { ascending: false })
        .limit(100);

      if (topSerpResults && topSerpResults.length > 0) {
        // Check if any of these URLs have negative news mentions
        const topUrls = topSerpResults.map((r) => r.url);
        const { data: negativeNewsForTopUrls } = await supabase
          .from("news_mentions")
          .select("id, url, sentiment")
          .eq("client_id", clientId)
          .eq("sentiment", "negative")
          .in("url", topUrls);

        if (negativeNewsForTopUrls && negativeNewsForTopUrls.length > 0) {
          // Find which SERP results match negative news
          for (const serpResult of topSerpResults) {
            const negativeNews = negativeNewsForTopUrls.find(
              (n) => n.url === serpResult.url
            );
            if (negativeNews) {
              // Check if we already alerted about this
              const { data: existingCriticalAlerts } = await supabase
                .from("alerts")
                .select("related_serp_result_id")
                .eq("related_serp_result_id", serpResult.id)
                .eq("alert_type", "critical")
                .limit(1);

              if (!existingCriticalAlerts || existingCriticalAlerts.length === 0) {
                const keyword = clientKeywords.find((k) => k.id === serpResult.keyword_id);
                alerts.push({
                  client_id: clientId,
                  alert_type: "critical",
                  severity: "critical",
                  title: `Critical: Negative Content in Top ${serpResult.position} for "${keyword?.keyword || "keyword"}"`,
                  message: `Negative content detected at position ${serpResult.position} in SERP results. URL: ${serpResult.url}`,
                  related_serp_result_id: serpResult.id,
                  related_mention_id: negativeNews.id,
                  status: "active",
                  email_sent: false,
                });
              }
            }
          }
        }
      }
    }

    // 5. Check for Negative Social Media Mentions (last 24h)
    // Get client social accounts
    const { data: clientSocialAccounts } = await supabase
      .from("social_accounts")
      .select("id")
      .eq("client_id", clientId)
      .eq("is_active", true);

    if (clientSocialAccounts && clientSocialAccounts.length > 0) {
      const accountIds = clientSocialAccounts.map((a) => a.id);
      
      const { data: negativeSocialPosts } = await supabase
        .from("social_posts")
        .select("id, content, platform, author_name")
        .in("social_account_id", accountIds)
        .eq("sentiment", "negative")
        .gte(
          "published_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        );

      if (negativeSocialPosts && negativeSocialPosts.length > 0) {
        // Check which ones already have alerts
        const postIds = negativeSocialPosts.map((p) => p.id);
        const { data: existingSocialAlerts } = await supabase
          .from("alerts")
          .select("related_social_post_id")
          .in("related_social_post_id", postIds);

        const alertedPostIds = new Set(
          existingSocialAlerts?.map((a) => a.related_social_post_id) || []
        );

        for (const post of negativeSocialPosts) {
          if (!alertedPostIds.has(post.id)) {
            alerts.push({
              client_id: clientId,
              alert_type: "negative_mention",
              severity: "medium",
              title: `Negative Social Mention on ${post.platform}`,
              message: `A negative ${post.platform} post was detected${post.author_name ? ` from ${post.author_name}` : ""}.`,
              related_social_post_id: post.id,
              status: "active",
              email_sent: false,
            });
          }
        }
      }
    }

    // 6. Save alerts to DB
    if (alerts.length > 0) {
      const { data: savedAlerts, error } = await supabase
        .from("alerts")
        .insert(alerts)
        .select();

      if (error) {
        logger.error("Failed to save alerts", error);
        throw error;
      }

      logger.info(
        `Generated ${savedAlerts?.length} new alerts for client ${clientId}`
      );

      // 7. Send emails for critical/high severity alerts
      const criticalAlerts = (savedAlerts || []).filter(
        (alert) => alert.severity === "critical" || alert.severity === "high"
      );

      if (criticalAlerts.length > 0) {
        // Get client name
        const { data: client } = await supabase
          .from("clients")
          .select("name")
          .eq("id", clientId)
          .single();

        const clientName = client?.name || "Cliente";
        const dashboardUrl = `${env.NEXT_PUBLIC_APP_URL}/clients/${clientId}`;

        // Get recipients
        const recipients = await getAlertRecipients(clientId, supabase);

        if (recipients.length > 0) {
          // Send emails for each critical alert
          for (const alert of criticalAlerts) {
            for (const email of recipients) {
              try {
                await sendAlertEmail(email, {
                  title: alert.title,
                  message: alert.message,
                  severity: alert.severity,
                  clientName,
                  dashboardUrl,
                });

                // Mark as sent
                await supabase
                  .from("alerts")
                  .update({
                    email_sent: true,
                    email_sent_at: new Date().toISOString(),
                  })
                  .eq("id", alert.id);

                logger.info(`Alert email sent to ${email} for alert ${alert.id}`);
              } catch (emailError) {
                logger.error(
                  `Failed to send alert email to ${email}`,
                  emailError as Error
                );
                // Don't throw - continue with other emails
              }
            }
          }
        } else {
          logger.warn(
            `No recipients found for client ${clientId} alerts`
          );
        }
      }

      return savedAlerts as Alert[];
    }

    return [];
  } catch (error) {
    logger.error("Error generating alerts", error as Error);
    return [];
  }
}

/**
 * Determine alert severity based on score drop
 */
export function getSeverityFromScoreDrop(scoreDrop: number): AlertSeverity {
  if (scoreDrop >= 10) return "critical";
  if (scoreDrop >= 5) return "high";
  if (scoreDrop >= 3) return "medium";
  return "low";
}
