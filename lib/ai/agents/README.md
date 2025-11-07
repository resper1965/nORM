# AI Agents - nORM

Sistema de agentes de IA para geração de conteúdo e análise de reputação.

## 📋 Visão Geral

O sistema de agentes de IA do nORM é composto por agentes especializados que trabalham de forma coordenada para:

1. **Gerar conteúdo** SEO-otimizado para gestão de reputação
2. **Avaliar qualidade** do conteúdo gerado
3. **Analisar dados** de reputação e identificar tendências

## 🤖 Agentes Disponíveis

### 1. ContentGeneratorAgent

**Responsabilidade**: Gerar artigos SEO-otimizados em português brasileiro (PT-BR)

**Funcionalidades**:
- Gera múltiplos artigos com diferentes ângulos
- Calcula scores de SEO e legibilidade automaticamente
- Suporta artigos contraponto (para conteúdo negativo)
- Retorna métricas de qualidade

**Uso**:
```typescript
import { ContentGeneratorAgent, createAgentContext } from '@/lib/ai/agents';

const context = createAgentContext(clientId, clientName, userId);
const agent = new ContentGeneratorAgent(context);

const result = await agent.execute({
  topic: 'Benefícios da sustentabilidade',
  targetKeywords: ['sustentabilidade', 'meio ambiente'],
  articleCount: 3,
});
```

**Output**:
- `articles`: Array de artigos gerados
- `qualityMetrics`: Métricas médias (SEO, legibilidade, word count)
- `generationTime`: Tempo total de geração

---

### 2. ContentEvaluatorAgent

**Responsabilidade**: Avaliar qualidade, SEO, legibilidade e relevância de conteúdo

**Funcionalidades**:
- Avalia score geral (0-100)
- Breakdown detalhado (título, conteúdo, SEO, legibilidade)
- Identifica pontos fortes e fracos
- Fornece recomendações práticas de melhoria

**Uso**:
```typescript
import { ContentEvaluatorAgent, createAgentContext } from '@/lib/ai/agents';

const context = createAgentContext(clientId, clientName, userId);
const agent = new ContentEvaluatorAgent(context);

const result = await agent.execute({
  title: 'Título do artigo',
  content: '<p>Conteúdo HTML...</p>',
  metaDescription: 'Meta descrição',
  targetKeywords: ['palavra-chave'],
  wordCount: 1200,
});
```

**Output**:
- `overallScore`: Score geral (0-100)
- `breakdown`: Análise detalhada por categoria
- `strengths`: Pontos fortes
- `weaknesses`: Pontos fracos
- `recommendations`: Recomendações de melhoria

---

### 3. ReputationAnalyzerAgent

**Responsabilidade**: Analisar dados de reputação e identificar tendências

**Funcionalidades**:
- Analisa scores atuais vs anteriores
- Identifica fatores de risco e oportunidades
- Fornece recomendações estratégicas
- Breakdow detalhado (SERP, menções, tendências)

**Uso**:
```typescript
import { ReputationAnalyzerAgent, createAgentContext } from '@/lib/ai/agents';

const context = createAgentContext(clientId, clientName, userId);
const agent = new ReputationAnalyzerAgent(context);

const result = await agent.execute({
  currentScore: 75,
  previousScore: 70,
  serpPositions: [...],
  mentions: [...],
  periodStart: new Date(),
  periodEnd: new Date(),
});
```

**Output**:
- `overallAssessment`: Avaliação geral (excellent/good/fair/poor/critical)
- `trend`: Tendência (improving/declining/stable/volatile)
- `riskFactors`: Fatores de risco com severidade
- `opportunities`: Oportunidades com prioridade
- `recommendations`: Recomendações acionáveis

---

## 🎭 Orchestrator

**Responsabilidade**: Coordenar múltiplos agentes para workflows complexos

### orchestrateContentGenerationWithEvaluation

Gera conteúdo e avalia automaticamente cada artigo gerado.

```typescript
import { orchestrateContentGenerationWithEvaluation, createAgentContext } from '@/lib/ai/agents';

const context = createAgentContext(clientId, clientName, userId);
const result = await orchestrateContentGenerationWithEvaluation(context, {
  topic: 'Tópico',
  targetKeywords: ['palavra-chave'],
  articleCount: 3,
});
```

### orchestrateReputationAnalysis

Realiza análise completa de reputação.

```typescript
import { orchestrateReputationAnalysis, createAgentContext } from '@/lib/ai/agents';

const context = createAgentContext(clientId, clientName, userId);
const result = await orchestrateReputationAnalysis(context, {
  currentScore: 75,
  previousScore: 70,
  serpPositions: [...],
  mentions: [...],
  periodStart: new Date(),
  periodEnd: new Date(),
});
```

---

## 🔌 Integração com APIs

### POST /api/generate-content

Gera conteúdo usando `ContentGeneratorAgent` automaticamente.

**Request**:
```json
{
  "client_id": "uuid",
  "topic": "Tópico do artigo",
  "article_count": 3,
  "trigger_mention_id": "uuid (opcional)"
}
```

**Response**:
```json
{
  "articles": [...],
  "generation_time_ms": 5000,
  "quality_metrics": {
    "averageSEOScore": 85,
    "averageReadability": 80,
    "averageWordCount": 1200
  }
}
```

### POST /api/clients/[id]/reputation/analyze

Analisa reputação usando `ReputationAnalyzerAgent`.

**Request**: `GET /api/clients/[id]/reputation/analyze?days=30`

**Response**:
```json
{
  "overallAssessment": "good",
  "trend": "improving",
  "keyInsights": [...],
  "riskFactors": [...],
  "opportunities": [...],
  "recommendations": [...]
}
```

---

## 🏗️ Arquitetura

```
BaseAgent (classe abstrata)
├── ContentGeneratorAgent
├── ContentEvaluatorAgent
└── ReputationAnalyzerAgent

Orchestrator
├── orchestrateContentGenerationWithEvaluation
└── orchestrateReputationAnalysis
```

### BaseAgent

Classe base que fornece:
- Gerenciamento de contexto
- Chamadas padronizadas para OpenAI
- Tratamento de erros
- Logging

### Agentes Especializados

Cada agente:
- Herda de `BaseAgent`
- Implementa `execute()` com lógica específica
- Retorna `AgentResponse<T>`
- Usa prompts especializados

---

## 📊 Métricas e Qualidade

### SEO Score (0-100)
- Título (20 pontos): Comprimento otimal 60-70 caracteres
- Meta descrição (20 pontos): Comprimento otimal 150-160 caracteres
- Densidade de palavras-chave (20 pontos): 1-2% é otimal
- Comprimento do conteúdo (20 pontos): 800-1500 palavras é otimal
- Estrutura HTML (20 pontos): H2 e H3 presentes

### Readability Score (0-100)
- Baseado em Flesch Reading Ease adaptado para português
- Considera comprimento médio de sentenças
- Considera sílabas por palavra

### Quality Metrics
- `averageSEOScore`: Média dos scores SEO
- `averageReadability`: Média dos scores de legibilidade
- `averageWordCount`: Média de palavras

---

## ⚙️ Configuração

### Variáveis de Ambiente

```env
OPENAI_API_KEY=sk-...
```

### Modelos Usados

- **Geração de conteúdo**: `gpt-4` (temperatura 0.7)
- **Avaliação**: `gpt-4` (temperatura 0.3)
- **Análise**: `gpt-4` (temperatura 0.3)

---

## 🚀 Melhorias Futuras

- [ ] Cache de resultados para reduzir custos
- [ ] Suporte a múltiplos modelos (GPT-3.5, Claude, etc.)
- [ ] Fine-tuning de modelos para domínio específico
- [ ] Agentes especializados por indústria
- [ ] Análise de sentimento mais avançada
- [ ] Geração de conteúdo em múltiplos formatos (posts, tweets, etc.)

---

## 📝 Notas

- Todos os agentes retornam JSON estruturado
- Erros são tratados e logados automaticamente
- Logs incluem métricas de performance (tempo, tokens)
- Agentes são stateless (usa contexto fornecido)

