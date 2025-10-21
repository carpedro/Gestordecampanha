# 🔄 Fluxo Completo de Dados - Campanhas EdTech

## 📐 Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│  - App.tsx                                                  │
│  - CampaignsApp.tsx (Dashboard)                            │
│  - CampaignDetailPage.tsx (Detalhe)                        │
│  - CampaignForm.tsx (Formulário)                           │
│  - Components (Calendar, Comments, Attachments)            │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP Requests
                  │ Authorization: Bearer ${publicAnonKey}
                  ↓
┌─────────────────────────────────────────────────────────────┐
│              SERVICES (Frontend API Layer)                  │
│  - campaignService.ts                                       │
│  - commentService.ts                                        │
│  - attachmentService.ts                                     │
│  - historyService.ts                                        │
└─────────────────┬───────────────────────────────────────────┘
                  │ fetch()
                  │ https://${projectId}.supabase.co/functions/v1/
                  ↓
┌─────────────────────────────────────────────────────────────┐
│           SERVER (Hono + Deno Edge Function)                │
│  File: /supabase/functions/server/index.tsx                │
│  - 30+ rotas REST                                           │
│  - CORS habilitado                                          │
│  - Logging completo                                         │
└────────┬────────────────────────────────────┬───────────────┘
         │                                    │
         │ Supabase Service Role Key          │ Storage API
         ↓                                    ↓
┌────────────────────────────────┐  ┌──────────────────────┐
│   POSTGRESQL DATABASE          │  │   SUPABASE STORAGE   │
│  - campaigns                   │  │  Bucket:             │
│  - comments                    │  │  make-a1f709fc-      │
│  - attachments                 │  │    attachments       │
│  - campaign_audit              │  │  - Private           │
│  - campaign_tags               │  │  - Signed URLs       │
│  - tags                        │  │  - Max: 100MB/file   │
│  - institutions                │  └──────────────────────┘
│  - users (1 sistema)           │
└────────────────────────────────┘
```

---

## 🔄 Fluxo 1: CRIAR CAMPANHA

```
┌──────────────────────┐
│  USER                │
│  Preenche formulário │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────────────────────────────────────────┐
│  CampaignForm.tsx                                        │
│  - Valida: Nome, Instituição, Descrição (min 140 chars) │
│  - Valida: Datas (startDate < endDate)                  │
│  - Coleta: Tags relacionadas/excluídas                  │
│  - Coleta: Áudio (opcional)                             │
└──────────┬───────────────────────────────────────────────┘
           │ onSave(formData)
           ↓
┌──────────────────────────────────────────────────────────┐
│  campaignService.create(data)                            │
│  POST /make-server-a1f709fc/campaigns                    │
│  Headers: { Authorization: Bearer ${publicAnonKey} }     │
│  Body: {                                                 │
│    name, institution, description,                       │
│    startDate, endDate, status,                           │
│    tagsRelated[], tagsExcluded[], audioUrl               │
│  }                                                       │
└──────────┬───────────────────────────────────────────────┘
           │ HTTP POST
           ↓
┌──────────────────────────────────────────────────────────┐
│  SERVER: app.post('/campaigns')                          │
│  1. Valida body                                          │
│  2. Busca institution_id:                                │
│     SELECT id FROM institutions                          │
│     WHERE name = body.institution                        │
│  3. Gera slug: slugify(body.name)                        │
│  4. INSERT INTO campaigns:                               │
│     - name, slug, institution_id                         │
│     - description, audio_url                             │
│     - start_date, end_date                               │
│     - status (default: 'draft')                          │
│     - created_by_user_id = '00000000-...'                │
│  5. ⚡ TRIGGER: set_campaign_slug                        │
│     (ajusta slug se duplicado)                           │
│  6. ⚡ TRIGGER: log_campaign_changes_simple              │
│     (cria entrada em campaign_audit)                     │
│  7. Se tagsRelated:                                      │
│     INSERT INTO campaign_tags (related)                  │
│  8. Se tagsExcluded:                                     │
│     INSERT INTO campaign_tags (excluded)                 │
│  9. SELECT campanha completa + institution               │
└──────────┬───────────────────────────────────────────────┘
           │ Response: { id, slug, name, ... }
           ↓
┌──────────────────────────────────────────────────────────┐
│  Frontend                                                │
│  1. Toast: "Iniciativa criada com sucesso!"             │
│  2. Atualiza lista de campanhas                         │
│  3. Fecha modal                                         │
│  4. Opcional: Navega para /campanha/{slug}              │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo 2: UPLOAD DE ANEXO

```
┌──────────────────────┐
│  USER                │
│  Arrasta arquivo     │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────────────────────────────────────────┐
│  AttachmentUploader.tsx                                  │
│  1. onDrop(files)                                        │
│  2. Valida:                                              │
│     - Max 10 arquivos                                   │
│     - Max 100MB por arquivo                             │
│     - Total < 500MB                                     │
│  3. Para cada arquivo:                                  │
│     attachmentService.upload(campaignId, file)          │
└──────────┬───────────────────────────────────────────────┘
           │ FormData: { file, campaignId }
           ↓
┌──────────────────────────────────────────────────────────┐
│  attachmentService.upload()                              │
│  XMLHttpRequest (para tracking de progress)             │
│  POST /make-server-a1f709fc/attachments/upload          │
│  Headers: { Authorization: Bearer ${publicAnonKey} }     │
│  Body: FormData { file: File, campaignId: UUID }         │
│  Progress: onProgress(percentComplete)                   │
└──────────┬───────────────────────────────────────────────┘
           │ HTTP POST (multipart/form-data)
           ↓
┌──────────────────────────────────────────────────────────┐
│  SERVER: app.post('/attachments/upload')                 │
│  1. Parse FormData                                       │
│  2. Valida file.size <= 100MB                           │
│  3. Gera storage path único:                            │
│     ${campaignId}/${timestamp}_${random}${ext}          │
│  4. Upload para Supabase Storage:                       │
│     bucket: 'make-a1f709fc-attachments'                 │
│     path: storagePath                                   │
│     contentType: file.type                              │
│  5. Se upload OK:                                       │
│     INSERT INTO attachments:                            │
│     - campaign_id, file_name                            │
│     - file_type (image|pdf|video|...)                   │
│     - mime_type, file_size                              │
│     - storage_path                                      │
│     - uploaded_by = '00000000-...'                      │
│  6. Gera Signed URL (válida por 1 hora):                │
│     storage.createSignedUrl(storagePath, 3600)          │
│  7. Retorna: attachment + url                           │
└──────────┬───────────────────────────────────────────────┘
           │ Response: { id, file_name, url, ... }
           ↓
┌──────────────────────────────────────────────────────────┐
│  Frontend                                                │
│  1. Atualiza progress bar → 100%                        │
│  2. Adiciona attachment à lista                         │
│  3. Renderiza AttachmentGallery                         │
│  4. Preview automático (imagem/PDF)                     │
│  5. Toast: "Arquivo enviado com sucesso!"               │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo 3: ADICIONAR COMENTÁRIO

```
┌──────────────────────┐
│  USER                │
│  Digita comentário   │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────────────────────────────────────────┐
│  CommentSection.tsx                                      │
│  1. Captura: content (textarea)                         │
│  2. Detecta: @mentions (opcional)                       │
│  3. Anexo: attachments[] (opcional)                     │
│  4. Valida: content não vazio                           │
│  5. commentService.create(campaignId, content, parentId)│
└──────────┬───────────────────────────────────────────────┘
           │ { content, parentId?, mentions[], attachments[] }
           ↓
┌──────────────────────────────────────────────────────────┐
│  commentService.create()                                 │
│  POST /make-server-a1f709fc/campaigns/${id}/comments    │
│  Headers: { Authorization: Bearer ${publicAnonKey} }     │
│  Body: { content, parentId, mentions, attachments }      │
└──────────┬───────────────────────────────────────────────┘
           │ HTTP POST
           ↓
┌──────────────────────────────────────────────────────────┐
│  SERVER: app.post('/campaigns/:id/comments')             │
│  1. Pega campaignId do param                            │
│  2. INSERT INTO comments:                               │
│     - campaign_id, content                              │
│     - parent_id (se for reply)                          │
│     - mentions (array de user_ids)                      │
│     - attachments (array de URLs)                       │
│     - user_id = '00000000-...'                          │
│  3. Se parent_id existe:                                │
│     - É uma reply                                       │
│     - UPDATE parent SET replies_count += 1              │
│  4. UPDATE campaigns SET comments_count += 1            │
│  5. Retorna: comment completo                           │
└──────────┬───────────────────────────────────────────────┘
           │ Response: { id, content, created_at, ... }
           ↓
┌──────────────────────────────────────────────────────────┐
│  Frontend                                                │
│  1. Adiciona comment à lista (topo)                     │
│  2. Limpa textarea                                      │
│  3. Se é reply: atualiza contador do parent             │
│  4. Scroll suave até novo comentário                    │
│  5. Toast: "Comentário adicionado!"                     │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo 4: BUSCAR CAMPANHA POR SLUG

```
┌──────────────────────┐
│  USER                │
│  Acessa URL          │
│  /campanha/teste-2025│
└──────────┬───────────┘
           │
           ↓
┌──────────────────────────────────────────────────────────┐
│  Router (App.tsx)                                        │
│  1. Match: /campanha/:slug                              │
│  2. Extrai: slug = "teste-2025"                         │
│  3. Renderiza: <CampaignDetailPage slug={slug} />       │
└──────────┬───────────────────────────────────────────────┘
           │ useEffect(() => loadCampaign(slug))
           ↓
┌──────────────────────────────────────────────────────────┐
│  CampaignDetailPage.tsx                                  │
│  1. useState: campaign, loading, error                  │
│  2. useEffect: campaignService.getBySlug(slug)          │
└──────────┬───────────────────────────────────────────────┘
           │ GET /campaigns/slug/teste-2025
           ↓
┌──────────────────────────────────────────────────────────┐
│  campaignService.getBySlug(slug)                         │
│  GET /make-server-a1f709fc/campaigns/slug/${slug}       │
│  Headers: { Authorization: Bearer ${publicAnonKey} }     │
└──────────┬───────────────────────────────────────────────┘
           │ HTTP GET
           ↓
┌──────────────────────────────────────────────────────────┐
│  SERVER: app.get('/campaigns/slug/:slug')                │
│  1. Pega slug do param                                  │
│  2. SELECT * FROM campaigns                             │
│     WHERE slug = ${slug}                                │
│     JOIN institutions                                   │
│     JOIN campaign_tags                                  │
│     JOIN tags                                           │
│  3. Se não encontrou: return 404                        │
│  4. Registra view (opcional):                           │
│     INSERT INTO campaign_views                          │
│  5. UPDATE campaigns SET views_count += 1               │
│  6. Retorna: campanha completa + relacionamentos        │
└──────────┬───────────────────────────────────────────────┘
           │ Response: { id, slug, name, institution, ... }
           ↓
┌──────────────────────────────────────────────────────────┐
│  CampaignDetailPage.tsx                                  │
│  1. setCampaign(data)                                   │
│  2. setLoading(false)                                   │
│  3. Renderiza:                                          │
│     - Header com nome + instituição                     │
│     - CampaignSidebar (info, edição inline)             │
│     - InlineEditableField (descrição)                   │
│     - CommentsThread (comentários)                      │
│     - AttachmentGallery (anexos)                        │
│     - HistorySection (histórico)                        │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo 5: HISTÓRICO DE EDIÇÕES

```
┌──────────────────────┐
│  USER                │
│  Clica em "Histórico"│
└──────────┬───────────┘
           │
           ↓
┌──────────────────────────────────────────────────────────┐
│  HistorySection.tsx                                      │
│  1. useEffect: historyService.getAll(campaignId)        │
└──────────┬───────────────────────────────────────────────┘
           │ GET /campaigns/{id}/history
           ↓
┌──────────────────────────────────────────────────────────┐
│  historyService.getAll(campaignId)                       │
│  GET /make-server-a1f709fc/campaigns/${id}/history      │
│  Headers: { Authorization: Bearer ${publicAnonKey} }     │
└──────────┬───────────────────────────────────────────────┘
           │ HTTP GET
           ↓
┌──────────────────────────────────────────────────────────┐
│  SERVER: app.get('/campaigns/:id/history')               │
│  1. Pega campaignId do param                            │
│  2. SELECT * FROM campaign_audit                        │
│     WHERE campaign_id = ${campaignId}                   │
│     ORDER BY created_at DESC                            │
│  3. Retorna: array de edições                           │
└──────────┬───────────────────────────────────────────────┘
           │ Response: { history: [...] }
           ↓
┌──────────────────────────────────────────────────────────┐
│  HistorySection.tsx                                      │
│  1. Agrupa por data                                     │
│  2. Renderiza timeline:                                 │
│     - "created" → Ícone de criação                      │
│     - "updated" → Ícone de edição                       │
│     - "status_changed" → Badge do novo status           │
│  3. Exibe diff visual:                                  │
│     - old_value (riscado)                               │
│     - new_value (destacado)                             │
│  4. Botão: "Reverter para esta versão" (opcional)       │
└──────────────────────────────────────────────────────────┘
```

---

## 🗄️ Estrutura do Banco (Relacionamentos)

```
┌─────────────────────┐
│   institutions      │───┐
│  - id (PK)          │   │
│  - name             │   │
│  - slug             │   │
└─────────────────────┘   │
                          │ 1:N
                          ↓
┌─────────────────────────────────────┐
│           campaigns                 │
│  - id (PK)                          │
│  - slug (UNIQUE)                    │
│  - name                             │
│  - institution_id (FK) ─────────────┘
│  - description                      │
│  - status                           │
│  - start_date, end_date             │
│  - created_by_user_id (nullable)    │
│  - assigned_to_user_id (nullable)   │
└─────────┬───────────────────────────┘
          │
          ├─────── 1:N ──────┐
          │                  │
          ↓                  ↓
┌─────────────────┐  ┌──────────────────┐
│   comments      │  │  attachments     │
│  - id (PK)      │  │  - id (PK)       │
│  - campaign_id  │  │  - campaign_id   │
│  - parent_id ───┼─┐│  - storage_path  │
│  - content      │ ││  - file_name     │
│  - user_id      │ ││  - file_size     │
└─────────────────┘ ││  - uploaded_by   │
        │           ││  └──────────────────┘
        └─ self FK ─┘│
                     │
                     ↓
          ┌──────────────────┐
          │ campaign_audit   │
          │  - id (PK)       │
          │  - campaign_id   │
          │  - action_type   │
          │  - field_name    │
          │  - old_value     │
          │  - new_value     │
          │  - user_id       │
          └──────────────────┘

┌─────────────────┐         ┌─────────────────┐
│   tags          │         │ campaign_tags   │
│  - id (PK)      │←── N:N ─│  - campaign_id  │
│  - name         │         │  - tag_id       │
│  - category     │         │  - relation_type│
└─────────────────┘         └─────────────────┘
```

---

## ⚡ Triggers Ativos

```
CAMPANHA CRIADA/EDITADA
        ↓
┌────────────────────────────────────┐
│ TRIGGER: set_campaign_slug         │
│ - Gera slug do nome                │
│ - Verifica duplicatas              │
│ - Adiciona contador se necessário  │
└────────────────────────────────────┘
        ↓
┌────────────────────────────────────┐
│ TRIGGER: log_campaign_changes      │
│ - Detecta campos alterados         │
│ - Insere em campaign_audit         │
│ - Incrementa version               │
│ - Atualiza timestamps              │
└────────────────────────────────────┘
```

---

## 🔐 Autenticação (Removida)

```
ANTES (com autenticação):
Frontend → accessToken → Server → Verifica JWT → Database

AGORA (sem autenticação):
Frontend → publicAnonKey → Server → Database
                              ↓
                     Todos os user_id = '00000000-...'
```

---

## 📊 Storage Flow

```
┌──────────────────────┐
│  Arquivo Selecionado │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────────────────────┐
│  Validações Frontend                 │
│  - Tamanho <= 100MB                 │
│  - Tipo permitido (9 tipos)         │
│  - Total de arquivos <= 10          │
└──────────┬───────────────────────────┘
           │
           ↓
┌──────────────────────────────────────┐
│  Upload para Supabase Storage        │
│  Bucket: make-a1f709fc-attachments   │
│  Path: {campaignId}/{timestamp}_{id} │
│  Private: true                       │
└──────────┬───────────────────────────┘
           │
           ↓
┌──────────────────────────────────────┐
│  Registro no Banco                   │
│  INSERT INTO attachments             │
│  - storage_path                      │
│  - file_name, file_size              │
│  - mime_type, file_type              │
└──────────┬───────────────────────────┘
           │
           ↓
┌──────────────────────────────────────┐
│  Gerar Signed URL                    │
│  createSignedUrl(path, 3600)         │
│  Válida por: 1 hora                  │
└──────────┬───────────────────────────┘
           │
           ↓
┌──────────────────────────────────────┐
│  Retornar para Frontend              │
│  { id, url, file_name, ... }         │
└──────────────────────────────────────┘
```

---

## 🎯 Resumo de Endpoints

### Campanhas
- `GET /campaigns` - Listar todas
- `GET /campaigns/slug/:slug` - Buscar por slug
- `POST /campaigns` - Criar
- `PUT /campaigns/:id` - Editar
- `PUT /campaigns/:id/status` - Mudar status
- `POST /campaigns/:id/duplicate` - Duplicar
- `DELETE /campaigns/:id` - Deletar

### Comentários
- `GET /campaigns/:id/comments` - Listar
- `POST /campaigns/:id/comments` - Criar
- `PUT /comments/:id` - Editar
- `DELETE /comments/:id` - Deletar
- `POST /comments/:id/important` - Toggle importante

### Anexos
- `GET /campaigns/:id/attachments` - Listar
- `POST /attachments/upload` - Upload
- `DELETE /attachments/:id` - Deletar

### Histórico
- `GET /campaigns/:id/history` - Buscar histórico

### Metadata
- `GET /tags` - Listar tags
- `GET /institutions` - Listar instituições
- `GET /positions` - Listar cargos

---

**Este fluxo documenta o sistema completo de ponta a ponta, sem autenticação.**
