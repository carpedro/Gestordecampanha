# ⚡ Início Rápido - Gestor de Campanhas

Este guia é para quem quer configurar o projeto rapidamente sem ler a documentação completa.

## 🎯 5 Passos Essenciais

### 1. Criar Projeto Supabase

1. Acesse https://supabase.com/dashboard
2. **New Project** → Configure e aguarde criar
3. Anote: **Project ID** e **anon key**

### 2. Configurar Banco de Dados

1. No Supabase: **SQL Editor** → **New query**
2. Copie e cole **TODO** conteúdo de `SETUP_DATABASE.sql`
3. Click **Run** ▶️
4. Aguarde aparecer: ✅ **BANCO DE DADOS CONFIGURADO COM SUCESSO!**

### 3. Deploy Edge Function

```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# Login
supabase login

# Linkar projeto (substitua seu-project-id)
supabase link --project-ref seu-project-id

# Criar estrutura
mkdir -p supabase/functions/make-server-a1f709fc

# Copiar função (Windows PowerShell)
Copy-Item src/supabase/functions/server/index.tsx supabase/functions/make-server-a1f709fc/index.ts

# Copiar função (macOS/Linux)
cp src/supabase/functions/server/index.tsx supabase/functions/make-server-a1f709fc/index.ts

# Deploy
supabase functions deploy make-server-a1f709fc

# Configurar variáveis (substitua pelos seus valores)
supabase secrets set SUPABASE_URL=https://seu-project-id.supabase.co
supabase secrets set SUPABASE_ANON_KEY=sua-anon-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### 4. Configurar Frontend

Crie o arquivo `src/utils/supabase/info.tsx`:

```typescript
export const projectId = 'seu-project-id';
export const publicAnonKey = 'sua-anon-key';
```

### 5. Rodar Aplicação

```bash
npm install
npm run dev
```

Acesse: http://localhost:5173

## ✅ Verificação Rápida

Execute no **SQL Editor** do Supabase:

```sql
-- Verificar tudo está OK
SELECT 
    'Usuário Sistema' as tipo,
    CASE WHEN EXISTS (
        SELECT 1 FROM users 
        WHERE id = '00000000-0000-0000-0000-000000000000'
    ) THEN '✅ OK' ELSE '❌ FALTA' END as status
UNION ALL
SELECT 
    'Instituições' as tipo,
    CASE WHEN (SELECT COUNT(*) FROM institutions) >= 8 
    THEN '✅ OK (' || (SELECT COUNT(*) FROM institutions) || ')' 
    ELSE '❌ FALTA' END as status
UNION ALL
SELECT 
    'Tabelas' as tipo,
    CASE WHEN (
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    ) >= 15 
    THEN '✅ OK' ELSE '❌ FALTA' END as status;
```

Tudo deve estar ✅ OK

## 🐛 Problemas?

### Erro ao criar campanha

**Erro**: "Instituição não encontrada"
→ Re-execute o `SETUP_DATABASE.sql`

**Erro**: "SYSTEM_USER_NOT_CREATED"
→ Execute no SQL Editor:
```sql
INSERT INTO users (id, email, name, full_name, role, position, area, is_active, email_verified) 
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'sistema@campanhas-edtech.app',
    'Sistema', 'Usuário Sistema', 'admin', 'Sistema', 'Tecnologia', TRUE, TRUE
);
```

### Erro "Failed to fetch"

→ Verifique se Edge Function foi deployada:
```bash
supabase functions list
```

→ Verifique variáveis de ambiente:
```bash
supabase secrets list
```

### Frontend não carrega

→ Verifique arquivo `src/utils/supabase/info.tsx` existe e tem valores corretos

## 📚 Documentação Completa

Para detalhes completos, veja `GUIA_DE_INSTALACAO.md`

## 🎉 Pronto!

Se tudo funcionou, você já pode:
- ✅ Criar campanhas
- ✅ Editar campanhas
- ✅ Ver em calendário, Gantt, tabela
- ✅ Adicionar tags
- ✅ Fazer upload de anexos
- ✅ Adicionar comentários

Aproveite! 🚀

