# 🔍 Por Que a Aplicação Parece um Mock?

## 🎯 Problema Identificado

A aplicação parece um mock porque há **valores hardcoded e fallbacks** que fazem parecer que há dados quando não há.

---

## 🐛 Problemas Encontrados

### 1. **Dashboard Principal** (`lib/data/dashboard.ts`)

#### ❌ Valores Hardcoded:
```typescript
// Linha 90: Fallback falso
value: avgScore || 85, // Fallback for empty DB to look good

// Linha 91-92: Trend hardcoded
trend: 2.5,
trendDirection: "up",

// Linha 97: Trend de mentions hardcoded
trend: 12,

// Linha 85: Sentiment mockado
sentiment: -0.8, // Mock for now or extract from relation?
```

**Problema:** Mesmo sem dados, mostra score 85 e trends positivos, fazendo parecer que há dados.

#### ❌ Gráficos SVG Hardcoded:
```typescript
// app/[locale]/(dashboard)/dashboard/page.tsx
// Linhas 114-125: Sparkline hardcoded
d="M0 25 L0 15 L10 18 L20 10..."

// Linhas 208-219: Chart hardcoded
d="M0 35 Q10 32 20 25 T40 20..."
```

**Problema:** Gráficos são SVG estáticos, não dados reais do banco.

### 2. **Outras Páginas Completamente Mockadas**

- `app/[locale]/documents/page.tsx` - Array hardcoded de documentos
- `app/[locale]/analytics/page.tsx` - Array hardcoded de payments
- `app/[locale]/mail/page.tsx` - Provavelmente mockado
- `app/[locale]/team/page.tsx` - Provavelmente mockado

---

## ✅ Soluções

### 1. Remover Fallbacks Falsos

**Antes:**
```typescript
value: avgScore || 85, // ❌ Mostra 85 mesmo sem dados
trend: 2.5, // ❌ Sempre positivo
```

**Depois:**
```typescript
value: avgScore || 0, // ✅ Mostra 0 quando não há dados
trend: calculateRealTrend(), // ✅ Calcula trend real
```

### 2. Calcular Trends Reais

Calcular trends comparando períodos anteriores:
- Comparar score atual vs 7 dias atrás
- Comparar mentions atual vs período anterior
- Mostrar "N/A" ou 0 quando não há dados suficientes

### 3. Usar Dados Reais nos Gráficos

Substituir SVG hardcoded por:
- Componentes Recharts com dados reais do banco
- Estados vazios quando não há dados
- Loading states apropriados

### 4. Extrair Sentiment Real

Buscar sentiment das relações:
```typescript
// Buscar sentiment da mention relacionada
const { data: mention } = await supabase
  .from('news_mentions')
  .select('sentiment_score')
  .eq('id', alert.related_mention_id)
  .single();

sentiment: mention?.sentiment_score || null
```

---

## 📋 Checklist de Correções

- [ ] Remover fallback `|| 85` do globalScore
- [ ] Calcular trend real comparando períodos
- [ ] Substituir gráficos SVG hardcoded por Recharts com dados reais
- [ ] Extrair sentiment real das relações
- [ ] Adicionar estados vazios apropriados
- [ ] Mostrar mensagens quando não há dados
- [ ] Corrigir páginas mockadas (documents, analytics, mail, team)

---

## 🎯 Resultado Esperado

Após correções:
- ✅ Dashboard mostra 0 quando não há dados
- ✅ Trends são calculados de forma real
- ✅ Gráficos usam dados do banco
- ✅ Estados vazios são mostrados apropriadamente
- ✅ Não há mais valores "fake" fazendo parecer que há dados
