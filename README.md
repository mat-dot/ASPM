# 🔐 ASPM Inteligente - Application Security Posture Management com IA

Uma plataforma elegante e sofisticada para gerenciamento de postura de segurança de aplicações, integrada com inteligência artificial para análise automática de vulnerabilidades, priorização de riscos e conformidade.

## ✨ Características Principais

### 📊 Dashboard Inteligente
- **Score de Risco Agregado**: Visualização em tempo real da postura de segurança geral
- **Métricas por Severidade**: Contagem de vulnerabilidades críticas, altas, médias e baixas
- **Atalhos Rápidos**: Acesso direto às principais funcionalidades
- **Tema Blueprint Matemático**: Design elegante com ciano pastel e rosa suave

### 🏢 Gerenciamento de Aplicações
- Cadastro e listagem de ativos monitorados
- Campos: nome, tipo, ambiente, repositório, responsável
- Operações CRUD completas com confirmação de exclusão
- Score de risco por aplicação

### 🔍 Gerenciamento de Vulnerabilidades
- Registro de vulnerabilidades com severidade (crítica, alta, média, baixa)
- Status de remediação (aberta, em remediação, resolvida)
- Identificadores CVE
- Filtros por severidade e status
- Operações CRUD com soft delete

### 🤖 Análise com IA (LLM)
- **Análise Automática de Vulnerabilidades**: 
  - Contexto técnico e exploração
  - Recomendações de remediação
  - Impacto potencial
  - Priorização automática
  
- **Chat de Segurança**:
  - Consultas sobre vulnerabilidades
  - Boas práticas de segurança
  - Conformidade e controles
  - Postura de segurança geral

### ✅ Painel de Conformidade
- Controles OWASP Top 10
- Referências CWE
- Status de conformidade por controle
- Percentual geral de conformidade
- Atualização de status (conforme, não conforme, em progresso)

### 🔐 Autenticação e Controle de Acesso
- OAuth integrado (Manus)
- Perfis de acesso: admin, analista, user
- Histórico de atividades para auditoria
- Logs de todas as operações

## 🏗️ Arquitetura

### Stack Tecnológico
- **Frontend**: React 19 + Tailwind CSS 4 + TypeScript
- **Backend**: Express 4 + tRPC 11 + Node.js
- **Database**: MySQL/TiDB com Drizzle ORM
- **IA**: Integração com LLM (Claude/GPT)
- **Auth**: OAuth Manus
- **Testes**: Vitest

### Estrutura de Pastas
```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas (Home, Applications, Vulnerabilities, Chat, Compliance)
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Configuração tRPC
│   │   └── index.css      # Tema blueprint
│   └── public/            # Assets estáticos
├── server/                # Backend Express
│   ├── routers.ts         # APIs tRPC
│   ├── db.ts              # Query helpers
│   └── _core/             # Infraestrutura (auth, LLM, etc)
├── drizzle/               # Schema e migrações
├── shared/                # Tipos compartilhados
└── tests/                 # Testes unitários
```

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 22+
- pnpm
- MySQL/TiDB
- Credenciais Manus OAuth

### Instalação

```bash
# Clonar repositório
git clone https://github.com/mat-dot/ASPM.git
cd ASPM

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Executar migrações
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Iniciar servidor de desenvolvimento
pnpm dev
```

### Acessar a Aplicação
```
http://localhost:3000
```

## 📚 Documentação

### Guia de Uso
Veja [USAGE.md](./USAGE.md) para instruções detalhadas sobre:
- Autenticação
- Gerenciamento de aplicações
- Registro e análise de vulnerabilidades
- Chat de segurança
- Painel de conformidade

### Testes
```bash
# Executar testes unitários
pnpm test

# Testes com cobertura
pnpm test -- --coverage
```

## 🔌 APIs Principais

### Dashboard
```typescript
trpc.dashboard.metrics.useQuery()
// Retorna: { totalApps, vulnerabilities, riskScore }
```

### Aplicações
```typescript
trpc.applications.list.useQuery()
trpc.applications.create.useMutation()
trpc.applications.update.useMutation()
trpc.applications.delete.useMutation()
```

### Vulnerabilidades
```typescript
trpc.vulnerabilities.list.useQuery({ applicationId })
trpc.vulnerabilities.create.useMutation()
trpc.vulnerabilities.update.useMutation()
trpc.vulnerabilities.delete.useMutation()
trpc.vulnerabilities.analyze.useMutation() // Análise com IA
```

### Chat
```typescript
trpc.chat.message.useMutation({ message: string })
```

### Conformidade
```typescript
trpc.compliance.controls.useQuery()
trpc.compliance.updateStatus.useMutation()
```

## 🎨 Design

### Tema Visual
- **Cores Primárias**: Ciano pastel (#06B6D4), Rosa suave (#EC4899)
- **Tipografia**: Inter (títulos), Space Mono (dados técnicos)
- **Componentes**: Glassmorphism, cards com sombra suave
- **Grid**: Padrão matemático de fundo

### Responsividade
- Mobile-first
- Breakpoints: sm, md, lg, xl
- Componentes adaptáveis

## 🧪 Testes

O projeto inclui 11 testes unitários cobrindo:
- Dashboard metrics
- CRUD de aplicações
- CRUD de vulnerabilidades
- Análise com LLM
- Conformidade
- Chat com IA
- Histórico de atividades

```bash
pnpm test
```

## 📋 Conformidade

### OWASP Top 10
- A01:2021 – Broken Access Control
- A02:2021 – Cryptographic Failures
- A03:2021 – Injection
- A04:2021 – Insecure Design
- A05:2021 – Security Misconfiguration
- A06:2021 – Vulnerable and Outdated Components
- A07:2021 – Identification and Authentication Failures
- A08:2021 – Software and Data Integrity Failures
- A09:2021 – Logging and Monitoring Failures
- A10:2021 – Server-Side Request Forgery (SSRF)

### CWE (Common Weakness Enumeration)
- Integração com principais CWEs
- Mapeamento com vulnerabilidades
- Recomendações de remediação

## 🔒 Segurança

- ✅ Autenticação OAuth
- ✅ Sessões seguras (HTTP-only cookies)
- ✅ Validação de entrada em todas as APIs
- ✅ Proteção CSRF
- ✅ Rate limiting
- ✅ Logs de auditoria
- ✅ Criptografia HTTPS

## 📊 Métricas

- **Score de Risco**: 0-100 (agregado de todas as vulnerabilidades)
- **Severidade**: Crítica (9-10), Alta (7-8), Média (4-6), Baixa (1-3)
- **Conformidade**: Percentual de controles implementados

## 🚀 Próximas Funcionalidades

- [ ] Integração com scanners (OWASP ZAP, Snyk, Trivy)
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Alertas em tempo real (email, Slack)
- [ ] Dashboard customizável
- [ ] Integração com SIEM
- [ ] Priorização automática com ML
- [ ] Histórico de tendências

## 📝 Licença

MIT

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor:
1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para questões ou problemas:
- Abra uma issue no GitHub
- Verifique a [documentação de uso](./USAGE.md)
- Contate o administrador do sistema

## 🙏 Agradecimentos

- React e comunidade
- tRPC e Drizzle ORM
- Manus por infraestrutura OAuth
- OpenAI/Anthropic por LLM

---

**Versão**: 1.0.0  
**Status**: Production Ready  
**Última Atualização**: Abril 2026

Desenvolvido com ❤️ para segurança de aplicações
