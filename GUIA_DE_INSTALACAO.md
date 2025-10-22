# 📋 Guia de Instalação - Gestor de Campanhas EdTech

Este guia completo vai te ajudar a configurar o projeto do zero, resolvendo todos os conflitos entre o código gerado pelo Figma Make e a arquitetura do banco de dados Supabase.

## 🎯 Visão Geral

O projeto é um **Gestor de Campanhas EdTech** que combina:
- **Frontend**: Gerado pelo Figma Make com React + TypeScript
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Storage**: Supabase Storage para anexos

## 🚀 Passo a Passo de Instalação

### 1️⃣ Pré-requisitos

Antes de começar, certifique-se de ter:

- [ ] Node.js 18+ instalado
- [ ] Conta no Supabase (https://supabase.com)
- [ ] Git instalado

### 2️⃣ Configurar Projeto Supabase

#### 2.1 Criar Novo Projeto

1. Acesse https://supabase.com/dashboard
2. Clique em **"New Project"**
3. Preencha:
   - **Name**: `Gestor de Campanhas` (ou nome de sua preferência)
   - **Database Password**: Escolha uma senha forte
   - **Region**: Escolha a mais próxima de você
4. Clique em **"Create new project"**
5. Aguarde alguns minutos para o projeto ser provisionado

#### 2.2 Executar Script de Setup do Banco de Dados

1. No dashboard do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em **"New query"**
3. Copie **TODO** o conteúdo do arquivo `SETUP_DATABASE.sql` deste projeto
4. Cole no editor SQL
5. Clique em **"Run"** (ou pressione Ctrl+Enter)
6. Verifique se aparece a mensagem: `✅ BANCO DE DADOS CONFIGURADO COM SUCESSO!`

#### 2.3 Verificar Criação das Tabelas

No SQL Editor, execute:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Você deve ver estas tabelas:
- `areas`
- `attachments`
- `campaign_audit`
- `campaign_favorites`
- `campaign_tags`
- `campaign_views`
- `campaigns`
- `comment_likes`
- `comments`
- `institutions`
- `notifications`
- `positions`
- `tags`
- `user_activity`
- `users`

#### 2.4 Verificar Usuário Sistema

Execute:

```sql
SELECT id, name, email, role, position, area 
FROM users 
WHERE id = '00000000-0000-0000-0000-000000000000';
```

Deve retornar:
```
id: 00000000-0000-0000-0000-000000000000
name: Sistema
email: sistema@campanhas-edtech.app
role: admin
position: Sistema
area: Tecnologia
```

### 3️⃣ Obter Credenciais do Supabase

1. No dashboard do Supabase, vá em **Settings → API**
2. Anote estas informações:

   ```
   Project URL: https://[seu-project-id].supabase.co
   Project ID: [seu-project-id]
   anon/public key: [sua-anon-key]
   service_role key: [sua-service-role-key] (⚠️ MANTENHA SECRETA!)
   ```

### 4️⃣ Criar Edge Function

#### 4.1 Instalar Supabase CLI

```bash
# Windows (via npm)
npm install -g supabase

# macOS (via Homebrew)
brew install supabase/tap/supabase

# Linux
curl -fsSL https://raw.githubusercontent.com/supabase/supabase/master/scripts/install.sh | sh
```

#### 4.2 Fazer Login no Supabase CLI

```bash
supabase login
```

Siga as instruções para autenticar.

#### 4.3 Linkar com seu Projeto

```bash
supabase link --project-ref [seu-project-id]
```

#### 4.4 Deploy da Edge Function

1. Na raiz do projeto, crie a estrutura:

```bash
mkdir -p supabase/functions/make-server-a1f709fc
```

2. Copie o arquivo `src/supabase/functions/server/index.tsx` para `supabase/functions/make-server-a1f709fc/index.ts`

```bash
# Windows (PowerShell)
Copy-Item src/supabase/functions/server/index.tsx supabase/functions/make-server-a1f709fc/index.ts

# macOS/Linux
cp src/supabase/functions/server/index.tsx supabase/functions/make-server-a1f709fc/index.ts
```

3. Deploy da função:

```bash
supabase functions deploy make-server-a1f709fc
```

4. Configurar variáveis de ambiente da Edge Function:

```bash
supabase secrets set SUPABASE_URL=https://[seu-project-id].supabase.co
supabase secrets set SUPABASE_ANON_KEY=[sua-anon-key]
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=[sua-service-role-key]
```

### 5️⃣ Configurar Frontend

#### 5.1 Criar Arquivo de Configuração do Supabase

Crie o arquivo `src/utils/supabase/info.tsx`:

```typescript
// src/utils/supabase/info.tsx
export const projectId = '[seu-project-id]'; // Ex: 'abcdefghijklmnop'
export const publicAnonKey = '[sua-anon-key]';
```

⚠️ **IMPORTANTE**: 
- Substitua `[seu-project-id]` pelo ID do seu projeto (extraído da URL)
- Substitua `[sua-anon-key]` pela chave pública anon
- **NÃO** commite este arquivo com suas credenciais reais (adicione ao `.gitignore`)

#### 5.2 Instalar Dependências

```bash
npm install
```

#### 5.3 Executar em Desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

### 6️⃣ Testar a Aplicação

#### 6.1 Criar uma Campanha de Teste

1. Abra o navegador em `http://localhost:5173`
2. Clique em **"Nova Campanha"**
3. Preencha:
   - **Nome**: Campanha de Teste
   - **Instituição**: PUCRS
   - **Descrição**: Esta é uma campanha de teste
   - **Data de Início**: Data atual
   - **Data de Término**: 30 dias no futuro
4. Clique em **"Salvar"**

#### 6.2 Verificar no Banco de Dados

No Supabase SQL Editor:

```sql
SELECT id, name, slug, institution, status, created_at
FROM campaigns
ORDER BY created_at DESC
LIMIT 5;
```

Você deve ver sua campanha criada!

### 7️⃣ Configurar Storage para Anexos

#### 7.1 Criar Bucket de Storage

1. No dashboard do Supabase, vá em **Storage**
2. Clique em **"Create bucket"**
3. Preencha:
   - **Name**: `make-a1f709fc-attachments`
   - **Public bucket**: ❌ Deixe desmarcado (private)
4. Clique em **"Create bucket"**

#### 7.2 Configurar Políticas de Acesso

No SQL Editor, execute:

```sql
-- Permitir leitura autenticada
CREATE POLICY "Allow authenticated read"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'make-a1f709fc-attachments');

-- Permitir upload autenticado
CREATE POLICY "Allow authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'make-a1f709fc-attachments');

-- Permitir deleção autenticada
CREATE POLICY "Allow authenticated delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'make-a1f709fc-attachments');
```

## 🔧 Solução de Problemas Comuns

### Erro: "Instituição não encontrada"

**Problema**: Ao criar campanha, aparece erro que instituição não existe.

**Solução**:
```sql
-- Verificar instituições cadastradas
SELECT id, name, slug FROM institutions;

-- Se necessário, adicionar novas instituições
INSERT INTO institutions (name, slug, short_name) VALUES
('Sua Instituição', 'sua-instituicao', 'SI');
```

### Erro: "SYSTEM_USER_NOT_CREATED"

**Problema**: Edge Function não consegue criar registros por falta do usuário sistema.

**Solução**:
```sql
-- Verificar se usuário sistema existe
SELECT * FROM users WHERE id = '00000000-0000-0000-0000-000000000000';

-- Se não existir, criar manualmente
INSERT INTO users (
    id, 
    email, 
    name, 
    full_name,
    role, 
    position, 
    area,
    is_active,
    email_verified
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'sistema@campanhas-edtech.app',
    'Sistema',
    'Usuário Sistema',
    'admin',
    'Sistema',
    'Tecnologia',
    TRUE,
    TRUE
);
```

### Erro: "Failed to fetch" ao carregar campanhas

**Problemas possíveis**:

1. **Edge Function não deployada**:
   ```bash
   supabase functions deploy make-server-a1f709fc
   ```

2. **Variáveis de ambiente não configuradas**:
   ```bash
   supabase secrets set SUPABASE_URL=https://[seu-project-id].supabase.co
   supabase secrets set SUPABASE_ANON_KEY=[sua-anon-key]
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=[sua-service-role-key]
   ```

3. **Arquivo info.tsx não configurado**:
   - Verifique se `src/utils/supabase/info.tsx` existe e tem as credenciais corretas

### Erro ao fazer upload de anexos

**Solução**:
1. Verificar se bucket `make-a1f709fc-attachments` existe
2. Verificar políticas de acesso (passo 7.2)
3. Verificar tamanho do arquivo (máximo 100MB)

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

#### `users`
- Usuários do sistema
- Campos: id, email, name, role, position, area

#### `campaigns`
- Campanhas de marketing/captação
- Campos: id, slug, name, institution, description, dates, status

#### `institutions`
- Instituições de ensino parceiras
- Campos: id, name, slug, short_name

#### `attachments`
- Arquivos anexados às campanhas
- Campos: id, campaign_id, file_name, storage_path, file_size

#### `comments`
- Comentários em campanhas
- Campos: id, campaign_id, user_id, content, parent_id

#### `tags`
- Tags para categorização
- Campos: id, name, slug, type (positive/negative)

### Relacionamentos

- `campaigns` → `institutions` (N:1)
- `campaigns` → `users` (created_by, assigned_to)
- `campaigns` → `campaign_tags` → `tags` (N:N)
- `comments` → `campaigns` (N:1)
- `comments` → `users` (N:1)
- `attachments` → `campaigns` (N:1)

## 🚀 Deploy em Produção

### Frontend (Vercel)

1. Conecte seu repositório ao Vercel
2. Configure variáveis de ambiente:
   - Não é necessário, as credenciais estão em `info.tsx`
3. Deploy automático a cada push

### Backend (Supabase)

Já está em produção! As Edge Functions rodam no Supabase.

### Variáveis de Ambiente (Produção)

⚠️ **SEGURANÇA**: Nunca commite o arquivo `info.tsx` com credenciais reais.

**Opção 1**: Gitignore + Variáveis de ambiente
```gitignore
# .gitignore
src/utils/supabase/info.tsx
```

**Opção 2**: Usar variáveis de ambiente do Vite
```typescript
// src/utils/supabase/info.tsx
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

No Vercel, configure:
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_ANON_KEY`

## 📝 Checklist Final

- [ ] Projeto Supabase criado
- [ ] Script `SETUP_DATABASE.sql` executado com sucesso
- [ ] Usuário sistema criado e verificado
- [ ] Edge Function deployada
- [ ] Variáveis de ambiente da Edge Function configuradas
- [ ] Bucket de storage criado
- [ ] Políticas de acesso configuradas
- [ ] Arquivo `info.tsx` criado com credenciais
- [ ] Dependências instaladas (`npm install`)
- [ ] Aplicação rodando em desenvolvimento
- [ ] Campanha de teste criada com sucesso
- [ ] Upload de anexo funcionando

## 🆘 Suporte

Se encontrar problemas não listados aqui:

1. Verifique os logs da Edge Function:
   ```bash
   supabase functions logs make-server-a1f709fc
   ```

2. Verifique os logs do Supabase no dashboard

3. Execute queries de diagnóstico:
   ```sql
   -- Ver últimos erros
   SELECT * FROM campaign_audit ORDER BY created_at DESC LIMIT 10;
   
   -- Ver estatísticas
   SELECT 
       (SELECT COUNT(*) FROM campaigns) as total_campanhas,
       (SELECT COUNT(*) FROM users) as total_usuarios,
       (SELECT COUNT(*) FROM institutions) as total_instituicoes,
       (SELECT COUNT(*) FROM tags) as total_tags;
   ```

## 🎉 Pronto!

Seu Gestor de Campanhas EdTech está configurado e funcionando! 

Próximos passos:
- Criar usuários reais (substituindo o usuário sistema)
- Personalizar tags e instituições
- Configurar autenticação real (Supabase Auth)
- Adicionar mais funcionalidades

