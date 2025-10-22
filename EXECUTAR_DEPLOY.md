# 🚀 EXECUTAR DEPLOY - INSTRUÇÕES RÁPIDAS

**Criado:** 22 de Outubro de 2025  
**Tempo estimado:** 30-45 minutos

---

## ⚡ MÉTODO RÁPIDO (RECOMENDADO)

### Opção 1: Executar Script Automatizado

**Pré-requisito:** Node.js instalado

```powershell
# Abra um PowerShell NOVO (como Administrador)
# Navegue até a pasta do projeto
cd C:\Users\lalcantara\clone-gestor-campanha\Gestordecampanha

# Execute o script
.\deploy-edge-function.ps1
```

**O script fará automaticamente:**
- ✅ Instalar Supabase CLI
- ✅ Login no Supabase
- ✅ Linkar com o projeto
- ✅ Criar estrutura de pastas
- ✅ Copiar arquivos
- ✅ Deploy da função
- ✅ Configurar todos os secrets

---

### Opção 2: Executar Comandos Manualmente

Se preferir executar passo a passo, copie e cole cada comando:

```powershell
# 1. Instalar CLI
npm install -g supabase

# 2. Login (abrirá navegador)
supabase login

# 3. Linkar projeto
supabase link --project-ref jkplbqingkcmjhyogoiw

# 4. Criar pastas
New-Item -ItemType Directory -Path "supabase\functions\make-server-a1f709fc" -Force

# 5. Copiar arquivos
Copy-Item "src\supabase\functions\server\index.tsx" "supabase\functions\make-server-a1f709fc\index.ts" -Force
Copy-Item "src\supabase\functions\server\deno.json" "supabase\functions\make-server-a1f709fc\deno.json" -Force
Copy-Item "src\supabase\functions\server\types.d.ts" "supabase\functions\make-server-a1f709fc\types.d.ts" -Force

# 6. Deploy
supabase functions deploy make-server-a1f709fc

# 7. Configurar Secrets
supabase secrets set SUPABASE_URL=https://jkplbqingkcmjhyogoiw.supabase.co
supabase secrets set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcGxicWluZ2tjbWpoeW9nb2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDU1OTUsImV4cCI6MjA3NjIyMTU5NX0.UTs7ArhP1-znaj_SEku7KWtQ_15S6uYxbuL0rxjwzQU
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcGxicWluZ2tjbWpoeW9nb2l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY0NTU5NSwiZXhwIjoyMDc2MjIxNTk1fQ.qDOKtXgLiJ-i8NjjhihUaopo9r1H-JK3-6mVcvr5wzY

# 8. Verificar
supabase functions list
supabase secrets list
```

---

## 🔍 VERIFICAÇÃO APÓS DEPLOY

```powershell
# Listar funções
supabase functions list
# Deve mostrar: make-server-a1f709fc (Active)

# Listar secrets
supabase secrets list
# Deve mostrar: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

---

## 🧪 TESTAR A APLICAÇÃO

```powershell
# Rodar aplicação localmente
npm run dev

# Abrir navegador em:
# http://localhost:5173

# Testar:
# 1. Clicar em "Nova Campanha"
# 2. Preencher campos
# 3. Instituição: PUCRS
# 4. Descrição: 140+ caracteres
# 5. Salvar
# 6. ✅ Campanha deve aparecer na lista!
```

---

## 🐛 SE ALGO DER ERRADO

### Erro: "npm não é reconhecido"
**Solução:**
1. Instale Node.js: https://nodejs.org/
2. Reinicie o PowerShell
3. Tente novamente

### Erro: "supabase não é reconhecido"
**Solução:**
```powershell
npm install -g supabase
# Feche e abra o PowerShell novamente
```

### Erro ao fazer login
**Solução:**
- Certifique-se de ter uma conta Supabase
- Use o navegador padrão para fazer login
- Se não abrir automaticamente, copie o link e cole no navegador

### Erro ao linkar projeto (pede senha)
**Solução:**
1. Acesse: https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw/settings/database
2. Se necessário, reset a senha do banco
3. Use a senha ao executar `supabase link`

### Erro ao copiar arquivos
**Solução:**
- Verifique se os arquivos existem em `src/supabase/functions/server/`
- Execute os comandos de cópia um por um

### Deploy falha
**Solução:**
```powershell
# Ver logs
supabase functions logs make-server-a1f709fc

# Tentar novamente
supabase functions deploy make-server-a1f709fc
```

---

## ✅ CHECKLIST FINAL

```
Antes do deploy:
  ✅ Node.js instalado
  ✅ Terminal PowerShell aberto
  ✅ Na pasta do projeto
  
Durante o deploy:
  [ ] Supabase CLI instalado
  [ ] Login realizado
  [ ] Projeto linkado
  [ ] Pastas criadas
  [ ] Arquivos copiados
  [ ] Função deployada
  [ ] Secrets configurados
  
Verificação:
  [ ] Função aparece na lista
  [ ] 3 secrets configurados
  [ ] npm run dev funciona
  [ ] Criar campanha funciona
  
🎉 Pronto para produção!
```

---

## 📊 APÓS DEPLOY BEM-SUCEDIDO

Você terá:
- ✅ Edge Function deployada e ativa
- ✅ Todas as credenciais configuradas
- ✅ Service role key protegida (apenas backend)
- ✅ Sistema 100% funcional

**URL da Edge Function:**
```
https://jkplbqingkcmjhyogoiw.supabase.co/functions/v1/make-server-a1f709fc
```

---

## 🎯 PRÓXIMO PASSO

Após deploy bem-sucedido:

```powershell
npm run dev
```

Acesse `http://localhost:5173` e teste criar uma campanha!

Se funcionar: **PARABÉNS! 🎉 Seu projeto está pronto para produção!**

---

## 📞 LINKS ÚTEIS

- **Dashboard:** https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw
- **Edge Functions:** https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw/functions
- **Logs:** Clique na função → "Logs"

---

**BOA SORTE! 🚀**

*Tempo estimado: 30-45 minutos*  
*Última atualização: 22 de Outubro de 2025*

