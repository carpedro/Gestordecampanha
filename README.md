# 🚀 Gestor de Campanhas EdTech

Sistema completo de gerenciamento de campanhas para instituições de ensino, com visualizações em calendário, Gantt, tabela e cards.

![Status](https://img.shields.io/badge/status-active-success.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)

## ✨ Features

### 📊 Visualizações Múltiplas
- **Calendário** - Visualize campanhas em formato de calendário mensal
- **Gantt** - Timeline interativo com duração das campanhas
- **Tabela** - Listagem completa com ordenação e busca
- **Cards** - Visão em cartões com detalhes resumidos

### 🎯 Gestão Completa
- ✅ Criar, editar e excluir campanhas
- ✅ Status (Rascunho, Publicado, Arquivado)
- ✅ Tags relacionadas e excludentes
- ✅ Múltiplas instituições de ensino
- ✅ Datas de início e fim
- ✅ Descrição com suporte a áudio

### 📎 Anexos e Colaboração
- ✅ Upload de arquivos (imagens, documentos, vídeos)
- ✅ Galeria de anexos
- ✅ Sistema de comentários
- ✅ Histórico de alterações completo

### 🔍 Filtros Avançados
- Por instituição
- Por status
- Por tags
- Por criador
- Por período

## 🏗️ Arquitetura

```
Frontend (React + TypeScript)
    ↓
Edge Functions (Hono)
    ↓
PostgreSQL (Supabase)
    ↓
Storage (Supabase)
```

### Stack Tecnológico

- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui, Tailwind CSS, Lucide Icons
- **Backend**: Supabase Edge Functions (Deno + Hono)
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage
- **Forms**: React Hook Form
- **Notifications**: Sonner

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- Conta no Supabase
- Supabase CLI

### Instalação em 5 Passos

#### 1. Clone o Repositório

```bash
git clone [url-do-repositorio]
cd Gestordecampanha
```

#### 2. Configure o Supabase

1. Crie um projeto em https://supabase.com
2. Execute o script SQL completo:
   - Vá em **SQL Editor** no dashboard
   - Copie todo conteúdo de `SETUP_DATABASE.sql`
   - Execute (Run)

#### 3. Deploy da Edge Function

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Linkar projeto
supabase link --project-ref seu-project-id

# Criar estrutura
mkdir -p supabase/functions/make-server-a1f709fc

# Copiar função
cp src/supabase/functions/server/index.tsx supabase/functions/make-server-a1f709fc/index.ts

# Deploy
supabase functions deploy make-server-a1f709fc

# Configurar variáveis
supabase secrets set SUPABASE_URL=https://seu-project-id.supabase.co
supabase secrets set SUPABASE_ANON_KEY=sua-anon-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

#### 4. Configure o Frontend

Crie `src/utils/supabase/info.tsx`:

```typescript
export const projectId = 'seu-project-id';
export const publicAnonKey = 'sua-anon-key';
```

#### 5. Execute

```bash
npm install
npm run dev
```

Acesse: http://localhost:5173

## 📚 Documentação

- **📖 [Guia de Instalação Completo](GUIA_DE_INSTALACAO.md)** - Passo a passo detalhado
- **⚡ [Início Rápido](INICIO_RAPIDO.md)** - Setup em 5 minutos
- **📁 [Arquivos Importantes](ARQUIVOS_IMPORTANTES.md)** - Entenda a estrutura do projeto

## 🗂️ Estrutura do Projeto

```
Gestordecampanha/
├── src/
│   ├── components/          # Componentes React
│   │   ├── CampaignsApp.tsx      # App principal
│   │   ├── CampaignDetailPage.tsx # Detalhe da campanha
│   │   ├── CalendarView.tsx      # Visualização calendário
│   │   ├── GanttView.tsx         # Visualização Gantt
│   │   └── ui/                   # Componentes UI (shadcn)
│   ├── types/               # Definições TypeScript
│   │   ├── campaign.ts
│   │   ├── user.ts
│   │   └── comment.ts
│   ├── utils/               # Services e utilitários
│   │   ├── campaignService.ts    # API de campanhas
│   │   ├── commentService.ts     # API de comentários
│   │   └── supabase/
│   │       ├── client.ts         # Cliente Supabase
│   │       └── info.tsx          # Credenciais (não commitado)
│   └── supabase/functions/  # Edge Functions
│       └── server/
│           └── index.tsx         # API Backend
├── SETUP_DATABASE.sql       # ⭐ Script de criação do banco
├── GUIA_DE_INSTALACAO.md    # Documentação completa
├── INICIO_RAPIDO.md         # Setup rápido
└── package.json
```

## 🗄️ Banco de Dados

### Tabelas Principais

- **users** - Usuários do sistema
- **campaigns** - Campanhas de marketing
- **institutions** - Instituições de ensino
- **tags** - Tags de categorização
- **campaign_tags** - Relacionamento N:N
- **attachments** - Arquivos anexados
- **comments** - Comentários
- **campaign_audit** - Histórico de alterações

### Diagrama (Simplificado)

```
users ──┬─────┐
        │     │
        ↓     │
   campaigns ─┤
        │     │
        ├─────┘
        │
        ├──→ campaign_tags ──→ tags
        ├──→ attachments
        ├──→ comments
        └──→ campaign_audit
```

## 🔒 Segurança

- ✅ Row Level Security (RLS) no Supabase
- ✅ Credenciais não commitadas (`.gitignore`)
- ✅ Service Role Key apenas no backend
- ✅ Soft delete (campos `deleted_at`)
- ✅ Auditoria completa de alterações

## 🚀 Deploy

### Frontend (Vercel)

```bash
# Build
npm run build

# Deploy automático via GitHub integration
```

### Backend (Supabase)

```bash
# Deploy Edge Function
supabase functions deploy make-server-a1f709fc

# Verificar status
supabase functions list
```

## 🧪 Testes

```bash
# Rodar aplicação em desenvolvimento
npm run dev

# Build de produção
npm run build
```

### Checklist de Teste

- [ ] Criar nova campanha
- [ ] Editar campanha existente
- [ ] Excluir campanha
- [ ] Upload de anexo
- [ ] Adicionar comentário
- [ ] Filtrar por instituição
- [ ] Visualizar em calendário
- [ ] Visualizar em Gantt
- [ ] Duplicar campanha

## 📊 Status do Projeto

### ✅ Implementado

- [x] CRUD completo de campanhas
- [x] Visualizações múltiplas (Calendário, Gantt, Tabela, Cards)
- [x] Sistema de tags
- [x] Upload de anexos
- [x] Sistema de comentários
- [x] Histórico de alterações
- [x] Filtros avançados
- [x] Responsividade mobile

### 🔄 Em Desenvolvimento

- [ ] Autenticação de usuários (atualmente usa usuário sistema)
- [ ] Notificações em tempo real
- [ ] Exportação de relatórios
- [ ] Integração com calendário externo
- [ ] Dashboard de analytics

### 💡 Planejado

- [ ] Sistema de aprovações
- [ ] Templates de campanha
- [ ] Integração com email marketing
- [ ] API pública documentada
- [ ] Testes automatizados

## 🐛 Solução de Problemas

### Erro: "Instituição não encontrada"

```sql
-- Verificar instituições
SELECT * FROM institutions;
```

### Erro: "SYSTEM_USER_NOT_CREATED"

```sql
-- Criar usuário sistema
INSERT INTO users (id, email, name, full_name, role, position, area, is_active, email_verified) 
VALUES ('00000000-0000-0000-0000-000000000000', 'sistema@campanhas-edtech.app', 
        'Sistema', 'Usuário Sistema', 'admin', 'Sistema', 'Tecnologia', TRUE, TRUE);
```

### Erro: "Failed to fetch"

```bash
# Verificar Edge Function
supabase functions list

# Ver logs
supabase functions logs make-server-a1f709fc
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Adiciona nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📄 Licença

Este projeto foi gerado pelo Figma Make e adaptado para usar Supabase como backend.

## 🆘 Suporte

- 📖 [Documentação Completa](GUIA_DE_INSTALACAO.md)
- 🐛 [Reportar Bug](issues)
- 💬 [Discussões](discussions)

## 📞 Contato

Para dúvidas sobre o projeto, consulte a documentação ou abra uma issue.

---

**Desenvolvido com ❤️ usando React, TypeScript e Supabase**

⭐ Se este projeto foi útil, considere dar uma estrela!
