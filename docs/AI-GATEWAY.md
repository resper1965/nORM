# AI Gateway & Vercel AI SDK

Documentação completa da integração de IA no nORM usando AI Gateway e Vercel AI SDK.

---

## 🎯 O que é o AI Gateway?

O AI Gateway é uma camada de abstração inteligente que fica entre sua aplicação e as APIs de IA (OpenAI, etc). Ele fornece:

- ✅ **Cache inteligente** - Economize em requisições repetidas
- ✅ **Rate limiting** - Controle de uso automático
- ✅ **Fallback automático** - GPT-4 → GPT-4-turbo → GPT-3.5
- ✅ **Cost tracking** - Rastreamento automático de custos
- ✅ **Retry com backoff** - Resiliência em falhas
- ✅ **Streaming support** - Respostas em tempo real

---

## 📚 Arquitetura

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ↓
┌─────────────────┐
│  AI Gateway     │
│  - Cache        │
│  - Rate Limit   │
│  - Fallback     │
│  - Cost Track   │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│   OpenAI API    │
│  - GPT-4        │
│  - GPT-3.5      │
└─────────────────┘
```

---

## 🚀 Como Usar

### 1. Chamada Básica (sem streaming)

```typescript
import { callAIGateway } from '@/lib/ai/gateway'

const response = await callAIGateway(
  [
    { role: 'system', content: 'Você é um assistente útil' },
    { role: 'user', content: 'Olá!' }
  ],
  {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
    useCache: true,        // Habilita cache
    enableFallback: true,  // Habilita fallback automático
  }
)

console.log(response.content)    // Resposta da IA
console.log(response.model)      // Modelo usado (pode ser fallback)
console.log(response.cost)       // Custo da chamada em USD
console.log(response.cached)     // Se veio do cache
```

### 2. Streaming (tempo real)

```typescript
import { streamAIGateway } from '@/lib/ai/gateway'

const response = await streamAIGateway(
  [
    { role: 'user', content: 'Escreva um artigo sobre SEO' }
  ],
  {
    model: 'gpt-4',
    temperature: 0.7,
  },
  (chunk) => {
    // Callback chamado para cada chunk recebido
    console.log(chunk)
    // Atualize a UI aqui
  }
)

console.log(response.content) // Conteúdo completo no final
```

### 3. Hook React (Client-side)

```tsx
'use client'

import { useContentGeneration } from '@/lib/hooks/use-ai-stream'

function MyComponent() {
  const { content, generate, isLoading } = useContentGeneration()

  const handleGenerate = async () => {
    await generate({
      topic: 'SEO Tips',
      keywords: ['seo', 'optimization'],
      tone: 'professional',
      length: 'medium'
    })
  }

  return (
    <div>
      <button onClick={handleGenerate} disabled={isLoading}>
        Gerar
      </button>
      <div>{content}</div> {/* Atualizado em tempo real! */}
    </div>
  )
}
```

---

## ⚙️ Configuração

### Environment Variables

```bash
# Obrigatório
OPENAI_API_KEY=sk-...

# Opcional (com valores padrão)
MAX_OPENAI_REQUESTS_PER_HOUR=100  # Rate limit
```

### Config Options

```typescript
interface AIGatewayConfig {
  model: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo'
  temperature?: number      // 0.0 - 2.0, default: 0.7
  maxTokens?: number       // Max tokens, default: 2000
  useCache?: boolean       // Enable cache, default: true
  cacheTTL?: number        // Cache TTL em ms, default: 1h
  enableFallback?: boolean // Enable fallback, default: true
  retries?: number         // Retry attempts, default: 3
}
```

---

## 💰 Cost Tracking

O AI Gateway rastreia automaticamente os custos de cada chamada:

```typescript
const response = await callAIGateway(messages, config)

console.log(response.cost) // 0.045 (em USD)
console.log(response.usage)
// {
//   promptTokens: 100,
//   completionTokens: 500,
//   totalTokens: 600
// }
```

Os custos são automaticamente enviados para o **Cost Tracker**:

```typescript
import { getTotalCosts } from '@/lib/monitoring/cost-tracker'

const costs = await getTotalCosts('this_month')
console.log(costs.total)        // Total gasto
console.log(costs.by_category)  // Por modelo/API
```

---

## 🔄 Fallback Chain

Se um modelo falhar, o AI Gateway tenta automaticamente o próximo:

```
GPT-4 (falhou)
  ↓
GPT-4-turbo (tentando...)
  ↓
GPT-3.5-turbo (tentando...)
  ↓
Error (todos falharam)
```

**Exemplo**:

```typescript
const response = await callAIGateway(
  messages,
  {
    model: 'gpt-4',
    enableFallback: true  // ✅ Ativa fallback
  }
)

// Se GPT-4 falhar, automaticamente usa GPT-4-turbo
// Se GPT-4-turbo falhar, usa GPT-3.5-turbo
// Você recebe o resultado sem se preocupar!

console.log(response.model) // Mostra qual modelo foi usado
```

---

## 📦 Cache

O cache economiza **tempo** e **dinheiro** ao reutilizar respostas:

### Como funciona

```typescript
// Primeira chamada - vai para OpenAI
const response1 = await callAIGateway(messages, { useCache: true })
console.log(response1.cached) // false
console.log(response1.cost)    // 0.045

// Segunda chamada IDÊNTICA - vem do cache
const response2 = await callAIGateway(messages, { useCache: true })
console.log(response2.cached) // true ✅
console.log(response2.cost)    // 0.045 (mesmo valor)
// Mas você não foi cobrado novamente!
```

### TTL (Time To Live)

Por padrão, cache expira em **1 hora**. Você pode customizar:

```typescript
await callAIGateway(messages, {
  useCache: true,
  cacheTTL: 30 * 60 * 1000  // 30 minutos
})
```

### Clear Cache

```typescript
import { clearAICache } from '@/lib/ai/gateway'

clearAICache() // Limpa todo o cache
```

---

## 🚦 Rate Limiting

Protege contra excesso de uso:

```typescript
// Configurado via env
MAX_OPENAI_REQUESTS_PER_HOUR=100

// Se exceder o limite:
const response = await callAIGateway(messages)
// Error: Rate limit exceeded. Please try again later.
```

---

## 🔁 Retry com Exponential Backoff

Se a API falhar temporariamente, o Gateway tenta novamente:

```
Tentativa 1 - Falhou
  ↓ aguarda 1s
Tentativa 2 - Falhou
  ↓ aguarda 2s
Tentativa 3 - Falhou
  ↓ aguarda 4s
Erro final
```

```typescript
await callAIGateway(messages, {
  retries: 3  // Número de tentativas
})
```

**Erros que NÃO retentam** (fail fast):
- `invalid_request_error`
- `insufficient_quota`

---

## 📊 Logs & Monitoring

Todos os eventos são logados:

```typescript
logger.info('AI Gateway success', {
  model: 'gpt-4',
  tokens: 600,
  cost: 0.045,
})

logger.warn('AI Gateway fallback', {
  from: 'gpt-4',
  to: 'gpt-3.5-turbo'
})

logger.error('AI Gateway error', { error })
```

---

## 🎨 Exemplos Práticos

### Sentiment Analysis

```typescript
import { analyzeSentiment } from '@/lib/ai/sentiment'

const result = await analyzeSentiment('Este produto é incrível!')

console.log(result.sentiment)   // 'positive'
console.log(result.score)       // 0.9
console.log(result.confidence)  // 0.95
```

> **Nota**: `analyzeSentiment` usa internamente o AI Gateway com cache habilitado e GPT-3.5-turbo (mais barato para sentiment).

### Content Generation (Streaming)

```tsx
import { ContentGeneratorStream } from '@/components/ai/content-generator-stream'

export default function Page() {
  return <ContentGeneratorStream />
}
```

---

## 🔒 Segurança

1. **API Keys**: Nunca expor no client-side
   ```typescript
   // ❌ ERRADO - client-side
   const apiKey = 'sk-...'

   // ✅ CORRETO - server-side only
   const apiKey = process.env.OPENAI_API_KEY
   ```

2. **Rate Limiting**: Sempre habilitado
3. **Validation**: Todas as entradas são validadas

---

## 📈 Performance

### Benchmarks

| Operação | Sem Gateway | Com Gateway |
|----------|-------------|-------------|
| Primeira chamada | ~2s | ~2s |
| Chamada repetida (cache) | ~2s | **~50ms** ⚡ |
| Falha + fallback | Error | ~3s (auto recovery) |

### Otimizações

1. **Use cache** para requests repetitivos
2. **GPT-3.5-turbo** para tarefas simples (10x mais barato)
3. **Streaming** para melhor UX
4. **Fallback** para maior resiliência

---

## 🐛 Troubleshooting

### Cache não está funcionando

```typescript
// Verifique se useCache está true
const response = await callAIGateway(messages, {
  useCache: true  // ✅
})
```

### Rate limit muito restritivo

```bash
# Aumente o limite no .env
MAX_OPENAI_REQUESTS_PER_HOUR=200
```

### Fallback não ativa

```typescript
// Verifique se enableFallback está true
const response = await callAIGateway(messages, {
  enableFallback: true  // ✅
})
```

---

## 📚 Referências

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Cost Tracker](../lib/monitoring/cost-tracker.ts)
- [Performance Monitor](../lib/utils/performance.ts)
