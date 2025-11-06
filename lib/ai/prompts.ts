/**
 * LLM Prompts
 * Versioned prompts for content generation and other AI tasks
 */

export const PROMPT_VERSION = '1.0.0';

/**
 * Generate content generation prompt
 */
export function getContentGenerationPrompt(
  topic: string,
  clientName: string,
  targetKeywords: string[],
  articleCount: number = 1,
  articleIndex: number = 0
): string {
  const angles = [
    'success stories and case studies',
    'customer testimonials and real experiences',
    'company investments and improvements',
    'comprehensive guides and why choose',
    'awards and recognition',
  ];

  const angle = angles[articleIndex % angles.length];

  return `Você é um redator SEO especializado em gestão de reputação online. 
Escreva um artigo em português brasileiro (PT-BR) sobre: "${topic}"

Contexto:
- Cliente: ${clientName}
- Palâvras-chave alvo: ${targetKeywords.join(', ')}
- Ângulo do artigo: ${angle}
- Artigo ${articleIndex + 1} de ${articleCount}

Requisitos:
1. Título atrativo e otimizado para SEO (60-70 caracteres)
2. Conteúdo de 800-1500 palavras
3. Estrutura com H2 e H3
4. Densidade de palavras-chave: 1-2%
5. Meta descrição (150-160 caracteres)
6. Linguagem natural e fluente em PT-BR
7. Tom positivo e profissional
8. Inclua exemplos e dados quando possível

Formato de resposta JSON:
{
  "title": "Título do artigo",
  "content": "Conteúdo completo em HTML (use <h2>, <h3>, <p>, <ul>, <li>)",
  "meta_description": "Meta descrição para SEO",
  "target_keywords": ["palavra1", "palavra2"],
  "word_count": 1200
}

Retorne apenas JSON válido, sem markdown.`;
}

/**
 * Generate counter-article prompt (respond to negative content)
 */
export function getCounterArticlePrompt(
  negativeArticleTitle: string,
  negativeArticleUrl: string,
  clientName: string,
  targetKeywords: string[],
  articleIndex: number = 0
): string {
  const counterAngles = [
    'Como a empresa resolve problemas: casos de sucesso',
    'Depoimentos reais de clientes satisfeitos',
    'Investimentos e melhorias da empresa',
    'Guia completo: por que escolher a empresa',
    'Reconhecimentos e prêmios recebidos',
  ];

  const angle = counterAngles[articleIndex % counterAngles.length];

  return `Você é um redator especializado em gestão de reputação online.
Escreva um artigo POSITIVO em português brasileiro (PT-BR) para contrapor conteúdo negativo.

Contexto:
- Artigo negativo: "${negativeArticleTitle}" (${negativeArticleUrl})
- Cliente: ${clientName}
- Palavras-chave alvo: ${targetKeywords.join(', ')}
- Ângulo: ${angle}
- Artigo ${articleIndex + 1} de 5

IMPORTANTE:
- NÃO mencione o artigo negativo diretamente
- NÃO seja defensivo ou agressivo
- Foque em aspectos positivos e soluções
- Use tom profissional e construtivo
- Apresente fatos e evidências

Requisitos:
1. Título positivo e otimizado (60-70 caracteres)
2. Conteúdo de 800-1500 palavras
3. Estrutura com H2 e H3
4. Densidade de palavras-chave: 1-2%
5. Meta descrição (150-160 caracteres)
6. Linguagem natural em PT-BR
7. Tom positivo e profissional

Formato de resposta JSON:
{
  "title": "Título do artigo",
  "content": "Conteúdo completo em HTML",
  "meta_description": "Meta descrição para SEO",
  "target_keywords": ["palavra1", "palavra2"],
  "word_count": 1200
}

Retorne apenas JSON válido, sem markdown.`;
}

