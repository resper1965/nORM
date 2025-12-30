import { OpenAIStream, StreamingTextResponse } from "ai";
import { OpenAI } from "openai";
import { NextRequest } from "next/server";
import { logger } from "@/lib/utils/logger";
import { trackOpenAICost } from "@/lib/monitoring/cost-tracker";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

/**
 * POST /api/ai/generate-content-stream
 *
 * Stream de geração de conteúdo SEO em tempo real
 *
 * Request body:
 * {
 *   topic: string,
 *   keywords: string[],
 *   tone?: 'professional' | 'casual' | 'technical',
 *   length?: 'short' | 'medium' | 'long'
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const {
      topic,
      keywords,
      tone = "professional",
      length = "medium",
    } = await req.json();

    if (!topic) {
      return new Response("Topic is required", { status: 400 });
    }

    // Determine word count based on length
    const wordCounts = {
      short: "400-600",
      medium: "800-1200",
      long: "1500-2000",
    };

    const targetWords =
      wordCounts[length as keyof typeof wordCounts] || "800-1200";

    // Build prompt
    const systemPrompt = `Você é um expert em SEO e criação de conteúdo em português brasileiro.
Crie conteúdo original, otimizado para SEO, que seja informativo e engajador.`;

    const userPrompt = `Crie um artigo completo sobre: ${topic}

Requisitos:
- Tamanho: ${targetWords} palavras
- Tom: ${tone}
- Palavras-chave para incluir naturalmente: ${keywords.join(", ")}
- Formato em Markdown
- Título H1
- Pelo menos 3 seções com H2
- Parágrafos bem estruturados
- Call-to-action no final

O artigo deve ser 100% em português brasileiro e otimizado para motores de busca.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt },
    ];

    // Create streaming response
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7,
      stream: true,
    });

    // Convert to Vercel AI SDK stream
    const stream = OpenAIStream(response as any, {
      async onCompletion(completion) {
        // Track cost after completion
        const promptTokens = Math.ceil(JSON.stringify(messages).length / 4);
        const completionTokens = Math.ceil(completion.length / 4);

        await trackOpenAICost("gpt-4", promptTokens, completionTokens, {
          topic,
          streaming: true,
        });

        logger.info("Content generation completed", {
          topic,
          length: completion.length,
          estimatedTokens: promptTokens + completionTokens,
        });
      },
    });

    // Return streaming response
    return new StreamingTextResponse(stream, {
      headers: {
        "X-Content-Type": "seo-article",
        "X-Model-Used": "gpt-4",
      },
    });
  } catch (error) {
    logger.error("Content generation streaming error", error as Error);

    return new Response(
      JSON.stringify({ error: "Failed to generate content" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
