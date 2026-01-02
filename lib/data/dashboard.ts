import { createClient } from "@/lib/supabase/server";

export type DashboardMetrics = {
  globalScore: {
    value: number;
    trend: number;
    trendDirection: "up" | "down" | "neutral";
  };
  criticalAlerts: number;
  mentionsVolume: {
    value: number;
    trend: number;
  };
  aiContentGenerated: {
    value: number;
    target: number;
  };
  recentAlerts: AlertItem[];
};

export type AlertItem = {
  id: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  source: string;
  timeAgo: string;
  sentiment?: number;
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient();

  // 1. Global Reputation Score
  // Logic: Get the latest score for each client, average them.
  // For simplicity MVP: Get the average of ALL scores in the last 7 days.
  const { data: scoreData } = await supabase
    .from("reputation_scores")
    .select("score")
    .order("calculated_at", { ascending: false })
    .limit(50); // Sample

  const scores = scoreData?.map((s) => Number(s.score)) || [];
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  // 2. Critical Alerts
  const { count: criticalCount } = await supabase
    .from("alerts")
    .select("*", { count: "exact", head: true })
    .eq("severity", "critical")
    .eq("status", "active");

  // 3. Mentions Volume (News + Social)
  const { count: newsCount } = await supabase
    .from("news_mentions")
    .select("*", { count: "exact", head: true });

  const { count: socialCount } = await supabase
    .from("social_posts")
    .select("*", { count: "exact", head: true });

  const totalMentions = (newsCount || 0) + (socialCount || 0);

  // 4. AI Content Generated
  const { count: contentCount } = await supabase
    .from("generated_content")
    .select("*", { count: "exact", head: true });

  // 5. Recent Alerts (Feed)
  const { data: alertsData } = await supabase
    .from("alerts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  // Calculate real trends
  // Get scores from 7 days ago for comparison
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data: previousScoreData } = await supabase
    .from("reputation_scores")
    .select("score")
    .lte("calculated_at", sevenDaysAgo.toISOString())
    .order("calculated_at", { ascending: false })
    .limit(50);

  const previousScores = previousScoreData?.map((s) => Number(s.score)) || [];
  const previousAvgScore = previousScores.length
    ? Math.round(previousScores.reduce((a, b) => a + b, 0) / previousScores.length)
    : 0;

  // Calculate trend
  const trend = previousAvgScore > 0 && avgScore > 0
    ? ((avgScore - previousAvgScore) / previousAvgScore) * 100
    : 0;
  const trendDirection: "up" | "down" | "neutral" = 
    trend > 0.1 ? "up" : trend < -0.1 ? "down" : "neutral";

  // Get mentions from previous period for trend
  const { count: previousNewsCount } = await supabase
    .from("news_mentions")
    .select("*", { count: "exact", head: true })
    .lte("scraped_at", sevenDaysAgo.toISOString());

  const { count: previousSocialCount } = await supabase
    .from("social_posts")
    .select("*", { count: "exact", head: true })
    .lte("scraped_at", sevenDaysAgo.toISOString());

  const previousTotalMentions = (previousNewsCount || 0) + (previousSocialCount || 0);
  const mentionsTrend = previousTotalMentions > 0 && totalMentions > 0
    ? ((totalMentions - previousTotalMentions) / previousTotalMentions) * 100
    : 0;

  // Fetch sentiment from related mentions/posts
  const formattedAlerts: AlertItem[] = await Promise.all(
    (alertsData || []).map(async (alert) => {
      let sentiment: number | undefined = undefined;

      // Try to get sentiment from related mention
      if (alert.related_mention_id) {
        const { data: mention } = await supabase
          .from("news_mentions")
          .select("sentiment_score")
          .eq("id", alert.related_mention_id)
          .single();
        sentiment = mention?.sentiment_score ? Number(mention.sentiment_score) : undefined;
      }

      // Try to get sentiment from related social post
      if (!sentiment && alert.related_social_post_id) {
        const { data: post } = await supabase
          .from("social_posts")
          .select("sentiment_score")
          .eq("id", alert.related_social_post_id)
          .single();
        sentiment = post?.sentiment_score ? Number(post.sentiment_score) : undefined;
      }

      return {
        id: alert.id,
        title: alert.title,
        message: alert.message,
        severity: alert.severity as any,
        source: alert.alert_type === "social_negative" ? "Social Media" : "System",
        timeAgo: getTimeAgo(new Date(alert.created_at)),
        sentiment,
      };
    })
  );

  return {
    globalScore: {
      value: avgScore || 0, // Show 0 when no data, not fake 85
      trend: Math.abs(trend),
      trendDirection,
    },
    criticalAlerts: criticalCount || 0,
    mentionsVolume: {
      value: totalMentions || 0,
      trend: Math.abs(mentionsTrend),
    },
    aiContentGenerated: {
      value: contentCount || 0,
      target: 200,
    },
    recentAlerts: formattedAlerts,
  };
}

function getTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return Math.floor(seconds) + " seconds ago";
}
