# ASPM Inteligente - Guia de Uso

Bem-vindo ao **ASPM Inteligente**, uma plataforma elegante de gerenciamento de postura de segurança de aplicações com análise inteligente por IA.

## 🚀 Início Rápido

### Autenticação

1. Acesse a aplicação pelo URL fornecido
2. Clique em **"Login"** no canto superior direito
3. Autentique-se com suas credenciais Manus
4. Você será redirecionado para o dashboard

### Perfis de Acesso

- **Admin**: Acesso completo a todas as funcionalidades
- **Analista**: Acesso a visualização e análise de vulnerabilidades
- **Usuário**: Acesso limitado a consultas

## 📊 Dashboard

O dashboard exibe:

- **Score Médio de Risco**: Agregação de todos os riscos da organização
- **Contagem de Vulnerabilidades**: Separadas por severidade (Crítica, Alta, Média, Baixa)
- **Total de Aplicações**: Número de ativos monitorados
- **Atalhos Rápidos**: Links para as principais funcionalidades

## 🏢 Gerenciamento de Aplicações

### Criar Aplicação

1. Acesse **Aplicações** no menu principal
2. Clique em **"Nova Aplicação"**
3. Preencha os campos:
   - **Nome**: Identificador único da aplicação
   - **Tipo**: web, api, mobile, etc.
   - **Ambiente**: prod, staging, dev
   - **Repositório**: URL do repositório (opcional)
   - **Responsável**: Pessoa responsável pela aplicação
4. Clique em **"Criar Aplicação"**

### Editar/Deletar Aplicação

- **Editar**: Clique no ícone de lápis (em desenvolvimento)
- **Deletar**: Clique no ícone de lixeira com confirmação

## 🔍 Gerenciamento de Vulnerabilidades

### Registrar Vulnerabilidade

1. Acesse **Vulnerabilidades**
2. Clique em **"Nova Vulnerabilidade"**
3. Preencha os campos:
   - **Aplicação**: Selecione a aplicação afetada
   - **Título**: Descrição breve da vulnerabilidade
   - **Severidade**: Crítica, Alta, Média ou Baixa
   - **CVE**: Identificador CVE (opcional)
   - **Descrição**: Detalhes técnicos
4. Clique em **"Registrar Vulnerabilidade"**

### Analisar Vulnerabilidade com IA

1. Localize a vulnerabilidade na lista
2. Clique no botão **"Analisar"**
3. A IA gerará:
   - Análise técnica da vulnerabilidade
   - Contexto de exploração
   - Recomendações de remediação
   - Impacto potencial

### Filtrar Vulnerabilidades

Use os filtros no topo da página:

- **Por Severidade**: Crítica, Alta, Média, Baixa
- **Por Status**: Aberta, Em Remediação, Resolvida

### Atualizar Status

1. Clique em uma vulnerabilidade
2. Selecione o novo status:
   - **Aberta**: Vulnerabilidade identificada, sem ação iniciada
   - **Em Remediação**: Ações corretivas em andamento
   - **Resolvida**: Vulnerabilidade foi corrigida

## 💬 Chat de Segurança com IA

### Consultar Informações

1. Acesse **Chat de Segurança**
2. Digite sua pergunta sobre:
   - Vulnerabilidades específicas
   - Boas práticas de segurança
   - Conformidade e controles
   - Postura de segurança geral
3. Pressione **Enter** ou clique em **Enviar**
4. A IA fornecerá uma resposta detalhada

### Exemplos de Perguntas

- "Quais são os riscos do OWASP Top 10?"
- "Como mitigar SQL Injection?"
- "Qual é a diferença entre CWE e CVE?"
- "Qual é a postura de segurança atual?"

## ✅ Painel de Conformidade

### Visualizar Controles

1. Acesse **Conformidade**
2. Veja a lista de controles OWASP Top 10 e CWE
3. Visualize o percentual geral de conformidade

### Atualizar Status de Conformidade

1. Localize o controle na lista
2. Clique em um dos botões de status:
   - **✓ Conforme**: Controle está implementado
   - **⏳ Progresso**: Controle em implementação
   - **✕ Não Conforme**: Controle não implementado

## 📋 Histórico de Atividades

O sistema registra automaticamente:

- Criação de aplicações
- Registro de vulnerabilidades
- Atualizações de status
- Mudanças de conformidade
- Análises com IA

Estas ações são rastreadas para auditoria e compliance.

## 🎨 Interface e Design

A plataforma utiliza um design elegante inspirado em blueprints matemáticos:

- **Cores**: Ciano pastel (#06B6D4) e rosa suave (#EC4899)
- **Tipografia**: Inter (títulos) e Space Mono (dados técnicos)
- **Componentes**: Cards com efeito glassmorphism
- **Responsividade**: Funciona em desktop, tablet e mobile

## ⚙️ Configurações

### Tema

- A aplicação detecta automaticamente o tema do sistema (claro/escuro)
- Você pode alternar manualmente se disponível

### Logout

1. Clique no seu nome/avatar no canto superior direito
2. Selecione **"Logout"**
3. Você será redirecionado para a página de login

## 🔒 Segurança

- Todas as comunicações são criptografadas (HTTPS)
- Autenticação via OAuth
- Sessões seguras com cookies HTTP-only
- Validação de entrada em todas as APIs
- Logs de auditoria para todas as ações

## 📞 Suporte

Para questões ou problemas:

1. Verifique se você está autenticado
2. Tente recarregar a página
3. Limpe o cache do navegador
4. Contate o administrador do sistema

## 🚀 Próximas Funcionalidades

- Edição em tempo real de aplicações
- Exportação de relatórios
- Integração com scanners de segurança
- Alertas automáticos
- Dashboard customizável

---

**Versão**: 1.0.0  
**Última Atualização**: Abril 2026  
**Desenvolvido com**: React, tRPC, Express, MySQL, LLM
