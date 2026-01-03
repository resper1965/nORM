/**
 * E-E-A-T Enhancer
 * Adds Expertise, Experience, Authoritativeness, and Trustworthiness signals to content
 * Critical for Google ranking - E-E-A-T is a major ranking factor
 */

import { generateStructuredGemini, callGemini } from '@/lib/ai/gemini';
import { logger } from '@/lib/utils/logger';
import { z } from 'zod';

export interface AuthorProfile {
  name: string;
  bio: string;
  credentials?: string[];
  yearsOfExperience?: number;
  specializations?: string[];
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
  };
}

export interface SourceCitation {
  text: string;
  url: string;
  title: string;
  type: 'study' | 'article' | 'government' | 'academic' | 'industry';
}

export interface EEATEnhancements {
  authorBox: string; // HTML for author bio box
  citations: SourceCitation[];
  expertQuotes: string[]; // Quotes to add credibility
  dataPoints: string[]; // Statistics and facts
  lastUpdated: string;
  reviewedBy?: string;
}

// Zod schema for source suggestions
const sourceSuggestionsSchema = z.object({
  citations: z.array(z.object({
    claim: z.string(),
    source_type: z.enum(['study', 'article', 'government', 'academic', 'industry']),
    suggested_search: z.string(),
    why_credible: z.string(),
  })),
  data_points: z.array(z.string()),
  expert_quotes: z.array(z.string()),
});

/**
 * Generate E-E-A-T enhancements for content
 */
export async function generateEEATEnhancements(
  content: string,
  title: string,
  topic: string,
  author: AuthorProfile
): Promise<EEATEnhancements> {
  const prompt = `Você é um especialista em SEO focado em E-E-A-T (Expertise, Experience, Authoritativeness, Trustworthiness).

Analise o seguinte artigo e sugira melhorias para aumentar sinais de E-E-A-T:

**Artigo:**
Título: ${title}
Tópico: ${topic}

Conteúdo (primeiros 2000 caracteres):
${content.substring(0, 2000)}

**Autor:**
- Nome: ${author.name}
- Bio: ${author.bio}
${author.credentials ? `- Credenciais: ${author.credentials.join(', ')}` : ''}
${author.yearsOfExperience ? `- Experiência: ${author.yearsOfExperience} anos` : ''}

**Tarefas:**

1. **Citações**: Identifique 3-5 afirmações que precisam de fontes credíveis
   - Priorize dados estatísticos, fatos, estudos
   - Sugira tipo de fonte ideal (estudo, governo, acadêmico, etc.)
   - Explique por que a fonte é necessária

2. **Data Points**: Extraia 3-5 estatísticas ou fatos que agregam autoridade
   - Devem ser específicos e mensuráveis
   - Relacionados ao tópico principal

3. **Expert Quotes**: Sugira 2-3 citações de especialistas (fictícias mas realistas)
   - Devem soar autênticas e agregar credibilidade
   - Relacionadas ao contexto brasileiro quando possível

**Importante:**
- Fontes devem ser de alta autoridade (.gov, .edu, estudos peer-reviewed)
- Data points devem ser recentes (2023-2025)
- Citações devem soar naturais no contexto PT-BR

Retorne JSON com as sugestões.`;

  try {
    const result = await callGemini(async () => {
      return await generateStructuredGemini(
        prompt,
        sourceSuggestionsSchema,
        {
          model: 'pro',
          temperature: 0.4,
        }
      );
    });

    // Generate author box HTML
    const authorBox = generateAuthorBox(author);

    // Map citations (URLs are suggestions, need to be researched)
    const citations: SourceCitation[] = result.citations.map(c => ({
      text: c.claim,
      url: '', // To be filled by user research
      title: c.suggested_search,
      type: c.source_type,
    }));

    return {
      authorBox,
      citations,
      expertQuotes: result.expert_quotes,
      dataPoints: result.data_points,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Failed to generate E-E-A-T enhancements', error as Error);

    // Return minimal enhancements
    return {
      authorBox: generateAuthorBox(author),
      citations: [],
      expertQuotes: [],
      dataPoints: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Generate author box HTML
 */
export function generateAuthorBox(author: AuthorProfile): string {
  const credentials = author.credentials && author.credentials.length > 0
    ? `<p class="author-credentials"><strong>Credenciais:</strong> ${author.credentials.join(', ')}</p>`
    : '';

  const experience = author.yearsOfExperience
    ? `<p class="author-experience"><strong>Experiência:</strong> ${author.yearsOfExperience}+ anos em ${author.specializations?.join(', ') || 'gestão de reputação online'}</p>`
    : '';

  const social = author.socialProfiles
    ? `<div class="author-social">
        ${author.socialProfiles.linkedin ? `<a href="${author.socialProfiles.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a>` : ''}
        ${author.socialProfiles.twitter ? `<a href="${author.socialProfiles.twitter}" target="_blank" rel="noopener noreferrer">Twitter</a>` : ''}
      </div>`
    : '';

  return `
<div class="author-box" style="border-left: 4px solid #0066cc; padding: 20px; margin: 30px 0; background: #f8f9fa;">
  <div class="author-header" style="display: flex; align-items: center; margin-bottom: 15px;">
    <div class="author-avatar" style="width: 60px; height: 60px; border-radius: 50%; background: #0066cc; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; margin-right: 15px;">
      ${author.name.charAt(0).toUpperCase()}
    </div>
    <div>
      <h4 class="author-name" style="margin: 0; font-size: 18px; font-weight: 600;">${author.name}</h4>
      <p class="author-title" style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Especialista em Reputação Online</p>
    </div>
  </div>
  <p class="author-bio" style="margin: 15px 0; line-height: 1.6; color: #333;">
    ${author.bio}
  </p>
  ${credentials}
  ${experience}
  ${social}
</div>`;
}

/**
 * Insert E-E-A-T signals into content
 */
export function insertEEATSignals(
  htmlContent: string,
  enhancements: EEATEnhancements
): string {
  let enhanced = htmlContent;

  // 1. Add author box at the end
  if (enhancements.authorBox) {
    enhanced += '\n\n' + enhancements.authorBox;
  }

  // 2. Add "Last Updated" and "Reviewed By" at the beginning
  const metaInfo = `
<div class="article-meta" style="background: #f0f0f0; padding: 15px; margin-bottom: 20px; border-radius: 5px;">
  <p style="margin: 0; font-size: 14px; color: #666;">
    <strong>Última atualização:</strong> ${new Date(enhancements.lastUpdated).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}
    ${enhancements.reviewedBy ? ` | <strong>Revisado por:</strong> ${enhancements.reviewedBy}` : ''}
  </p>
</div>`;

  // Insert after first h1 or at beginning
  if (enhanced.includes('<h1')) {
    enhanced = enhanced.replace('</h1>', '</h1>\n\n' + metaInfo);
  } else {
    enhanced = metaInfo + '\n\n' + enhanced;
  }

  // 3. Add "Sources" section at the end (before author box)
  if (enhancements.citations.length > 0) {
    const sourcesSection = `
<div class="sources-section" style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd;">
  <h3 style="margin-bottom: 15px; color: #333;">📚 Fontes e Referências</h3>
  <ol style="padding-left: 20px; line-height: 1.8;">
    ${enhancements.citations.map(c => `
      <li>
        <em>${c.text}</em>
        ${c.url ? ` - <a href="${c.url}" target="_blank" rel="noopener noreferrer nofollow">${c.title}</a>` : ` - ${c.title} (fonte sugerida: ${c.type})`}
      </li>
    `).join('\n    ')}
  </ol>
  <p style="font-size: 12px; color: #666; margin-top: 15px;">
    <em>Nota: Este artigo é baseado em pesquisas e fontes confiáveis. Links externos são fornecidos para referência adicional.</em>
  </p>
</div>`;

    // Insert before author box or at end
    if (enhanced.includes('class="author-box"')) {
      enhanced = enhanced.replace('<div class="author-box"', sourcesSection + '\n\n<div class="author-box"');
    } else {
      enhanced += '\n\n' + sourcesSection;
    }
  }

  return enhanced;
}

/**
 * Calculate E-E-A-T score for content
 */
export function calculateEEATScore(
  content: string,
  author?: AuthorProfile
): {
  score: number;
  breakdown: {
    expertise: number;
    experience: number;
    authoritativeness: number;
    trustworthiness: number;
  };
  recommendations: string[];
} {
  const recommendations: string[] = [];
  let expertiseScore = 0;
  let experienceScore = 0;
  let authoritativenessScore = 0;
  let trustworthinessScore = 0;

  // Expertise (author credentials)
  if (author) {
    if (author.credentials && author.credentials.length > 0) {
      expertiseScore += 50;
    } else {
      recommendations.push('Adicione credenciais do autor (certificações, formação)');
    }

    if (author.yearsOfExperience && author.yearsOfExperience >= 5) {
      expertiseScore += 50;
    } else {
      recommendations.push('Destaque a experiência do autor (anos de atuação)');
    }
  } else {
    recommendations.push('Adicione informações sobre o autor do artigo');
  }

  // Experience (first-person narrative, case studies)
  const hasFirstPerson = /\b(minha experiência|nosso trabalho|implementamos|ajudamos)\b/i.test(content);
  if (hasFirstPerson) {
    experienceScore += 50;
  } else {
    recommendations.push('Adicione experiências práticas ou cases de sucesso');
  }

  const hasCaseStudy = /\b(caso de sucesso|estudo de caso|exemplo real|cliente)\b/i.test(content);
  if (hasCaseStudy) {
    experienceScore += 50;
  } else {
    recommendations.push('Inclua estudos de caso ou exemplos reais');
  }

  // Authoritativeness (citations, data, sources)
  const citationCount = (content.match(/<a[^>]*href=/gi) || []).length;
  if (citationCount >= 5) {
    authoritativenessScore += 50;
  } else if (citationCount >= 3) {
    authoritativenessScore += 30;
  } else {
    recommendations.push('Adicione mais citações e links para fontes confiáveis (mínimo: 3-5)');
  }

  const hasStatistics = /\d+%|\d+\s*(pessoas|empresas|usuários|clientes)/i.test(content);
  if (hasStatistics) {
    authoritativenessScore += 50;
  } else {
    recommendations.push('Inclua dados estatísticos e números para embasar argumentos');
  }

  // Trustworthiness (transparency, disclosure, contact info)
  const hasLastUpdated = /última atualização|atualizado em|revisado em/i.test(content);
  if (hasLastUpdated) {
    trustworthinessScore += 30;
  } else {
    recommendations.push('Adicione data de última atualização');
  }

  const hasAuthorBox = /class="author-box"/i.test(content);
  if (hasAuthorBox) {
    trustworthinessScore += 40;
  } else {
    recommendations.push('Adicione box com informações do autor');
  }

  const hasSources = /fontes|referências|sources/i.test(content);
  if (hasSources) {
    trustworthinessScore += 30;
  } else {
    recommendations.push('Adicione seção de fontes e referências ao final');
  }

  const score = Math.round((expertiseScore + experienceScore + authoritativenessScore + trustworthinessScore) / 4);

  return {
    score,
    breakdown: {
      expertise: expertiseScore,
      experience: experienceScore,
      authoritativeness: authoritativenessScore,
      trustworthiness: trustworthinessScore,
    },
    recommendations: recommendations.length > 0 ? recommendations : ['Conteúdo tem bons sinais de E-E-A-T!'],
  };
}
