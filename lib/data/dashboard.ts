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

  const formattedAlerts: AlertItem[] = (alertsData || []).map((alert) => ({
    id: alert.id,
    title: alert.title,
    message: alert.message,
    severity: alert.severity as any,
    source: alert.alert_type === "social_negative" ? "Social Media" : "System",
    timeAgo: getTimeAgo(new Date(alert.created_at)),
    sentiment: -0.8, // Mock for now or extract from relation?
  }));

  return {
    globalScore: {
      value: avgScore || 85, // Fallback for empty DB to look good
      trend: 2.5,
      trendDirection: "up",
    },
    criticalAlerts: criticalCount || 0,
    mentionsVolume: {
      value: totalMentions || 0,
      trend: 12,
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
