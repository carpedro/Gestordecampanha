# 🔍 DIAGNÓSTICO - Campanha Não Renderiza

## Problema Relatado
Campanhas criadas não estão sendo exibidas no site https://campanhas.figma.site/

## ✅ Checklist de Diagnóstico

### 1️⃣ Verificar se a Edge Function está deployada

1. Acesse: https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw/functions
2. Verifique se existe uma função chamada **`make-server-a1f709fc`**
3. Status deve estar: ✅ **Active** (verde)

**❌ NÃO EXISTE?** → Siga o **PASSO 2** do arquivo `DEPLOY_AGORA.md`

---

### 2️⃣ Verificar se o Banco de Dados está configurado

Execute este SQL no editor:

1. Abra: https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw/sql
2. Cole e execute:

```sql
-- Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('campaigns', 'institutions', 'users');

-- Verificar se há campanhas criadas
SELECT id, name, institution_id, status, created_at 
FROM campaigns 
ORDER BY created_at DESC 
LIMIT 5;

-- Verificar se há instituições
SELECT id, name, initials 
FROM institutions 
LIMIT 5;
```

**Resultados Esperados:**
- ✅ 3 tabelas devem aparecer (campaigns, institutions, users)
- ✅ Deve listar as campanhas criadas
- ✅ Deve listar as instituições (PUCRS, UniRitter, etc)

**❌ TABELAS NÃO EXISTEM?** → Execute `SETUP_DATABASE.sql` novamente

---

### 3️⃣ Testar a Edge Function diretamente

Abra o navegador e acesse esta URL:

```
https://jkplbqingkcmjhyogoiw.supabase.co/functions/v1/make-server-a1f709fc/campaigns
```

**Resultado Esperado:**
```json
{
  "campaigns": [
    {
      "id": "...",
      "name": "Nome da Campanha",
      "institution_id": "...",
      ...
    }
  ]
}
```

**❌ Erro 404 ou "Function not found"?**
→ Edge Function não foi deployada. Siga o **PASSO 2** do `DEPLOY_AGORA.md`

**❌ Erro 500 ou erro de banco?**
→ Verifique o **Passo 2️⃣** acima (banco de dados)

**❌ Retorna `{"campaigns": []}`?**
→ Banco está OK, mas sem dados. Crie uma nova campanha.

---

### 4️⃣ Verificar Secrets da Edge Function

1. Acesse: https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw/functions
2. Clique na função **`make-server-a1f709fc`**
3. Vá em **"Secrets"** ou **"Environment Variables"**

**Devem existir 3 variáveis:**

| Nome | Valor |
|------|-------|
| `SUPABASE_URL` | `https://jkplbqingkcmjhyogoiw.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGc...` (começa com eyJ) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (começa com eyJ, **diferente** da ANON_KEY) |

**❌ FALTANDO ALGUMA?** → Configure seguindo o **PASSO 3** do `DEPLOY_AGORA.md`

---

### 5️⃣ Verificar Console do Navegador

1. Abra o site: https://campanhas.figma.site/
2. Pressione **F12** para abrir o DevTools
3. Vá na aba **Console**
4. Procure por erros em vermelho

**Erros Comuns:**

#### `Failed to fetch` ou `Network Error`
**Causa:** Edge Function não responde
**Solução:** Verifique Passo 1️⃣ e 3️⃣

#### `Error fetching campaigns: {...}`
**Causa:** Problema na Edge Function ou banco
**Solução:** Verifique Passo 2️⃣ e 4️⃣

#### `CORS error` ou `Access-Control-Allow-Origin`
**Causa:** Configuração de CORS da Edge Function
**Solução:** Veja seção de **"Fix CORS"** abaixo

#### Nenhum erro, mas lista vazia
**Causa:** Não há campanhas no banco
**Solução:** Crie uma nova campanha pelo formulário

---

### 6️⃣ Verificar se a campanha foi realmente criada

Execute no SQL Editor:

```sql
SELECT 
    c.id,
    c.name,
    c.slug,
    i.name as institution_name,
    c.status,
    c.created_at
FROM campaigns c
LEFT JOIN institutions i ON c.institution_id = i.id
ORDER BY c.created_at DESC
LIMIT 10;
```

**Se aparecer a campanha aqui mas não no site:**
→ Problema é no frontend ou na Edge Function

**Se NÃO aparecer:**
→ A campanha não foi salva. Erro ao criar.

---

## 🔧 SOLUÇÕES RÁPIDAS

### Fix 1: Edge Function não foi deployada

```markdown
1. Acesse: https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw/functions
2. Clique em "Create a new function"
3. Nome: make-server-a1f709fc
4. Copie o conteúdo de: supabase/functions/make-server-a1f709fc/index.ts
5. Cole no editor e clique em "Deploy"
```

---

### Fix 2: Banco não está configurado

```markdown
1. Acesse: https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw/sql
2. Abra o arquivo: SETUP_DATABASE.sql
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em "Run" (▶️)
```

---

### Fix 3: Secrets não configurados

```markdown
1. Acesse: https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw/functions
2. Clique na função make-server-a1f709fc
3. Vá em "Secrets"
4. Adicione as 3 variáveis conforme Passo 4️⃣
```

---

### Fix 4: CORS Error

Se aparecer erro de CORS, verifique se a Edge Function tem este código no início:

```typescript
// No arquivo: supabase/functions/make-server-a1f709fc/index.ts
// Deve ter algo assim no início do handler:

Deno.serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }
  
  // ... resto do código
});
```

---

## 📊 Resumo dos Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/campaigns` | GET | Listar todas campanhas |
| `/campaigns` | POST | Criar nova campanha |
| `/campaigns/{id}` | PUT | Atualizar campanha |
| `/campaigns/{id}` | DELETE | Deletar campanha |
| `/campaigns/slug/{slug}` | GET | Buscar por slug |

**URL Base:** `https://jkplbqingkcmjhyogoiw.supabase.co/functions/v1/make-server-a1f709fc`

---

## 🎯 Próximos Passos

Siga os passos de 1️⃣ a 6️⃣ na ordem e me informe:

1. ✅ ou ❌ para cada passo
2. Se encontrar algum erro, copie a mensagem exata
3. Se aparecer algo diferente do esperado, me mostre

Assim conseguiremos identificar exatamente onde está o problema! 🔍

