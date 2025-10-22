# 🚀 Deploy Manual - Sem Supabase CLI

Se você não consegue instalar o Supabase CLI, siga este guia para fazer o deploy manual.

## ✅ O Que Já Foi Preparado

- ✅ Estrutura da Edge Function criada em `supabase/functions/make-server-a1f709fc/`
- ✅ Código da função copiado para `supabase/functions/make-server-a1f709fc/index.ts`
- ✅ Arquivo `info.tsx` já configurado com suas credenciais

## 📋 Seus Dados do Supabase

```
Project ID: jkplbqingkcmjhyogoiw
Project URL: https://jkplbqingkcmjhyogoiw.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcGxicWluZ2tjbWpoeW9nb2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDU1OTUsImV4cCI6MjA3NjIyMTU5NX0.UTs7ArhP1-znaj_SEku7KWtQ_15S6uYxbuL0rxjwzQU
```

## 🔥 Opção 1: Deploy pela Interface do Supabase

### Passo 1: Criar Edge Function no Dashboard

1. Acesse: https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw
2. No menu lateral, clique em **Edge Functions**
3. Clique em **Create a new function**
4. Preencha:
   - **Name**: `make-server-a1f709fc`
   - Clique em **Create function**

### Passo 2: Copiar Código da Função

1. Abra o arquivo: `supabase/functions/make-server-a1f709fc/index.ts`
2. Copie **TODO** o conteúdo do arquivo
3. No dashboard, cole o código no editor
4. Clique em **Deploy** ou **Save**

### Passo 3: Configurar Variáveis de Ambiente

1. Ainda na página da Edge Function, procure por **Secrets** ou **Environment Variables**
2. Adicione estas 3 variáveis:

```
SUPABASE_URL = https://jkplbqingkcmjhyogoiw.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcGxicWluZ2tjbWpoeW9nb2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDU1OTUsImV4cCI6MjA3NjIyMTU5NX0.UTs7ArhP1-znaj_SEku7KWtQ_15S6uYxbuL0rxjwzQU
SUPABASE_SERVICE_ROLE_KEY = [PRECISA PEGAR NO DASHBOARD]
```

**⚠️ IMPORTANTE**: Para obter o `SUPABASE_SERVICE_ROLE_KEY`:
1. Vá em **Settings** → **API**
2. Copie o valor de **service_role** (⚠️ MANTENHA SECRETO!)

### Passo 4: Testar a Função

1. No dashboard da função, procure por **Test** ou **Invoke**
2. Teste com:
   ```json
   GET /make-server-a1f709fc/campaigns
   ```
3. Deve retornar status 200 (mesmo que vazio)

## 🔥 Opção 2: Instalar Supabase CLI e Deploy Automático

### Para Windows:

#### Método 1: Via Scoop (Recomendado)

```powershell
# Instalar Scoop (se não tiver)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Instalar Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### Método 2: Via Chocolatey

```powershell
# Se tiver Chocolatey instalado
choco install supabase
```

#### Método 3: Download Direto

1. Baixe: https://github.com/supabase/cli/releases/latest
2. Escolha: `supabase_windows_amd64.zip`
3. Extraia e adicione ao PATH

### Após Instalar CLI:

```powershell
# Login
supabase login

# Linkar projeto
supabase link --project-ref jkplbqingkcmjhyogoiw

# Deploy
supabase functions deploy make-server-a1f709fc

# Configurar secrets
supabase secrets set SUPABASE_URL=https://jkplbqingkcmjhyogoiw.supabase.co
supabase secrets set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcGxicWluZ2tjbWpoeW9nb2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDU1OTUsImV4cCI6MjA3NjIyMTU5NX0.UTs7ArhP1-znaj_SEku7KWtQ_15S6uYxbuL0rxjwzQU
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=[sua-service-role-key]
```

## 📊 Passo 5: Executar Script do Banco de Dados

**CRÍTICO**: Execute este passo para criar todas tabelas!

1. Acesse: https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw/sql
2. Clique em **New query**
3. Abra o arquivo `SETUP_DATABASE.sql` deste projeto
4. Copie **TODO** o conteúdo
5. Cole no SQL Editor
6. Clique em **Run** ▶️

**Resultado esperado**:
```
✅ BANCO DE DADOS CONFIGURADO COM SUCESSO!
```

## 🧪 Passo 6: Testar a Aplicação

```powershell
# Instalar dependências (se não fez ainda)
npm install

# Rodar aplicação
npm run dev
```

Acesse: http://localhost:5173

### Teste Criar Campanha:

1. Clique em **"Nova Campanha"**
2. Preencha:
   - Nome: Teste Deploy
   - Instituição: PUCRS
   - Descrição: Testando após deploy
   - Datas: qualquer período
3. Salvar

**✅ Se funcionou**: Deploy completo!

## 🔍 Verificação Completa

Execute no SQL Editor do Supabase o arquivo `VERIFICACAO.sql`:

```sql
-- Copie e cole o conteúdo de VERIFICACAO.sql
```

Deve mostrar: `✅ VERIFICAÇÃO COMPLETA: 8/8 CHECKS PASSARAM`

## 🐛 Troubleshooting

### Edge Function não aparece no dashboard

- Verifique se está no projeto correto
- Tente criar manualmente via interface
- Nome exato deve ser: `make-server-a1f709fc`

### Erro ao criar campanha: "Instituição não encontrada"

- Execute `SETUP_DATABASE.sql` novamente
- Verifique se apareceu mensagem de sucesso

### Erro: "SYSTEM_USER_NOT_CREATED"

- Execute no SQL Editor:
```sql
INSERT INTO users (id, email, name, full_name, role, position, area, is_active, email_verified) 
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'sistema@campanhas-edtech.app',
    'Sistema',
    'Usuário Sistema',
    'admin',
    'Sistema',
    'Tecnologia',
    TRUE,
    TRUE
) ON CONFLICT (id) DO NOTHING;
```

### Frontend não conecta com backend

1. Verifique `src/utils/supabase/info.tsx` tem valores corretos
2. Verifique Edge Function está deployada
3. Verifique secrets estão configurados na Edge Function

## 📝 Checklist Final

- [ ] Edge Function criada no Supabase
- [ ] Código da função copiado e deployado
- [ ] 3 secrets configurados (URL, ANON_KEY, SERVICE_ROLE_KEY)
- [ ] SETUP_DATABASE.sql executado com sucesso
- [ ] VERIFICACAO.sql executado (8/8 checks)
- [ ] npm install executado
- [ ] npm run dev funcionando
- [ ] Campanha de teste criada com sucesso

## 🎉 Pronto!

Se completou todos os itens acima, seu Gestor de Campanhas está **deployado e funcionando**!

---

**Precisa de ajuda?** Consulte `GUIA_DE_INSTALACAO.md` para troubleshooting completo.

