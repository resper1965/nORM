# Política de Segurança

## 🔒 Versões Suportadas

Atualmente oferecemos suporte de segurança para as seguintes versões do nORM:

| Versão | Suportada          |
| ------ | ------------------ |
| 1.x    | ✅ Sim            |
| < 1.0  | ❌ Não            |

## 🚨 Reportando uma Vulnerabilidade

A segurança do nORM é levada muito a sério. Se você descobriu uma vulnerabilidade de segurança, agradecemos sua ajuda em divulgá-la de forma responsável.

### Como Reportar

**⚠️ NÃO crie uma issue pública para vulnerabilidades de segurança.**

Em vez disso, reporte através de um dos seguintes canais:

1. **GitHub Security Advisories (Recomendado)**
   - Acesse: https://github.com/resper1965/nORM/security/advisories/new
   - Preencha o formulário com detalhes da vulnerabilidade
   - Manteremos você atualizado sobre o progresso

2. **E-mail Privado**
   - Envie um e-mail para os mantenedores do projeto
   - Assunto: `[SECURITY] Vulnerabilidade em nORM`
   - Inclua todos os detalhes necessários (veja abaixo)

### Informações a Incluir

Para nos ajudar a entender e resolver o problema rapidamente, inclua:

- **Tipo de vulnerabilidade** (ex: XSS, SQL injection, CSRF, etc.)
- **Localização** (arquivo, linha de código, endpoint)
- **Impacto potencial** (o que um atacante poderia fazer)
- **Passos para reproduzir** (PoC se possível)
- **Versão afetada** do nORM
- **Configuração especial** necessária para explorar
- **Seu contato** para acompanhamento

### Exemplo de Report

```markdown
**Tipo**: Cross-Site Scripting (XSS)
**Severidade**: Alta
**Versão**: 1.0.0

**Descrição**:
O campo de comentários no dashboard não sanitiza entrada do usuário,
permitindo injeção de scripts maliciosos.

**Localização**:
- Arquivo: components/dashboard/comments.tsx
- Linha: 42

**PoC**:
1. Fazer login no dashboard
2. Navegar para /dashboard/comments
3. Inserir: <script>alert('XSS')</script>
4. O script é executado

**Impacto**:
Atacante pode roubar cookies de sessão e executar ações em nome do usuário.

**Contato**: security@example.com
```

## 🕒 Processo de Divulgação Responsável

### Timeline

1. **Dia 0**: Você reporta a vulnerabilidade
2. **Dia 1-2**: Confirmamos o recebimento
3. **Dia 3-7**: Investigamos e validamos
4. **Dia 7-30**: Desenvolvemos e testamos correção
5. **Dia 30**: Lançamos patch de segurança
6. **Dia 30+**: Divulgação pública coordenada

### Nossos Compromissos

- ✅ Responder ao seu report em **48 horas**
- ✅ Fornecer atualizações regulares sobre o progresso
- ✅ Creditar você na divulgação (se desejar)
- ✅ Manter confidencialidade até o patch ser lançado
- ✅ Trabalhar com você em uma timeline razoável

### Seus Compromissos

- ✅ Dar tempo razoável para correção antes de divulgação pública (90 dias)
- ✅ Não explorar a vulnerabilidade além do necessário para demonstração
- ✅ Não acessar, modificar ou deletar dados de outros usuários
- ✅ Manter confidencialidade da vulnerabilidade até divulgação coordenada

## 🛡️ Práticas de Segurança do Projeto

### Desenvolvimento Seguro

O nORM implementa as seguintes práticas de segurança:

#### Autenticação e Autorização
- ✅ Autenticação via Supabase Auth
- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ JWT tokens com expiração
- ✅ Refresh tokens seguros
- ✅ Validação de sessão em todas as requests

#### Proteção de Dados
- ✅ Criptografia em trânsito (HTTPS/TLS)
- ✅ Criptografia em repouso (Supabase)
- ✅ Sanitização de inputs
- ✅ Prepared statements (SQL injection prevention)
- ✅ Secrets em variáveis de ambiente

#### Headers de Segurança
```javascript
// vercel.json
{
  "headers": [
    {
      "key": "X-Frame-Options",
      "value": "DENY"
    },
    {
      "key": "X-Content-Type-Options",
      "value": "nosniff"
    },
    {
      "key": "X-XSS-Protection",
      "value": "1; mode=block"
    },
    {
      "key": "Referrer-Policy",
      "value": "strict-origin-when-cross-origin"
    },
    {
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    }
  ]
}
```

#### Validação e Sanitização
- ✅ Zod schemas para validação de dados
- ✅ Rate limiting em APIs públicas
- ✅ CORS configurado corretamente
- ✅ Sanitização de HTML (DOMPurify)

#### Dependências
- ✅ Dependabot ativo para atualização de dependências
- ✅ npm audit executado regularmente
- ✅ Renovate para updates automatizados

### CI/CD Security

- ✅ Secrets nunca commitados no código
- ✅ GitHub Actions com secrets criptografados
- ✅ Scan de vulnerabilidades em PRs
- ✅ SAST (Static Application Security Testing)

## 🚀 Atualizações de Segurança

### Como São Divulgadas

Patches de segurança são divulgados através de:

1. **GitHub Security Advisories**
2. **Release Notes** com tag `[SECURITY]`
3. **CHANGELOG.md** com seção de segurança
4. **Discussões no GitHub**

### Severidade

Classificamos vulnerabilidades usando CVSS 3.1:

| Severidade | Score CVSS | Tempo de Correção |
|-----------|-----------|------------------|
| 🔴 Critical | 9.0-10.0 | 7 dias |
| 🟠 High | 7.0-8.9 | 14 dias |
| 🟡 Medium | 4.0-6.9 | 30 dias |
| 🟢 Low | 0.1-3.9 | 90 dias |

## 🔐 Melhores Práticas para Usuários

### Configuração Segura

1. **Variáveis de Ambiente**
   ```bash
   # Nunca commite .env.local
   # Use secrets fortes e únicos
   NEXTAUTH_SECRET=$(openssl rand -base64 32)
   ```

2. **Supabase RLS**
   ```sql
   -- Sempre habilite RLS em tabelas sensíveis
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can only see their own data"
   ON users FOR SELECT
   USING (auth.uid() = id);
   ```

3. **API Keys**
   - Use variáveis de ambiente
   - Rotacione keys regularmente
   - Limite escopos e permissões
   - Monitore uso de APIs

4. **Deployment**
   - Use HTTPS always
   - Configure CORS corretamente
   - Habilite rate limiting
   - Monitore logs de acesso

### Checklist de Segurança

Antes de fazer deploy em produção:

- [ ] Todas as variáveis de ambiente configuradas
- [ ] RLS habilitado em todas as tabelas Supabase
- [ ] HTTPS configurado
- [ ] Headers de segurança configurados
- [ ] Rate limiting ativo
- [ ] Backup automático configurado
- [ ] Monitoring e alertas ativos
- [ ] Logs de acesso habilitados
- [ ] API keys rotacionadas
- [ ] Dependências atualizadas

## 📚 Recursos de Segurança

### Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)

### Tools de Segurança

- **SAST**: ESLint security plugins
- **Dependency Scanning**: Dependabot, npm audit
- **Secret Scanning**: GitHub secret scanning
- **Container Scanning**: Trivy (se aplicável)

## ❓ FAQ de Segurança

### P: Como posso verificar se minha instância está segura?
**R**: Execute o checklist de segurança acima e use ferramentas como [Mozilla Observatory](https://observatory.mozilla.org/) e [Security Headers](https://securityheaders.com/).

### P: Com que frequência devo atualizar?
**R**: Recomendamos atualizar para patches de segurança imediatamente e fazer updates regulares mensalmente.

### P: O que fazer se descobrir uma vulnerabilidade em produção?
**R**:
1. Avalie o impacto
2. Aplique mitigação imediata se possível
3. Atualize para versão corrigida
4. Monitore logs para exploração
5. Considere notificar usuários afetados

### P: Como proteger API keys?
**R**:
- Nunca commite no código
- Use secrets managers (Vercel Environment Variables)
- Rotacione regularmente
- Monitore uso
- Limite permissões ao mínimo necessário

## 🏆 Hall of Fame

Agradecemos os seguintes pesquisadores de segurança:

<!-- Lista será atualizada com reportes válidos -->

*Seja o primeiro a contribuir!*

## 📞 Contato

Para questões gerais de segurança (não vulnerabilidades):
- Abra uma [Discussion](https://github.com/resper1965/nORM/discussions) com tag `security`
- Consulte a [documentação](README.md)

---

**Última atualização**: 2025-12-30
**Versão**: 1.0.0

**Obrigado por ajudar a manter o nORM seguro! 🔒**
