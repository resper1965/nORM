/**
 * Reputation Analyzer Agent
 * Specialized AI agent for analyzing reputation data and trends
 */

import { BaseAgent, AgentContext, AgentResponse } from './base-agent';
import { logger } from '@/lib/utils/logger';

export interface ReputationAnalysisInput {
  currentScore: number;
  previousScore: number;
  serpPositions: Array<{
    keyword: string;
    position: number | null;
    change: number;
  }>;
  mentions: Array<{
    type: 'news' | 'social';
    sentiment: 'positive' | 'neutral' | 'negative';
    title?: string;
    url?: string;
  }>;
  periodStart: Date;
  periodEnd: Date;
}

export interface ReputationAnalysisOutput {
  overallAssessment: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  trend: 'improving' | 'declining' | 'stable' | 'volatile';
  scoreChange: number;
  scoreChangePercentage: number;
  keyInsights: string[];
  riskFactors: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
  }>;
  opportunities: Array<{
    priority: 'low' | 'medium' | 'high';
    description: string;
    action: string;
  }>;
  breakdown: {
    serp: {
      status: 'excellent' | 'good' | 'fair' | 'poor';
      analysis: string;
      averagePosition: number;
      positionChanges: number;
    };
    mentions: {
      status: 'excellent' | 'good' | 'fair' | 'poor';
      analysis: string;
      positiveCount: number;
      neutralCount: number;
      negativeCount: number;
      sentimentRatio: number; // positive / negative
    };
    trend: {
      status: 'improving' | 'declining' | 'stable';
      analysis: string;
      change: number;
    };
  };
  recommendations: Array<{
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'content' | 'seo' | 'social' | 'monitoring';
    action: string;
    expectedImpact: string;
  }>;
  nextSteps: string[];
}

export class ReputationAnalyzerAgent extends BaseAgent<ReputationAnalysisInput, ReputationAnalysisOutput> {
  constructor(context: AgentContext) {
    super(context, 'ReputationAnalyzer');
  }

  protected getSystemPrompt(): string {
    return `Você é um agente especializado em análise de reputação online e gestão de marca.

Responsabilidades:
- Analisar dados de reputação (scores, posições SERP, menções)
- Identificar tendências e padrões
- Detectar fatores de risco e oportunidades
- Fornecer recomendações acionáveis
- Sempre retornar JSON válido com análise detalhada

Foco:
- Análise profunda de dados de reputação
- Identificação de causas raiz
- Recomendações estratégicas
- Previsão de tendências`;
  }

  async execute(input: ReputationAnalysisInput): Promise<AgentResponse<ReputationAnalysisOutput>> {
    try {
      if (!this.validateInput(input)) {
        return {
          success: false,
          error: 'Invalid input: currentScore and previousScore are required',
        };
      }

      logger.info('ReputationAnalyzerAgent: Starting analysis', {
        clientId: this.context.clientId,
        currentScore: input.currentScore,
        previousScore: input.previousScore,
      });

      const analysisPrompt = this.buildAnalysisPrompt(input);

      const response = await this.callAI(
        [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: analysisPrompt,
          },
        ],
        {
          model: 'gpt-4',
          temperature: 0.3, // Lower temperature for more consistent analysis
          responseFormat: 'json_object',
        }
      );

      const analysis = JSON.parse(response) as ReputationAnalysisOutput;

      // Calculate actual score change
      const scoreChange = input.currentScore - input.previousScore;
      const scoreChangePercentage = input.previousScore > 0 
        ? (scoreChange / input.previousScore) * 100 
        : 0;

      // Ensure calculated values match
      analysis.scoreChange = Math.round(scoreChange * 100) / 100;
      analysis.scoreChangePercentage = Math.round(scoreChangePercentage * 100) / 100;

      return {
        success: true,
        data: analysis,
      };
    } catch (error) {
      logger.error('ReputationAnalyzerAgent: Analysis failed', error as Error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private buildAnalysisPrompt(input: ReputationAnalysisInput): string {
    const scoreChange = input.currentScore - input.previousScore;
    const scoreChangePercentage = input.previousScore > 0 
      ? (scoreChange / input.previousScore) * 100 
      : 0;

    const positiveMentions = input.mentions.filter(m => m.sentiment === 'positive').length;
    const neutralMentions = input.mentions.filter(m => m.sentiment === 'neutral').length;
    const negativeMentions = input.mentions.filter(m => m.sentiment === 'negative').length;
    const sentimentRatio = negativeMentions > 0 ? positiveMentions / negativeMentions : positiveMentions;

    const avgPosition = input.serpPositions
      .filter(p => p.position !== null)
      .reduce((sum, p) => sum + (p.position || 0), 0) / 
      input.serpPositions.filter(p => p.position !== null).length || 0;

    const positionChanges = input.serpPositions.reduce((sum, p) => sum + Math.abs(p.change), 0);

    return `Analise a reputação online do cliente "${this.context.clientName}" no período de ${input.periodStart.toLocaleDateString('pt-BR')} a ${input.periodEnd.toLocaleDateString('pt-BR')}.

SCORE DE REPUTAÇÃO:
- Atual: ${input.currentScore.toFixed(2)}/100
- Anterior: ${input.previousScore.toFixed(2)}/100
- Mudança: ${scoreChange > 0 ? '+' : ''}${scoreChange.toFixed(2)} pontos (${scoreChangePercentage > 0 ? '+' : ''}${scoreChangePercentage.toFixed(2)}%)

POSIÇÕES SERP (Top 10):
${input.serpPositions.map(p => 
  `- "${p.keyword}": Posição ${p.position || 'N/A'} (${p.change > 0 ? '+' : ''}${p.change} posições)`
).join('\n')}
- Posição média: ${avgPosition.toFixed(1)}
- Total de mudanças: ${positionChanges}

MENÇÕES NO PERÍODO:
- Positivas: ${positiveMentions}
- Neutras: ${neutralMentions}
- Negativas: ${negativeMentions}
- Razão positivo/negativo: ${sentimentRatio.toFixed(2)}

MENÇÕES DESTACADAS:
${input.mentions.slice(0, 10).map(m => 
  `- [${m.type.toUpperCase()}] ${m.sentiment}: ${m.title || m.url || 'Sem título'}`
).join('\n')}

PERÍODO:
- Início: ${input.periodStart.toLocaleDateString('pt-BR')}
- Fim: ${input.periodEnd.toLocaleDateString('pt-BR')}

Forneça uma análise completa incluindo:
1. Avaliação geral (excellent/good/fair/poor/critical)
2. Tendência (improving/declining/stable/volatile)
3. Insights chave
4. Fatores de risco com severidade e recomendações
5. Oportunidades com prioridade e ações
6. Breakdown detalhado (SERP, menções, tendência)
7. Recomendações acionáveis categorizadas
8. Próximos passos

Formato JSON:
{
  "overallAssessment": "good",
  "trend": "improving",
  "scoreChange": ${scoreChange.toFixed(2)},
  "scoreChangePercentage": ${scoreChangePercentage.toFixed(2)},
  "keyInsights": ["..."],
  "riskFactors": [
    {
      "severity": "medium",
      "description": "...",
      "recommendation": "..."
    }
  ],
  "opportunities": [
    {
      "priority": "high",
      "description": "...",
      "action": "..."
    }
  ],
  "breakdown": {
    "serp": {
      "status": "good",
      "analysis": "...",
      "averagePosition": ${avgPosition.toFixed(1)},
      "positionChanges": ${positionChanges}
    },
    "mentions": {
      "status": "good",
      "analysis": "...",
      "positiveCount": ${positiveMentions},
      "neutralCount": ${neutralMentions},
      "negativeCount": ${negativeMentions},
      "sentimentRatio": ${sentimentRatio.toFixed(2)}
    },
    "trend": {
      "status": "improving",
      "analysis": "...",
      "change": ${scoreChange.toFixed(2)}
    }
  },
  "recommendations": [
    {
      "priority": "high",
      "category": "content",
      "action": "...",
      "expectedImpact": "..."
    }
  ],
  "nextSteps": ["..."]
}

Retorne apenas JSON válido, sem markdown.`;
  }
}

