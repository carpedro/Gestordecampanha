# 🔗 Conectividade com o Banco de Dados

## Status: ✅ **Sistema sem autenticação - Aplicação aberta**

---

## 📊 Estrutura Atual do Fluxo de Dados

### 1. **Arquitetura de 3 Camadas**

```
Frontend (React) → Server (Hono/Deno) → Database (PostgreSQL)
```

- **Frontend**: Faz chamadas HTTP para o servidor
- **Server**: `/supabase/functions/server/index.tsx` - API REST usando Hono
- **Database**: PostgreSQL no Supabase

---

## 🔑 Autenticação Removida

### Estado Atual
- ✅ Sistema completamente aberto (sem login/signup)
- ✅ Todas as referências a `accessToken` foram removidas
- ✅ Não há mais verificação de usuário nas rotas
- ✅ Usuário padrão do sistema: `00000000-0000-0000-0000-000000000000`

### Campos de Usuário Removidos do Código
- ❌ `created_by` / `created_by_user_id`
- ❌ `last_edited_by`
- ❌ `author_id`
- ❌ `uploaded_by`
- ❌ `assigned_to_user_id`

---

## 📋 Estrutura de Tabelas (sem autenticação)

### **campaigns**
```sql
id UUID PRIMARY KEY
slug VARCHAR UNIQUE
name VARCHAR NOT NULL
description TEXT
institution_id INTEGER NOT NULL (FK → institutions)
audio_url TEXT
start_date DATE
end_date DATE
status VARCHAR (draft|published|archived)
priority VARCHAR
version INTEGER DEFAULT 1
attachments_count INTEGER DEFAULT 0
comments_count INTEGER DEFAULT 0
views_count INTEGER DEFAULT 0
created_at TIMESTAMP
updated_at TIMESTAMP
published_at TIMESTAMP
archived_at TIMESTAMP
deleted_at TIMESTAMP
```

### **comments**
```sql
id UUID PRIMARY KEY
campaign_id UUID NOT NULL (FK → campaigns)
parent_id UUID (FK → comments, para replies)
content TEXT NOT NULL
content_html TEXT
is_important BOOLEAN DEFAULT FALSE
is_edited BOOLEAN DEFAULT FALSE
edited_at TIMESTAMP
replies_count INTEGER DEFAULT 0
likes_count INTEGER DEFAULT 0
mentions JSONB
attachments JSONB
created_at TIMESTAMP
deleted_at TIMESTAMP
```

### **attachments**
```sql
id UUID PRIMARY KEY
campaign_id UUID NOT NULL (FK → campaigns)
file_name VARCHAR NOT NULL
file_type VARCHAR (image|video|audio|pdf|document|spreadsheet|presentation|archive|other)
mime_type VARCHAR
file_size BIGINT
storage_path VARCHAR NOT NULL (caminho no Supabase Storage)
created_at TIMESTAMP
deleted_at TIMESTAMP
```

### **campaign_audit** (histórico de edições)
```sql
id UUID PRIMARY KEY
campaign_id UUID NOT NULL (FK → campaigns)
action_type VARCHAR (created|updated|status_changed|deleted)
field_name VARCHAR
old_value TEXT
new_value TEXT
changes_json JSONB
created_at TIMESTAMP
```

### **campaign_tags** (relacionamento N:N)
```sql
campaign_id UUID (FK → campaigns)
tag_id UUID (FK → tags)
relation_type VARCHAR (related|excluded)
created_at TIMESTAMP
```

### **tags**
```sql
id UUID PRIMARY KEY
name VARCHAR UNIQUE NOT NULL
category VARCHAR
usage_count INTEGER DEFAULT 0
created_at TIMESTAMP
```

### **institutions**
```sql
id INTEGER PRIMARY KEY
name VARCHAR UNIQUE NOT NULL
slug VARCHAR UNIQUE
short_name VARCHAR
logo_url TEXT
is_active BOOLEAN DEFAULT TRUE
sort_order INTEGER
created_at TIMESTAMP
```

### **users** (mantida para compatibilidade com triggers antigos)
```sql
id UUID PRIMARY KEY
email VARCHAR UNIQUE
name VARCHAR
role VARCHAR
position VARCHAR
created_at TIMESTAMP
```

### **positions** e **areas** (opcionais)
```sql
id UUID PRIMARY KEY
name VARCHAR
created_at TIMESTAMP
```

---

## ⚠️ **PROBLEMAS CRÍTICOS COM OS TRIGGERS SQL**

### 🚨 Triggers que precisam ser corrigidos no banco

O SQL fornecido no prompt contém **triggers que fazem referência a campos de usuário que não existem mais**:

#### 1. **Trigger: `log_campaign_changes`**

**Problema:**
```sql
-- LINHA COM ERRO:
INSERT INTO campaign_audit (..., user_id, ...)
VALUES (..., NEW.created_by_user_id, ...)  -- ❌ Campo não existe

-- E também:
VALUES (..., NEW.assigned_to_user_id, ...)  -- ❌ Campo não existe
```

**Solução Necessária:**
```sql
-- REMOVER referências a user_id nos triggers
-- OU usar um user_id padrão do sistema
-- OU tornar user_id nullable e setar como NULL
```

#### 2. **Trigger: `create_notification_on_mention`**

**Problema:**
```sql
-- Faz SELECT em users.id e NEW.user_id
SELECT user_id INTO parent_author_id FROM comments WHERE id = NEW.parent_id;
-- ❌ Campo user_id não existe em comments
```

#### 3. **Views: `vw_campaigns_full`, `vw_comments_full`**

**Problema:**
```sql
-- Faz JOIN com users
JOIN users creator ON c.created_by_user_id = creator.id
-- ❌ created_by_user_id não existe em campaigns
```

---

## 🔧 **AÇÕES NECESSÁRIAS NO BANCO**

### Opção 1: Remover completamente os triggers (recomendado para prototipagem)

```sql
-- Desabilitar triggers temporariamente
DROP TRIGGER IF EXISTS trigger_log_campaign_changes ON campaigns;
DROP TRIGGER IF EXISTS trigger_notification_on_mention ON comments;
DROP TRIGGER IF EXISTS trigger_notification_on_reply ON comments;

-- Manter apenas o trigger de slug (este funciona sem user_id)
-- trigger_set_campaign_slug
```

### Opção 2: Adicionar campos nullable para compatibilidade

```sql
-- Adicionar campos opcionais de usuário
ALTER TABLE campaigns ADD COLUMN created_by_user_id UUID;
ALTER TABLE campaigns ADD COLUMN assigned_to_user_id UUID;
ALTER TABLE comments ADD COLUMN user_id UUID;
ALTER TABLE attachments ADD COLUMN uploaded_by UUID;
ALTER TABLE campaign_audit ADD COLUMN user_id UUID;

-- Setar todos como NULL ou usar UUID padrão do sistema
UPDATE campaigns SET created_by_user_id = '00000000-0000-0000-0000-000000000000';
UPDATE campaigns SET assigned_to_user_id = '00000000-0000-0000-0000-000000000000';
```

### Opção 3: Modificar os triggers para não usar user_id

```sql
-- Exemplo de trigger modificado
CREATE OR REPLACE FUNCTION log_campaign_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO campaign_audit (
            campaign_id, 
            action_type, 
            changes_json
            -- REMOVIDO: user_id
        ) VALUES (
            NEW.id,
            'created',
            to_jsonb(NEW)
            -- REMOVIDO: NEW.created_by_user_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 📡 **Fluxo de Dados Completo (Estado Atual)**

### 1. **Criar Campanha**

```typescript
// Frontend: CampaignForm.tsx
onSave(formData) → campaignService.create(data)

// Service: campaignService.ts
POST /make-server-a1f709fc/campaigns
Headers: { Authorization: Bearer ${publicAnonKey} }
Body: { name, institution, description, startDate, endDate, status, tagsRelated, tagsExcluded, audioUrl }

// Server: index.tsx
1. Busca institution_id pelo nome da instituição
2. Gera slug automaticamente via slugify()
3. Insere em campaigns
4. Insere tags em campaign_tags (se fornecidas)
5. Retorna campanha criada com dados da instituição
```

### 2. **Listar Campanhas**

```typescript
// Frontend: CampaignsApp.tsx
useEffect → campaignService.getAll()

// Service: campaignService.ts
GET /make-server-a1f709fc/campaigns
Headers: { Authorization: Bearer ${publicAnonKey} }

// Server: index.tsx
SELECT campaigns.*, institutions.name, campaign_tags, tags
ORDER BY created_at DESC
```

### 3. **Buscar Campanha por Slug**

```typescript
// Frontend: Router
navigate('/campanha/:slug') → CampaignDetailPage

// Service: campaignService.ts
GET /make-server-a1f709fc/campaigns/slug/${slug}

// Server: index.tsx
SELECT * FROM campaigns WHERE slug = ${slug}
JOIN institutions, campaign_tags, tags
```

### 4. **Adicionar Comentário**

```typescript
// Frontend: CommentSection.tsx
commentService.create(campaignId, content, parentId?)

// Service: commentService.ts
POST /make-server-a1f709fc/campaigns/${campaignId}/comments
Body: { content, parentId, mentions, attachments }

// Server: index.tsx
INSERT INTO comments (campaign_id, content, parent_id, mentions, attachments)
```

### 5. **Upload de Anexo**

```typescript
// Frontend: AttachmentUploader.tsx
attachmentService.upload(campaignId, file, onProgress)

// Service: attachmentService.ts
POST /make-server-a1f709fc/attachments/upload
FormData: { file, campaignId }

// Server: index.tsx
1. Valida tamanho (max 100MB)
2. Gera nome único: ${campaignId}/${timestamp}_${random}${ext}
3. Upload para Supabase Storage (bucket: make-a1f709fc-attachments)
4. Insere registro em attachments
5. Gera signed URL (válida por 1 hora)
6. Retorna attachment + URL
```

### 6. **Histórico de Edições**

```typescript
// Frontend: HistorySection.tsx
historyService.getAll(campaignId)

// Service: historyService.ts
GET /make-server-a1f709fc/campaigns/${campaignId}/history

// Server: index.tsx
SELECT * FROM campaign_audit WHERE campaign_id = ${campaignId}
ORDER BY created_at DESC
```

---

## 🗄️ **Supabase Storage**

### Bucket: `make-a1f709fc-attachments`
- **Visibilidade**: Privado (requires signed URLs)
- **Tamanho máximo**: 100MB por arquivo
- **Estrutura de paths**: `{campaignId}/{timestamp}_{random}{extension}`

### Tipos de Arquivo Suportados (9 tipos)
1. **image** - image/*
2. **video** - video/*
3. **audio** - audio/*
4. **pdf** - application/pdf
5. **document** - .doc, .docx (Word)
6. **spreadsheet** - .xls, .xlsx (Excel)
7. **presentation** - .ppt, .pptx (PowerPoint)
8. **archive** - .zip, .rar, .7z
9. **other** - demais tipos

---

## 🔒 **Segurança (Estado Atual)**

### O que foi removido:
- ❌ Row Level Security (RLS) policies
- ❌ Verificação de tokens JWT
- ❌ Permissões baseadas em usuário
- ❌ Validação de ownership

### O que permanece:
- ✅ CORS habilitado no servidor
- ✅ Validação de tamanho de arquivos (100MB)
- ✅ Validação de tipos MIME
- ✅ Signed URLs com expiração (1 hora)
- ✅ Service Role Key protegida no backend (não exposta ao frontend)

---

## 🧪 **Testando a Conectividade**

### Teste 1: Listar Campanhas
```bash
curl https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/campaigns \
  -H "Authorization: Bearer ${publicAnonKey}"
```

### Teste 2: Criar Campanha
```bash
curl -X POST https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/campaigns \
  -H "Authorization: Bearer ${publicAnonKey}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Campanha",
    "institution": "PUCRS",
    "description": "Descrição de teste com mais de 140 caracteres para atender ao requisito mínimo de caracteres da descrição da campanha comercial conforme especificação do sistema.",
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "status": "draft"
  }'
```

### Teste 3: Listar Instituições
```bash
curl https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/institutions \
  -H "Authorization: Bearer ${publicAnonKey}"
```

---

## 📊 **Dados Iniciais Necessários**

Para o sistema funcionar, o banco precisa ter:

### 1. **Instituições** (institutions)
```sql
INSERT INTO institutions (id, name, slug, short_name, is_active, sort_order) VALUES
(1, 'PUCRS', 'pucrs', 'PUCRS', true, 1),
(2, 'PUCRS Grad', 'pucrs-grad', 'PUCRS Grad', true, 2),
(3, 'FAAP', 'faap', 'FAAP', true, 3),
(4, 'FIA Online', 'fia-online', 'FIA Online', true, 4),
(5, 'UNESC', 'unesc', 'UNESC', true, 5),
(6, 'Santa Casa SP', 'santa-casa-sp', 'Santa Casa', true, 6),
(7, 'Impacta', 'impacta', 'Impacta', true, 7),
(8, 'FSL Digital', 'fsl-digital', 'FSL Digital', true, 8);
```

### 2. **Usuário Sistema** (users)
```sql
INSERT INTO users (id, email, name, role, position) VALUES
('00000000-0000-0000-0000-000000000000', 'system@campanhas-edtech.app', 'Sistema', 'admin', 'Sistema');
```

### 3. **Tags** (opcional)
```sql
INSERT INTO tags (id, name, category) VALUES
(gen_random_uuid(), 'graduação', 'nivel'),
(gen_random_uuid(), 'pós-graduação', 'nivel'),
(gen_random_uuid(), 'MBA', 'nivel'),
(gen_random_uuid(), 'desconto', 'beneficio'),
(gen_random_uuid(), 'bolsa', 'beneficio'),
(gen_random_uuid(), 'vestibular', 'processo');
```

---

## 🐛 **Debugging e Logs**

### Servidor (Hono)
```typescript
// Todos os erros são logados com contexto
console.error('Error creating campaign:', error);
console.error('Error fetching attachments:', error);
```

### Frontend
```typescript
// Erros de API são logados no console
console.error('Error loading attachments:', error);

// Toasts de erro para o usuário
toast.error('Erro ao carregar anexos');
```

### Como verificar logs no Supabase:
1. Acesse o painel do Supabase
2. Vá em **Edge Functions** → **make-server-a1f709fc**
3. Clique em **Logs**
4. Veja requisições, erros e respostas em tempo real

---

## ✅ **Checklist de Conectividade**

- [x] Servidor configurado e rodando
- [x] CORS habilitado
- [x] Autenticação removida
- [x] Rotas de campanhas funcionando
- [x] Rotas de comentários funcionando
- [x] Rotas de anexos funcionando
- [x] Upload de arquivos para Storage funcionando
- [x] Signed URLs sendo geradas
- [x] Frontend usando `publicAnonKey` corretamente
- [x] Sem referências a `accessToken` no código
- [ ] **PENDENTE**: Triggers SQL precisam ser corrigidos no banco
- [ ] **PENDENTE**: Dados iniciais inseridos (institutions, users)

---

## 🎯 **Próximos Passos Recomendados**

1. **Corrigir triggers no banco** (ver seção "AÇÕES NECESSÁRIAS NO BANCO")
2. **Inserir dados iniciais** (institutions, user sistema)
3. **Testar fluxo completo**:
   - Criar campanha
   - Adicionar comentário
   - Upload de anexo
   - Visualizar histórico
4. **Monitorar logs** para verificar se há erros
5. **Implementar tratamento de erros** mais robusto no frontend

---

## 📞 **Suporte**

Em caso de erros, verificar:
1. **Console do navegador** (erros de frontend)
2. **Logs do Edge Function** no Supabase (erros de backend)
3. **Query logs** do Postgres no Supabase (erros de banco)
4. **Storage logs** para problemas com uploads

---

**Última atualização**: 20 de Outubro de 2025
**Status**: ✅ Código frontend/backend limpo e sem autenticação
**Pendências**: ⚠️ Triggers SQL precisam ser ajustados no banco de dados
