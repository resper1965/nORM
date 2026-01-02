import { createClient } from "@/lib/supabase/server";

export type ClientWithScore = {
  id: string;
  name: string;
  industry: string;
  website: string;
  logo_url?: string;
  status: "Monitoring" | "Risk" | "Inactive";
  score: number;
  lastAudit: string;
};

export async function getClients(): Promise<ClientWithScore[]> {
  const supabase = await createClient();

  const { data: clients, error } = await supabase
    .from("clients")
    .select(`
      id,
      name,
      industry,
      website,
      logo_url,
      reputation_scores (
        score,
        calculated_at
      )
    `)
    .eq("status", "active"); // Assuming 'status' column exists on clients or I filter here. 
    // Wait, let's check clients schema.

  if (error || !clients) return [];

  // Process and shape data
  return clients.map((client: any) => {
    // Sort scores desc
    const scores = client.reputation_scores?.sort((a: any, b: any) => 
      new Date(b.calculated_at).getTime() - new Date(a.calculated_at).getTime()
    );
    const latestScore = scores?.[0]?.score || 0;
    
    // Determine status based on score
    let status: "Monitoring" | "Risk" | "Inactive" = "Monitoring";
    if (latestScore < 60 && latestScore > 0) status = "Risk";
    if (latestScore === 0) status = "Inactive";

    return {
      id: client.id,
      name: client.name,
      industry: client.industry || "General",
      website: client.website,
      logo_url: client.logo_url,
      status,
      score: Number(latestScore),
      lastAudit: scores?.[0]?.calculated_at 
        ? new Date(scores[0].calculated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) 
        : "N/A",
    };
  });
}
