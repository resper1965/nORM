"use server";

import { generateContent, calculateSEOScore, calculateReadabilityScore } from "@/lib/ai/content-generator";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type GenerationState = {
  success: boolean;
  message?: string;
  data?: {
    title: string;
    content: string;
    keywords: string[];
    seoScore: number;
    readabilityScore: number;
  } | null;
};

export async function generateArticleAction(
  prevState: any,
  formData: FormData
): Promise<GenerationState> {
  const topic = formData.get("topic") as string;
  const keywordsString = formData.get("keywords") as string;
  
  if (!topic) {
    return { success: false, message: "Topic is required" };
  }

  const keywords = keywordsString 
    ? keywordsString.split(",").map(k => k.trim()).filter(k => k.length > 0)
    : [];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  // Fetch the first active client for this user (MVP)
  // In a real app, user would select the client from a dropdown in the studio
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .eq("is_active", true)
    .limit(1);

  const client = clients?.[0];

  if (!client) {
    return { success: false, message: "No active client found. Please create a client first." };
  }

  try {
    const articles = await generateContent({
      clientId: client.id,
      clientName: client.name,
      topic,
      targetKeywords: keywords,
      articleCount: 1,
    });

    if (!articles || articles.length === 0) {
      return { success: false, message: "Failed to generate content." };
    }

    const article = articles[0];
    const seoScore = calculateSEOScore(article.content, article.title, article.metaDescription, article.targetKeywords);
    const readabilityScore = calculateReadabilityScore(article.content);

    // Save to Database
    const { error } = await supabase.from("generated_content").insert({
      client_id: client.id,
      title: article.title,
      content: article.content,
      meta_description: article.metaDescription,
      target_keywords: article.targetKeywords,
      word_count: article.wordCount,
      seo_score: seoScore,
      readability_score: readabilityScore,
      status: "draft",
      created_by: user.id
    });

    if (error) {
      console.error("DB Save Error:", error);
      // We still return the content to the user even if save failed, but warn
    }

    revalidatePath("/content");

    return {
      success: true,
      data: {
        title: article.title,
        content: article.content,
        keywords: article.targetKeywords,
        seoScore,
        readabilityScore
      }
    };

  } catch (error) {
    console.error("Generation Error:", error);
    return { success: false, message: "Error generating content. Please try again." };
  }
}
