# 🚀 DEPLOY DA EDGE FUNCTION - GUIA ATUALIZADO

**Data:** 22 de Outubro de 2025  
**Service Role Key:** Fornecida ✅  
**Status:** Pronto para deploy

---

## 📋 PRÉ-REQUISITOS

- [x] Código da Edge Function corrigido ✅
- [x] Service Role Key disponível ✅
- [ ] Supabase CLI instalado
- [ ] Login no Supabase realizado

---

## 🔧 PASSO 1: INSTALAR SUPABASE CLI

```bash
npm install -g supabase
```

**Resultado esperado:**
```
added 1 package in 5s
```

---

## 🔑 PASSO 2: LOGIN NO SUPABASE

```bash
supabase login
```

**Resultado esperado:**
- Abrirá seu navegador
- Faça login com sua conta Supabase
- Retorna: "Logged in successfully"

---

## 🔗 PASSO 3: LINKAR COM SEU PROJETO

```bash
supabase link --project-ref jkplbqingkcmjhyogoiw
```

**Se pedir senha do banco:**
- Use a senha que você criou ao criar o projeto Supabase
- Ou recupere em: https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw/settings/database

**Resultado esperado:**
```
Linked to project jkplbqingkcmjhyogoiw
```

---

## 📁 PASSO 4: CRIAR ESTRUTURA DE PASTAS

```bash
mkdir -p supabase/functions/make-server-a1f709fc
```

---

## 📝 PASSO 5: COPIAR ARQUIVOS DA FUNÇÃO

**Windows PowerShell:**
```powershell
Copy-Item src/supabase/functions/server/index.tsx supabase/functions/make-server-a1f709fc/index.ts
Copy-Item src/supabase/functions/server/deno.json supabase/functions/make-server-a1f709fc/deno.json
Copy-Item src/supabase/functions/server/types.d.ts supabase/functions/make-server-a1f709fc/types.d.ts
```

**Resultado esperado:**
- 3 arquivos copiados sem erros

---

## 🚀 PASSO 6: DEPLOY DA FUNÇÃO

```bash
supabase functions deploy make-server-a1f709fc
```

**Resultado esperado:**
```
Deploying function make-server-a1f709fc...
Function deployed successfully!
URL: https://jkplbqingkcmjhyogoiw.supabase.co/functions/v1/make-server-a1f709fc
```

---

## 🔐 PASSO 7: CONFIGURAR SECRETS (IMPORTANTE!)

**Execute estes comandos um por um:**

### 7.1 - Configurar SUPABASE_URL
```bash
supabase secrets set SUPABASE_URL=https://jkplbqingkcmjhyogoiw.supabase.co
```

### 7.2 - Configurar SUPABASE_ANON_KEY
**⚠️ IMPORTANTE:** Use a **anon key** (chave pública), não a service role!

Para obter a anon key:
1. Vá em: https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw/settings/api
2. Copie o valor de "Project API keys" → "anon" → "public"
3. Substitua abaixo:

```bash
supabase secrets set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcGxicWluZ2tjbWpoeW9nb2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDU1OTUsImV4cCI6MjA3NjIyMTU5NX0.UTs7ArhP1-znaj_SEku7KWtQ_15S6uYxbuL0rxjwzQU
```

### 7.3 - Configurar SUPABASE_SERVICE_ROLE_KEY ✅
**Esta é a chave SECRETA que você forneceu:**

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sb_secret_zZ73dySzGBVVfirNtdE5AQ_TUsDsHBB
```

**Resultado esperado para cada comando:**
```
Secret SUPABASE_URL set successfully
Secret SUPABASE_ANON_KEY set successfully
Secret SUPABASE_SERVICE_ROLE_KEY set successfully
```

---

## ✅ PASSO 8: VERIFICAR CONFIGURAÇÃO

```bash
supabase functions list
```

**Resultado esperado:**
```
NAME                      STATUS    CREATED AT
make-server-a1f709fc      Active    2025-10-22...
```

**Verificar secrets (não mostra valores, apenas nomes):**
```bash
supabase secrets list
```

**Resultado esperado:**
```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

---

## 🧪 PASSO 9: TESTAR A FUNÇÃO

**Teste 1: Health Check (se implementado)**
```bash
curl https://jkplbqingkcmjhyogoiw.supabase.co/functions/v1/make-server-a1f709fc/health
```

**Teste 2: Listar Campanhas**
```bash
curl https://jkplbqingkcmjhyogoiw.supabase.co/functions/v1/make-server-a1f709fc/campaigns
```

**Resultado esperado:**
```json
{
  "campaigns": []
}
```
ou
```json
{
  "campaigns": [...]
}
```

---

## 📊 CHECKLIST COMPLETO

```
Preparação:
  ✅ Service Role Key disponível
  ✅ Código da função corrigido
  
Instalação:
  [ ] Supabase CLI instalado
  [ ] Login realizado
  [ ] Projeto linkado
  
Deploy:
  [ ] Estrutura de pastas criada
  [ ] Arquivos copiados
  [ ] Função deployada
  
Configuração:
  [ ] SUPABASE_URL configurado
  [ ] SUPABASE_ANON_KEY configurado
  [ ] SUPABASE_SERVICE_ROLE_KEY configurado ✨
  
Verificação:
  [ ] Função aparece na lista
  [ ] Secrets aparecem na lista
  [ ] Teste de API retorna resposta
  
Teste Local:
  [ ] npm run dev funciona
  [ ] Criar campanha funciona
  [ ] Anexos funcionam
```

---

## 🐛 TROUBLESHOOTING

### Erro: "command not found: supabase"
**Solução:**
```bash
npm install -g supabase
# Ou feche e abra o terminal novamente
```

### Erro: "Not logged in"
**Solução:**
```bash
supabase login
```

### Erro: "Project not linked"
**Solução:**
```bash
supabase link --project-ref jkplbqingkcmjhyogoiw
```

### Erro ao fazer deploy
**Solução:**
```bash
# Verificar se os arquivos foram copiados
ls supabase/functions/make-server-a1f709fc

# Deve mostrar: index.ts, deno.json, types.d.ts
```

### Função retorna erro 500
**Solução:**
```bash
# Ver logs da função
supabase functions logs make-server-a1f709fc

# Verificar se os secrets estão configurados
supabase secrets list
```

---

## 🔒 SEGURANÇA IMPORTANTE

### ✅ O QUE ESTÁ SEGURO:

- **Service Role Key:** Configurada apenas na Edge Function (backend)
  - ✅ Nunca exposta ao frontend
  - ✅ Apenas servidor tem acesso
  - ✅ Protegida pelos secrets do Supabase

### ❌ O QUE NÃO FAZER:

- ❌ **NUNCA** coloque a service role key em `src/utils/supabase/info.tsx`
- ❌ **NUNCA** commite a service role key no Git
- ❌ **NUNCA** use a service role key no código do navegador

### 📝 LEMBRETE:

O arquivo `src/utils/supabase/info.tsx` deve conter APENAS:
```typescript
export const projectId = "jkplbqingkcmjhyogoiw"
export const publicAnonKey = "eyJhbGc..." // ANON KEY, não service role!
```

---

## 🎯 APÓS O DEPLOY

Sua Edge Function estará:
- ✅ Deployada e ativa
- ✅ Com todas as credenciais corretas
- ✅ Service role key protegida
- ✅ Pronta para uso em produção

**URL da função:**
```
https://jkplbqingkcmjhyogoiw.supabase.co/functions/v1/make-server-a1f709fc
```

---

## 🚀 PRÓXIMO PASSO

Após concluir este deploy, execute:
```bash
npm run dev
```

E teste criar uma campanha! Se funcionar, você está **100% pronto para produção**! 🎉

---

## 📞 LINKS ÚTEIS

- **Dashboard Supabase:** https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw
- **Edge Functions:** https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw/functions
- **API Settings:** https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw/settings/api
- **Logs da Função:** https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw/functions

---

**BOA SORTE COM O DEPLOY! 🚀**

*Tempo estimado: 30-45 minutos*  
*Dificuldade: Média*  
*Resultado: Produção pronta!*

