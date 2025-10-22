# 🚀 GUIA COMPLETO DE DEPLOY - PRODUÇÃO

**Projeto:** Gestor de Campanhas EdTech  
**Data:** 22 de Outubro de 2025  
**Status:** ✅ Código pronto para deploy

---

## 📋 PRÉ-REQUISITOS

Antes de começar, certifique-se de ter:

- ✅ Node.js instalado (versão 18 ou superior)
- ✅ Conta no Supabase (https://supabase.com)
- ✅ Conta no Vercel (https://vercel.com) OU Netlify (https://netlify.com)
- ✅ Git instalado

---

## 🎯 ORDEM DE EXECUÇÃO

**IMPORTANTE:** Execute nesta ordem exata!

```
1. Configurar Banco de Dados (Supabase)
2. Deploy da Edge Function (Supabase)
3. Build do Frontend
4. Deploy do Frontend (Vercel/Netlify)
```

---

## PASSO 1: CONFIGURAR BANCO DE DADOS

### 1.1 Executar Script SQL

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: `jkplbqingkcmjhyogoiw`
3. Vá em: **SQL Editor** (menu lateral)
4. Clique em: **New Query**
5. Copie o conteúdo do arquivo: `SETUP_DATABASE.sql`
6. Cole no editor
7. Clique em: **Run** (ou F5)

### 1.2 Verificar Configuração

Execute no SQL Editor para verificar:

```sql
-- Verificar usuário sistema
SELECT * FROM users WHERE id = '00000000-0000-0000-0000-000000000000';
-- Deve retornar 1 linha

-- Verificar instituições
SELECT COUNT(*) FROM institutions;
-- Deve retornar 8

-- Verificar tags
SELECT COUNT(*) FROM tags;
-- Deve retornar pelo menos 10
```

**✅ Se todos retornarem resultados, prossiga!**

---

## PASSO 2: DEPLOY DA EDGE FUNCTION

### 2.1 Instalar Supabase CLI

Abra um terminal **com Node.js configurado** e execute:

```bash
npm install -g supabase
```

### 2.2 Login no Supabase

```bash
supabase login
```

Uma janela do navegador abrirá. Faça login.

### 2.3 Link com o Projeto

```bash
cd C:\Users\lalcantara\clone-gestor-campanha\Gestordecampanha
supabase link --project-ref jkplbqingkcmjhyogoiw
```

Você precisará fornecer sua senha do Supabase.

### 2.4 Criar Estrutura de Diretórios

```bash
mkdir -p supabase/functions/make-server-a1f709fc
```

### 2.5 Copiar Arquivos da Edge Function

```bash
# Windows (PowerShell)
Copy-Item src\supabase\functions\server\index.tsx supabase\functions\make-server-a1f709fc\index.ts
Copy-Item src\supabase\functions\server\deno.json supabase\functions\make-server-a1f709fc\deno.json
Copy-Item src\supabase\functions\server\types.d.ts supabase\functions\make-server-a1f709fc\types.d.ts

# Linux/Mac
cp src/supabase/functions/server/index.tsx supabase/functions/make-server-a1f709fc/index.ts
cp src/supabase/functions/server/deno.json supabase/functions/make-server-a1f709fc/deno.json
cp src/supabase/functions/server/types.d.ts supabase/functions/make-server-a1f709fc/types.d.ts
```

### 2.6 Deploy da Edge Function

```bash
supabase functions deploy make-server-a1f709fc
```

Aguarde a mensagem: **✅ Deployed function make-server-a1f709fc**

### 2.7 Configurar Secrets

**IMPORTANTE:** Obtenha suas chaves em: Supabase Dashboard → Project Settings → API

```bash
# Substitua pelos seus valores!
supabase secrets set SUPABASE_URL=https://jkplbqingkcmjhyogoiw.supabase.co
supabase secrets set SUPABASE_ANON_KEY=eyJhbGc...SUA_ANON_KEY_AQUI
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...SUA_SERVICE_ROLE_KEY_AQUI
```

### 2.8 Verificar Deploy

```bash
supabase functions list
```

Deve mostrar: `make-server-a1f709fc` com status **deployed**

### 2.9 Testar Health Check

```bash
# Windows (PowerShell)
curl https://jkplbqingkcmjhyogoiw.supabase.co/functions/v1/make-server-a1f709fc/health -H "Authorization: Bearer SUA_ANON_KEY"

# Linux/Mac
curl https://jkplbqingkcmjhyogoiw.supabase.co/functions/v1/make-server-a1f709fc/health \
  -H "Authorization: Bearer SUA_ANON_KEY"
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "issues": [],
  "timestamp": "2025-10-22T...",
  "message": "✅ Banco de dados configurado corretamente"
}
```

**✅ Se retornar "healthy", prossiga!**

---

## PASSO 3: BUILD DO FRONTEND

### 3.1 Instalar Dependências

```bash
cd C:\Users\lalcantara\clone-gestor-campanha\Gestordecampanha
npm install
```

### 3.2 Fazer Build de Produção

```bash
npm run build
```

**Saída esperada:**
```
vite v6.3.5 building for production...
✓ 234 modules transformed.
dist/index.html              0.45 kB │ gzip:  0.30 kB
dist/assets/index-abc123.js  234.56 kB │ gzip: 78.90 kB

✓ built in 12.34s
```

### 3.3 Verificar Build

A pasta `dist/` foi criada com:
- `index.html`
- `assets/` (JS e CSS)

### 3.4 Testar Localmente (Opcional)

```bash
npm run preview
```

Abra: http://localhost:4173

---

## PASSO 4A: DEPLOY NO VERCEL (RECOMENDADO)

### 4A.1 Instalar Vercel CLI

```bash
npm install -g vercel
```

### 4A.2 Login no Vercel

```bash
vercel login
```

### 4A.3 Deploy

```bash
vercel --prod
```

Siga as perguntas:

1. **Set up and deploy?** → `Y`
2. **Which scope?** → Selecione sua conta
3. **Link to existing project?** → `N`
4. **What's your project's name?** → `gestor-campanha`
5. **In which directory is your code located?** → `./`
6. **Want to override the settings?** → `N`

### 4A.4 Configurar Variáveis de Ambiente (Opcional)

No dashboard do Vercel:

1. Vá em: **Settings** → **Environment Variables**
2. Adicione:
   - `VITE_SUPABASE_PROJECT_ID` = `jkplbqingkcmjhyogoiw`
   - `VITE_SUPABASE_ANON_KEY` = Sua anon key

### 4A.5 Atualizar CORS na Edge Function

Após o deploy, você terá uma URL tipo: `https://gestor-campanha.vercel.app`

**Atualize a Edge Function:**

1. Abra: `src/supabase/functions/server/index.tsx`
2. Encontre: `allowedOrigins`
3. Adicione sua URL do Vercel:

```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://campanhas.figma.site',
  'https://gestor-campanha.vercel.app', // ← ADICIONE AQUI
];
```

4. Faça deploy novamente:

```bash
cd supabase/functions
supabase functions deploy make-server-a1f709fc
```

---

## PASSO 4B: DEPLOY NO NETLIFY (ALTERNATIVA)

### 4B.1 Instalar Netlify CLI

```bash
npm install -g netlify-cli
```

### 4B.2 Login no Netlify

```bash
netlify login
```

### 4B.3 Deploy

```bash
netlify deploy --prod
```

Siga as perguntas:

1. **Create & configure a new site?** → `Y`
2. **Team:** → Selecione seu time
3. **Site name:** → `gestor-campanha`
4. **Publish directory:** → `dist`

### 4B.4 Atualizar CORS

Mesma instrução do Vercel (Passo 4A.5), mas com a URL do Netlify.

---

## ✅ VERIFICAÇÃO FINAL

### Checklist de Deploy

- [ ] Banco de dados configurado (SETUP_DATABASE.sql executado)
- [ ] Usuário sistema existe
- [ ] Instituições cadastradas (8)
- [ ] Edge Function deployada
- [ ] Secrets configurados (3)
- [ ] Health check retorna 200
- [ ] Frontend buildado sem erros
- [ ] Frontend deployado (Vercel ou Netlify)
- [ ] CORS atualizado com URL de produção
- [ ] Aplicação acessível pela internet
- [ ] Teste de criação de campanha funciona

### Testar em Produção

1. Acesse sua URL de produção
2. Clique em "Nova Campanha"
3. Preencha os campos:
   - Nome: Teste de Produção
   - Instituição: PUCRS
   - Descrição: (140+ caracteres)
   - Data início: Hoje
   - Data fim: Amanhã
4. Clique em "Criar Iniciativa"
5. ✅ Se criar com sucesso, deploy concluído!

---

## 🆘 TROUBLESHOOTING

### Erro: "Edge Function não encontrada"

```bash
# Verifique o deploy
supabase functions list

# Faça deploy novamente
supabase functions deploy make-server-a1f709fc
```

### Erro: "CORS policy"

1. Verifique se adicionou a URL de produção em `allowedOrigins`
2. Faça deploy da Edge Function novamente
3. Limpe o cache do navegador (Ctrl+Shift+Delete)

### Erro: "Instituição não encontrada"

Execute `SETUP_DATABASE.sql` no Supabase SQL Editor.

### Erro: "Failed to fetch"

1. Verifique se a Edge Function está deployada
2. Teste o endpoint `/health` manualmente
3. Verifique os logs no Supabase Dashboard → Functions → Logs

### Build falha com erros TypeScript

```bash
# Limpe e reinstale dependências
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📊 ESTRUTURA DE ARQUIVOS

```
Gestordecampanha/
├── dist/                          ← Build de produção (gerado)
├── supabase/
│   └── functions/
│       └── make-server-a1f709fc/  ← Edge Function (criado no deploy)
├── src/
│   ├── components/                ← Componentes React
│   ├── supabase/
│   │   └── functions/
│   │       └── server/            ← Código fonte da Edge Function
│   ├── types/                     ← TypeScript types
│   └── utils/                     ← Serviços e utilitários
├── SETUP_DATABASE.sql             ← Script de setup do banco
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🎉 SUCESSO!

Parabéns! Seu sistema está em produção! 🚀

**URL de produção:**
- Vercel: `https://gestor-campanha.vercel.app`
- Netlify: `https://gestor-campanha.netlify.app`

**Edge Function:**
- `https://jkplbqingkcmjhyogoiw.supabase.co/functions/v1/make-server-a1f709fc`

**Próximos passos:**
1. Compartilhe a URL com seu time
2. Configure domínio personalizado (opcional)
3. Configure analytics (opcional)
4. Configure CI/CD para deploys automáticos (opcional)

---

**Criado em:** 22 de Outubro de 2025  
**Por:** AI Assistant  
**Versão:** 1.0 - Production Deploy Guide

