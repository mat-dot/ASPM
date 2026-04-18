# 🏗️ Arquitetura ASPM Inteligente

Documentação técnica detalhada da arquitetura do ASPM Inteligente.

## 📐 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React 19 + Tailwind CSS 4 + TypeScript             │   │
│  │  ├─ Pages (Home, Apps, Vulns, Chat, Compliance)    │   │
│  │  ├─ Components (UI, Forms, Charts)                 │   │
│  │  └─ tRPC Client (type-safe API calls)              │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                            ↓ HTTPS
┌──────────────────────────────────────────────────────────────┐
│                    Express Server (Node.js)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  tRPC Router (type-safe RPC)                        │   │
│  │  ├─ Dashboard Router (metrics)                      │   │
│  │  ├─ Applications Router (CRUD)                      │   │
│  │  ├─ Vulnerabilities Router (CRUD + analysis)       │   │
│  │  ├─ Chat Router (LLM integration)                  │   │
│  │  ├─ Compliance Router (OWASP/CWE)                  │   │
│  │  └─ Activity Router (audit logs)                   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Middleware                                         │   │
│  │  ├─ OAuth Authentication                           │   │
│  │  ├─ CORS & Security Headers                        │   │
│  │  ├─ Error Handling                                 │   │
│  │  └─ Logging                                        │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
         ↓                    ↓                    ↓
    ┌────────┐          ┌──────────┐        ┌──────────┐
    │ MySQL  │          │ LLM API  │        │ OAuth    │
    │ TiDB   │          │ (Claude) │        │ Provider │
    └────────┘          └──────────┘        └──────────┘
```

## 🗄️ Modelo de Dados

### Tabelas Principais

#### `users`
```typescript
{
  id: number (PK)
  openId: string (unique) // OAuth identifier
  name: string
  email: string
  loginMethod: string
  role: enum['user', 'admin', 'analista']
  createdAt: timestamp
  updatedAt: timestamp
  lastSignedIn: timestamp
}
```

#### `applications`
```typescript
{
  id: number (PK)
  name: string
  type: string // web, api, mobile, etc
  environment: string // prod, staging, dev
  repository: string (optional)
  responsible: string
  riskScore: decimal
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `vulnerabilities`
```typescript
{
  id: number (PK)
  applicationId: number (FK)
  title: string
  description: text
  severity: enum['crítica', 'alta', 'média', 'baixa']
  status: enum['aberta', 'em remediação', 'resolvida']
  cve: string (optional)
  discoveredAt: timestamp
  resolvedAt: timestamp (optional)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `complianceControls`
```typescript
{
  id: number (PK)
  name: string
  category: string // OWASP_TOP_10, CWE
  description: text
  createdAt: timestamp
}
```

#### `applicationCompliance`
```typescript
{
  id: number (PK)
  applicationId: number (FK)
  controlId: number (FK)
  status: enum['conforme', 'não conforme', 'em progresso']
  notes: text (optional)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### `activityLogs`
```typescript
{
  id: number (PK)
  userId: number (FK)
  action: string
  entityType: string
  entityId: number
  details: json
  createdAt: timestamp
}
```

## 🔌 APIs tRPC

### Estrutura de Procedure

```typescript
// Public procedure (sem autenticação)
publicProcedure
  .input(z.object({ ... }))
  .query(async ({ input, ctx }) => { ... })

// Protected procedure (requer autenticação)
protectedProcedure
  .input(z.object({ ... }))
  .mutation(async ({ input, ctx }) => { ... })
```

### Exemplo: Análise de Vulnerabilidade

```typescript
vulnerabilities: router({
  analyze: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // 1. Buscar vulnerabilidade
      const vuln = await getVulnerability(input.id);
      
      // 2. Chamar LLM
      const analysis = await invokeLLM({
        messages: [{
          role: "user",
          content: `Analise esta vulnerabilidade: ${vuln.description}`
        }]
      });
      
      // 3. Log de atividade
      await createActivityLog({
        userId: ctx.user.id,
        action: "analyze_vulnerability",
        entityId: input.id
      });
      
      return { analysis: analysis.choices[0].message.content };
    })
})
```

## 🔐 Autenticação e Autorização

### Fluxo OAuth

```
1. User clica "Login"
   ↓
2. Redireciona para OAuth Provider
   ↓
3. Provider retorna authorization code
   ↓
4. Backend troca code por access token
   ↓
5. Backend cria session cookie
   ↓
6. User autenticado no frontend
```

### Controle de Acesso

```typescript
// Role-based access control
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  return next({ ctx });
});
```

## 🤖 Integração com LLM

### Análise de Vulnerabilidades

```typescript
async function analyzeVulnerability(vuln: Vulnerability) {
  const prompt = `
    Analise esta vulnerabilidade de segurança:
    - Título: ${vuln.title}
    - Descrição: ${vuln.description}
    - Severidade: ${vuln.severity}
    - CVE: ${vuln.cve}
    
    Forneça:
    1. Análise técnica
    2. Contexto de exploração
    3. Recomendações de remediação
    4. Impacto potencial
  `;
  
  const response = await invokeLLM({
    messages: [{ role: "user", content: prompt }]
  });
  
  return response.choices[0].message.content;
}
```

### Chat de Segurança

```typescript
async function chatWithAI(message: string, context: string) {
  const systemPrompt = `
    Você é um especialista em segurança de aplicações.
    Contexto da organização: ${context}
    Responda perguntas sobre vulnerabilidades, boas práticas e conformidade.
  `;
  
  const response = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ]
  });
  
  return response.choices[0].message.content;
}
```

## 📊 Cálculo de Score de Risco

```typescript
function calculateRiskScore(vulnerabilities: Vulnerability[]): number {
  const weights = {
    crítica: 10,
    alta: 7,
    média: 4,
    baixa: 1
  };
  
  const totalScore = vulnerabilities.reduce((sum, vuln) => {
    const weight = weights[vuln.severity];
    const statusMultiplier = vuln.status === 'aberta' ? 1 : 0.5;
    return sum + (weight * statusMultiplier);
  }, 0);
  
  // Normalizar para 0-100
  return Math.min(100, (totalScore / (vulnerabilities.length * 10)) * 100);
}
```

## 🎨 Frontend Architecture

### Estrutura de Componentes

```
App.tsx (Router)
├── Home (Dashboard)
├── Applications
│   ├── ApplicationList
│   ├── ApplicationForm
│   └── ApplicationCard
├── Vulnerabilities
│   ├── VulnerabilityList
│   ├── VulnerabilityForm
│   ├── VulnerabilityCard
│   └── AnalysisModal
├── Chat
│   ├── ChatWindow
│   ├── MessageList
│   └── InputForm
└── Compliance
    ├── ComplianceStats
    ├── ControlList
    └── ControlCard
```

### State Management

```typescript
// tRPC Query (read)
const { data, isLoading } = trpc.applications.list.useQuery();

// tRPC Mutation (write)
const createMutation = trpc.applications.create.useMutation({
  onSuccess: () => {
    // Invalidate queries
    trpc.useUtils().applications.list.invalidate();
  }
});
```

## 🧪 Estratégia de Testes

### Testes Unitários

```typescript
describe("vulnerabilities.analyze", () => {
  it("should analyze vulnerability with LLM", async () => {
    const result = await caller.vulnerabilities.analyze({
      id: 1
    });
    expect(result.analysis).toBeDefined();
    expect(result.analysis).toContain("recomendação");
  });
});
```

### Cobertura

- Dashboard metrics: ✅
- CRUD operations: ✅
- LLM integration: ✅
- Compliance: ✅
- Activity logging: ✅

## 🚀 Performance

### Otimizações

1. **Database**
   - Índices em foreign keys
   - Queries otimizadas com Drizzle
   - Paginação para listas grandes

2. **Frontend**
   - Code splitting com Vite
   - Lazy loading de componentes
   - Memoização de componentes pesados

3. **API**
   - Caching com tRPC
   - Compressão GZIP
   - Rate limiting

## 🔒 Segurança

### Medidas Implementadas

1. **Autenticação**
   - OAuth 2.0
   - Session cookies (HTTP-only)
   - JWT para APIs

2. **Validação**
   - Zod schemas em todas as inputs
   - Sanitização de strings
   - Proteção contra SQL injection

3. **Autorização**
   - Role-based access control
   - Verificação de permissões em procedures
   - Audit logs de todas as ações

4. **Comunicação**
   - HTTPS/TLS
   - CORS configurado
   - CSRF protection

## 📈 Escalabilidade

### Considerações para Crescimento

1. **Database**
   - Usar read replicas
   - Sharding por aplicação
   - Caching com Redis

2. **API**
   - Load balancing
   - Horizontal scaling
   - Message queues para LLM

3. **Frontend**
   - CDN para assets
   - Service workers
   - Progressive enhancement

## 🔄 Deployment

### Processo

```bash
# 1. Build
pnpm build

# 2. Test
pnpm test

# 3. Deploy
npm run start
```

### Variáveis de Ambiente

```
DATABASE_URL
JWT_SECRET
OAUTH_SERVER_URL
BUILT_IN_FORGE_API_KEY
```

## 📚 Referências

- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [React Documentation](https://react.dev)
- [Express.js](https://expressjs.com)

---

**Última Atualização**: Abril 2026
