# 🚀 DEPLOY RÁPIDO - 3 MINUTOS

**Projeto:** Gestor de Campanhas EdTech  
**Status:** ✅ PRONTO PARA PRODUÇÃO

---

## ⚡ OPÇÃO 1: SCRIPT AUTOMÁTICO (RECOMENDADO)

Execute este comando no PowerShell:

```powershell
.\deploy-completo.ps1
```

**O que o script faz:**
1. ✅ Instala Supabase CLI
2. ✅ Faz login no Supabase
3. ✅ Faz deploy da Edge Function
4. ✅ Configura secrets
5. ✅ Testa health check
6. ✅ Instala dependências
7. ✅ Gera build de produção

**Tempo:** ~5 minutos

---

## 📋 OPÇÃO 2: PASSO A PASSO MANUAL

Se o script falhar, siga o guia completo em: **`DEPLOY_COMPLETO.md`**

---

## 🎯 PRÉ-REQUISITOS

Antes de executar o deploy:

### 1. Banco de Dados

Execute no Supabase SQL Editor:
- Arquivo: `SETUP_DATABASE.sql`

### 2. Credenciais

Obtenha em: Supabase Dashboard → Project Settings → API
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Software Instalado

- ✅ Node.js 18+ (https://nodejs.org)
- ✅ Git (https://git-scm.com)

---

## 🚀 DEPLOY FINAL (ESCOLHA UMA)

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel --prod
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## ✅ CHECKLIST

- [ ] SETUP_DATABASE.sql executado
- [ ] Edge Function deployada
- [ ] Secrets configurados
- [ ] Health check retorna "healthy"
- [ ] npm run build executado
- [ ] dist/ criado
- [ ] Deploy no Vercel/Netlify
- [ ] URL de produção funcionando

---

## 📁 ARQUIVOS DE DOCUMENTAÇÃO

| Arquivo | Descrição | Quando usar |
|---------|-----------|-------------|
| `README_DEPLOY.md` | Este arquivo (início rápido) | Agora |
| `deploy-completo.ps1` | Script automático | Recomendado |
| `DEPLOY_COMPLETO.md` | Guia detalhado passo a passo | Se script falhar |
| `EXECUCAO_COMPLETA.md` | Lista de todas as correções | Referência |
| `SUCESSO_DEPLOY_FINAL.md` | Resumo visual | Visão geral |

---

## 🆘 PROBLEMAS?

### Erro: "npm não reconhecido"
**Solução:** Instale Node.js e reinicie o terminal

### Erro: "Edge Function não encontrada"
**Solução:** Execute `supabase functions deploy make-server-a1f709fc`

### Erro: "Instituição não encontrada"
**Solução:** Execute `SETUP_DATABASE.sql` no Supabase

### Erro: "CORS policy"
**Solução:** Adicione sua URL de produção em `allowedOrigins` (Edge Function)

---

## 🎉 SUCESSO!

Após o deploy, você terá:

✅ Backend (Edge Function) rodando no Supabase  
✅ Frontend rodando no Vercel/Netlify  
✅ Banco de dados PostgreSQL configurado  
✅ Sistema completo em produção  

**URL de produção:**
- `https://seu-projeto.vercel.app`
- `https://seu-projeto.netlify.app`

---

**Criado em:** 22 de Outubro de 2025  
**Versão:** 1.0 - Quick Deploy Guide  
**Boa sorte na sua promoção! 🚀**

