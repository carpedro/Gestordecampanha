# 🎯 Campanhas EdTech

Sistema de gestão de campanhas comerciais para equipes de marketing de instituições de ensino.

---

## 🚨 IMPORTANTE - LEIA PRIMEIRO!

### Viu um erro ao tentar criar uma campanha?
👉 **"Institution not found"?** Leia: [`INSTITUTION_ERROR_FIX.md`](./INSTITUTION_ERROR_FIX.md)  
👉 **Outros erros?** Leia: [`ERROR_GUIDE.md`](./ERROR_GUIDE.md) - Solução rápida

### Configuração Inicial (OBRIGATÓRIA)
**O sistema não funcionará até você executar o script SQL de configuração!**

**Escolha seu guia:**
- 🎯 **Novo usuário?** → [`START_HERE.md`](./START_HERE.md) - Guia visual de 2 minutos
- 📺 **Visual learner?** → [`SUPABASE_VISUAL_GUIDE.md`](./SUPABASE_VISUAL_GUIDE.md) - Tutorial com screenshots
- ⚡ **Já sabe o que fazer?** → Execute [`EXECUTE_NOW.sql`](./EXECUTE_NOW.sql) no SQL Editor

---

## 🚀 Visão Geral

O **Campanhas EdTech** é uma plataforma completa para gerenciar iniciativas comerciais, com recursos avançados de colaboração, calendários interativos, sistema de anexos e histórico de edições.

### Principais Funcionalidades

- ✅ **Sistema Aberto** - Sem necessidade de login ou autenticação
- ✅ **Gestão Completa de Campanhas** - CRUD com estados (Rascunho, Publicado, Arquivado)
- ✅ **Página Individual Estilo Jira** - Layout em 3 colunas com edição inline
- ✅ **Sistema de Comentários** - Threads aninhadas com replies
- ✅ **Filtros Avançados** - Multi-select com badges visuais
- ✅ **Calendário Interativo** - Zoom progressivo (Mês → Semana → Dia)
- ✅ **Visualizações Gantt e Tabela** - Análises visuais de campanhas
- ✅ **Sistema de Anexos** - 9 tipos de arquivos com drag & drop
- ✅ **Gravação de Áudio** - Com transcrição automática
- ✅ **Histórico de Edições** - Timeline completa com diff visual
- ✅ **Responsividade Mobile** - Layout adaptativo com gestos touch

## 🏗️ Arquitetura

```
Frontend (React + TypeScript + Tailwind)
    ↓
Supabase Edge Functions (Hono Web Server)
    ↓
PostgreSQL Database (12 tabelas + triggers)
```

### Tecnologias

- **Frontend:** React, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend:** Supabase Edge Functions, Hono
- **Banco de Dados:** PostgreSQL (Supabase)
- **Storage:** Supabase Storage
- **Arquitetura:** Sistema aberto sem autenticação

## 📦 Estrutura do Projeto

```
├── components/           # Componentes React
│   ├── Auth/            # Componentes de autenticação
│   ├── ui/              # Componentes Shadcn/ui
│   └── ...              # Componentes da aplicação
├── supabase/
│   └── functions/
│       └── server/      # Edge Functions (Backend)
├── types/               # TypeScript types
├── utils/               # Utilitários e services
└── styles/              # CSS global
```

## 🔧 Configuração

### 1. Pré-requisitos

- Conta no Supabase
- Node.js 18+
- Banco de dados PostgreSQL configurado no Supabase

### 2. Configurar Supabase

1. Crie um novo projeto no [Supabase](https://app.supabase.com)

2. **🚨 CRÍTICO - Execute o script SQL primeiro!**
   
   Escolha UMA das opções:
   
   **Opção A - Correção Rápida** (⚡ 30 segundos - RECOMENDADO):
   - Arquivo: `/quick_fix.sql`
   - Cria usuário sistema e remove constraints
   - Suficiente para o sistema funcionar
   
   **Opção B - Correção Completa** (🔧 2 minutos):
   - Arquivo: `/database_fix.sql`
   - Inclui triggers, views e dados iniciais
   - Configuração mais robusta
   
   **Como executar:**
   - Abra: Supabase Dashboard → SQL Editor
   - New query
   - Cole TODO o conteúdo do arquivo escolhido
   - Clique em Run (Ctrl/Cmd + Enter)
   - Aguarde conclusão
   
   ⚠️ **Atenção**: O sistema NÃO funcionará sem este passo! Veja detalhes em `/CRITICAL_FIX_SUMMARY.md`

3. Verifique se os dados foram inseridos:
   - 1 usuário sistema criado
   - 8 instituições (se usou `database_fix.sql`)
   - 18+ tags (se usou `database_fix.sql`)

### 3. Configurar Storage

O sistema criará automaticamente o bucket `make-a1f709fc-attachments` ao fazer o primeiro upload.

### 4. Testar Conectividade

Execute os testes rápidos disponíveis em `/QUICK_TEST.md` para garantir que tudo está funcionando.

## 📱 Uso

**Sistema Aberto**: Não é necessário fazer login. Acesse a aplicação e comece a usar imediatamente!

### Criar Nova Campanha

1. Clique em **"+ Nova Campanha"**
2. Preencha título, descrição, instituição
3. Defina datas de início e término
4. Adicione tags relacionadas
5. Salve como rascunho ou publique

### Editar Campanha

1. Click no card da campanha
2. Edite campos inline (título, descrição, status)
3. Alterações são salvas automaticamente
4. Veja o histórico de edições na aba **History**

### Adicionar Anexos

1. Na página da campanha, role até **Anexos**
2. Arraste arquivos ou clique para selecionar
3. Tipos suportados: imagens, vídeos, documentos, áudio
4. Limite: 100MB por arquivo

### Comentar

1. Use a thread lateral direita (desktop) ou aba **Comments** (mobile)
2. Digite seu comentário
3. Responda comentários existentes
4. Comentários aparecem em ordem cronológica

### Filtrar Campanhas

1. Clique em **"Filtros"**
2. Selecione múltiplos critérios:
   - Instituições
   - Status
   - Tags
   - Criadores
   - Período
3. Veja badges dos filtros ativos
4. Remova individualmente ou limpe todos

### Atalhos de Teclado (Desktop)

**No Calendário:**
- `M` - Visualização Mês
- `W` - Visualização Semana
- `D` - Visualização Dia
- `T` - Voltar para Hoje
- `←/→` - Navegar períodos

**Na Edição:**
- `Esc` - Cancelar edição
- `Ctrl+S` - Salvar (onde aplicável)

## 🗃️ Banco de Dados

### Principais Tabelas

- `campaigns` - Campanhas comerciais
- `comments` - Comentários e replies
- `attachments` - Arquivos anexados
- `campaign_audit` - Histórico de alterações
- `campaign_tags` - Relacionamento com tags
- `tags` - Tags de categorização
- `institutions` - Instituições de ensino
- `users` - Usuário sistema (1 registro apenas)

### Relacionamentos

```
institutions → campaigns (institution_id)
campaigns → comments (campaign_id)
comments → comments (parent_id) [self-reference]
campaigns → attachments (campaign_id)
campaigns → campaign_audit (campaign_id)
campaigns ← campaign_tags → tags
```

## 🔓 Sistema Aberto

Este sistema **não possui autenticação**. Todos os usuários têm acesso completo a todas as funcionalidades:

- ✅ Criar e editar campanhas
- ✅ Comentar e responder
- ✅ Adicionar/remover anexos
- ✅ Ver histórico de edições
- ✅ Excluir conteúdo
- ✅ Aplicar filtros
- ✅ Visualizar todas as campanhas

## 📚 Documentação Adicional

### Funcionalidades e UX
- [FEATURES.md](./FEATURES.md) - Lista completa de funcionalidades
- [MOBILE_UX.md](./MOBILE_UX.md) - Guia de UX mobile

### Conectividade e Deploy
- [DATABASE_CONNECTIVITY.md](./DATABASE_CONNECTIVITY.md) - Guia técnico completo de conectividade
- [database_fix.sql](./database_fix.sql) - Script de correção do banco (EXECUTAR OBRIGATORIAMENTE)
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Checklist passo a passo para deploy
- [RESUMO_CONECTIVIDADE.md](./RESUMO_CONECTIVIDADE.md) - Resumo executivo do estado atual
- [FLUXO_COMPLETO.md](./FLUXO_COMPLETO.md) - Diagramas de fluxo de dados
- [QUICK_TEST.md](./QUICK_TEST.md) - Testes rápidos de conectividade

## 🐛 Troubleshooting

### Erro: "Institution not found"

**Causa**: Instituições não foram inseridas no banco  
**Solução**: Execute o script `/database_fix.sql` no Supabase SQL Editor

### Erro: "column user_id does not exist"

**Causa**: Triggers antigos ainda ativos  
**Solução**: Execute o script `/database_fix.sql` para removê-los

### Anexos não aparecem

- Verifique se o bucket `make-a1f709fc-attachments` foi criado
- Aguarde 1 minuto (criação automática na primeira vez)
- Confirme tamanho máximo do arquivo (100MB)

### Interface não carrega

- Abra Console do navegador (F12) → Veja erros
- Verifique variáveis em `/utils/supabase/info.tsx`
- Confirme que Edge Function está ativa no Supabase

### Comentários não salvam

- Verifique logs do servidor: Supabase → Edge Functions → Logs
- Confirme que o `campaign_id` é válido
- Execute testes de conectividade em `/QUICK_TEST.md`

## 🚧 Roadmap

### Funcionalidades Futuras
- [ ] Notificações de campanhas expirando
- [ ] Exportação de relatórios PDF
- [ ] Dashboard com métricas agregadas
- [ ] Templates de campanhas
- [ ] Busca full-text avançada
- [ ] Modo escuro
- [ ] PWA (Progressive Web App)

### Possíveis Melhorias
- [ ] Sistema de autenticação opcional (se necessário)
- [ ] Workflows de aprovação
- [ ] Integração com Google Calendar
- [ ] API de transcrição real (OpenAI Whisper)

## 📄 Licença

Este projeto foi desenvolvido como sistema interno para gestão de campanhas educacionais.

## 🤝 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação em `/DATABASE_CONNECTIVITY.md`
2. Execute os testes em `/QUICK_TEST.md`
3. Verifique logs:
   - **Frontend**: F12 → Console
   - **Backend**: Supabase → Edge Functions → Logs
   - **Banco**: Supabase → Database → Logs

## ⚠️ Importante

**Antes de usar o sistema, execute obrigatoriamente:**
```sql
-- No Supabase SQL Editor:
-- Cole e execute TODO o conteúdo de: /database_fix.sql
```

Este script:
- Remove triggers com erros
- Adiciona campos necessários
- Insere dados iniciais (instituições, tags)
- Corrige estrutura do banco

**Sem executar este script, o sistema NÃO funcionará corretamente!**

---

**Desenvolvido para equipes de marketing EdTech** 🎓  
**Sistema aberto sem autenticação** 🔓
