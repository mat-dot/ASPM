# 🤝 Contribuindo para ASPM Inteligente

Obrigado por considerar contribuir para o ASPM Inteligente! Este documento fornece diretrizes e instruções para contribuir.

## 📋 Código de Conduta

- Seja respeitoso e inclusivo
- Aceite críticas construtivas
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros da comunidade

## 🚀 Como Contribuir

### Reportar Bugs

Antes de criar um relatório de bug, verifique a lista de issues, pois você pode descobrir que o bug já foi reportado.

Ao reportar um bug, inclua:
- **Título descritivo**
- **Descrição exata do comportamento observado**
- **Comportamento esperado**
- **Passos para reproduzir**
- **Screenshots/logs** (se aplicável)
- **Seu ambiente** (OS, Node version, etc)

### Sugerir Melhorias

Sugestões de melhorias são sempre bem-vindas! Ao sugerir uma melhoria:
- Use um **título descritivo**
- Forneça uma **descrição detalhada** da melhoria sugerida
- Liste **exemplos** de como a melhoria seria usada
- Explique por que essa melhoria seria **útil**

### Pull Requests

- Siga o estilo de código existente
- Inclua testes apropriados
- Atualize a documentação conforme necessário
- Faça commits com mensagens claras
- Referencie issues relacionadas

## 🛠️ Configuração de Desenvolvimento

### Pré-requisitos
```bash
- Node.js 22+
- pnpm 10+
- MySQL 8+ ou TiDB
```

### Setup Local

```bash
# 1. Fork e clone
git clone https://github.com/seu-usuario/ASPM.git
cd ASPM

# 2. Instalar dependências
pnpm install

# 3. Configurar ambiente
cp .env.example .env
# Editar .env com suas credenciais

# 4. Executar migrações
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# 5. Iniciar desenvolvimento
pnpm dev
```

### Estrutura de Pastas

```
├── client/           # Frontend React
├── server/           # Backend Express + tRPC
├── drizzle/          # Schema e migrações
├── shared/           # Tipos compartilhados
└── tests/            # Testes
```

## 📝 Padrões de Código

### TypeScript
- Use tipos explícitos sempre que possível
- Evite `any` - use tipos genéricos
- Documente tipos complexos

### React
- Use functional components
- Prefira hooks ao invés de classes
- Mantenha componentes pequenos e reutilizáveis

### tRPC
- Defina procedures em `server/routers.ts`
- Use `protectedProcedure` para rotas autenticadas
- Valide inputs com Zod

### Banco de Dados
- Escreva migrations com Drizzle
- Use transações para operações críticas
- Adicione índices para queries frequentes

## 🧪 Testes

```bash
# Executar testes
pnpm test

# Testes com watch
pnpm test -- --watch

# Cobertura
pnpm test -- --coverage
```

### Escrevendo Testes
- Use Vitest
- Teste comportamento, não implementação
- Mantenha testes independentes
- Use nomes descritivos

Exemplo:
```typescript
describe("applications.create", () => {
  it("should create application with valid data", async () => {
    const result = await caller.applications.create({
      name: "Test App",
      type: "web",
      environment: "prod",
    });
    expect(result.id).toBeDefined();
  });
});
```

## 📚 Documentação

- Atualize README.md para mudanças significativas
- Documente novas APIs em comentários JSDoc
- Mantenha USAGE.md atualizado
- Adicione exemplos para funcionalidades complexas

## 🔄 Processo de Review

1. **Submeta um PR** com descrição clara
2. **Aguarde review** - pode levar alguns dias
3. **Responda feedback** - faça ajustes conforme necessário
4. **Merge** - após aprovação

## 📦 Releases

Versões seguem [Semantic Versioning](https://semver.org/):
- **MAJOR**: Mudanças incompatíveis
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs

## 🎯 Áreas de Contribuição

### Frontend
- [ ] Melhorias de UI/UX
- [ ] Novos componentes
- [ ] Otimizações de performance
- [ ] Acessibilidade

### Backend
- [ ] Novas APIs
- [ ] Otimizações de queries
- [ ] Melhorias de segurança
- [ ] Tratamento de erros

### Documentação
- [ ] Guias de setup
- [ ] Exemplos de uso
- [ ] Documentação de API
- [ ] Tutoriais

### Testes
- [ ] Cobertura de testes
- [ ] Testes de integração
- [ ] Testes de performance
- [ ] Testes E2E

## 🐛 Encontrou um Bug de Segurança?

**Não abra uma issue pública!** Envie um email para security@aspm.dev com detalhes.

## ❓ Dúvidas?

- Abra uma discussão no GitHub
- Verifique a documentação existente
- Procure em issues fechadas

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença MIT do projeto.

---

Obrigado por contribuir! 🎉
