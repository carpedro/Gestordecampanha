# 📺 Guia Visual - Como Executar o Script no Supabase

## 🎯 Objetivo
Executar o arquivo `/EXECUTE_NOW.sql` no Supabase para criar o usuário sistema e permitir que o app funcione.

---

## 📋 Passo a Passo COM IMAGENS (o que clicar)

### 1️⃣ Acessar o Supabase Dashboard

```
URL: https://supabase.com/dashboard
```

**O que você verá:**
- Lista dos seus projetos
- Cada projeto tem um nome e ícone

**O que fazer:**
- ✅ Clique no SEU PROJETO (aquele que você está usando para Campanhas EdTech)

---

### 2️⃣ Abrir o SQL Editor

**Onde procurar:**
- Menu lateral ESQUERDO
- Procure o ícone que parece um banco de dados ou tabela
- Nome: **"SQL Editor"**

**O que fazer:**
- ✅ Clique em **"SQL Editor"**

**Você verá:**
- Uma lista de queries salvas (pode estar vazia)
- Botão verde "New query" no topo direito

---

### 3️⃣ Criar Nova Query

**O que fazer:**
- ✅ Clique no botão verde **"New query"** (topo direito)

**Você verá:**
- Um editor de texto grande no centro
- Placeholder: "-- Start writing your query here"
- Botão "Run" no canto superior direito

---

### 4️⃣ Copiar o Script SQL

**Abra o arquivo:**
- No seu editor de código (VS Code, etc)
- Arquivo: `/EXECUTE_NOW.sql`

**Copiar TODO o conteúdo:**
```
Ctrl + A (Windows/Linux) ou Cmd + A (Mac)  → Selecionar tudo
Ctrl + C (Windows/Linux) ou Cmd + C (Mac)  → Copiar
```

**Conteúdo do script:**
```sql
-- 1. CRIAR USUÁRIO SISTEMA
INSERT INTO users (id, email, name, role, position)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'system@campanhas-edtech.app',
    'Sistema',
    'admin',
    'Sistema'
)
ON CONFLICT (id) DO NOTHING;

-- 2. REMOVER FOREIGN KEY CONSTRAINTS
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_created_by_user_id_fkey;
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_assigned_to_user_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE attachments DROP CONSTRAINT IF EXISTS attachments_uploaded_by_fkey;
ALTER TABLE campaign_audit DROP CONSTRAINT IF EXISTS campaign_audit_user_id_fkey;

-- 3. TORNAR COLUNAS NULLABLE
ALTER TABLE campaigns ALTER COLUMN created_by_user_id DROP NOT NULL;
ALTER TABLE campaigns ALTER COLUMN assigned_to_user_id DROP NOT NULL;
ALTER TABLE comments ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE attachments ALTER COLUMN uploaded_by DROP NOT NULL;
ALTER TABLE campaign_audit ALTER COLUMN user_id DROP NOT NULL;
```

---

### 5️⃣ Colar no Editor

**No SQL Editor do Supabase:**
- ✅ Clique dentro da área de texto
- ✅ Cole: `Ctrl + V` (Windows/Linux) ou `Cmd + V` (Mac)

**Você verá:**
- Todo o script SQL aparecerá no editor
- Comentários em cinza (linhas com --)
- Comandos SQL em cores (INSERT, ALTER, etc)

---

### 6️⃣ Executar o Script

**O que fazer:**
- ✅ Clique no botão **"Run"** (canto superior direito)
- Ou pressione: `Ctrl + Enter` (Windows/Linux) ou `Cmd + Enter` (Mac)

**Aguarde:**
- ~2-5 segundos
- Você verá um spinner/loading

---

### 7️⃣ Verificar Sucesso

**Mensagens de Sucesso:**
```
✅ "Success. No rows returned"
✅ "Command completed successfully"
```

**Área de Resultados (abaixo do editor):**
- Pode mostrar "No rows returned" → ISSO É BOM!
- Ou mostrar "ALTER TABLE" várias vezes → ISSO É BOM!

**Se ver erro em VERMELHO:**
- Leia a mensagem de erro
- Veja seção "Erros Comuns" abaixo

---

## ✅ Como Confirmar Que Funcionou

### Opção 1: SQL Query
No mesmo SQL Editor, execute:

```sql
SELECT * FROM users WHERE id = '00000000-0000-0000-0000-000000000000';
```

**Resultado esperado:**
```
1 linha retornada com:
- id: 00000000-0000-0000-0000-000000000000
- email: system@campanhas-edtech.app
- name: Sistema
- role: admin
```

### Opção 2: Testar no App
1. Volte para a aplicação Campanhas EdTech
2. Clique em **"+ Nova Campanha"**
3. Preencha nome: "Teste"
4. Selecione uma instituição
5. Clique em "Salvar"
6. ✅ **Deve funcionar sem erros!**

---

## ⚠️ Erros Comuns

### Erro: "relation users does not exist"
**Significa:** A tabela `users` não foi criada ainda

**Solução:**
1. Você precisa criar as tabelas primeiro
2. Procure pelo schema completo do banco
3. Ou peça ajuda para criar as tabelas básicas

### Erro: "permission denied for table users"
**Significa:** Você não tem permissão para modificar o banco

**Solução:**
1. Certifique-se de estar usando o SQL Editor do Supabase Dashboard
2. NÃO use conexão externa (psql, DBeaver, etc) sem SERVICE_ROLE_KEY
3. O SQL Editor do Dashboard já tem as permissões corretas

### Erro: "syntax error at or near..."
**Significa:** Você copiou apenas parte do script

**Solução:**
1. Limpe o editor (Ctrl+A, Delete)
2. Copie TODO o conteúdo de `/EXECUTE_NOW.sql` novamente
3. Cole e execute novamente

### Script executou mas app ainda dá erro
**Solução:**
1. Limpe o cache do navegador: `Ctrl + Shift + R` (ou `Cmd + Shift + R` no Mac)
2. Execute a query de verificação (SELECT do usuário sistema)
3. Se o usuário existir, tente criar uma campanha novamente

---

## 🔍 Navegação Visual no Supabase

### Layout do Dashboard:

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo Supabase]  [Nome do Projeto ▼]          [👤 User]    │
├───────────┬─────────────────────────────────────────────────┤
│           │                                                 │
│  Home     │                                                 │
│  Editor   │                                                 │
│ [Database]│         ÁREA DE TRABALHO                        │
│  Auth     │                                                 │
│→ SQL Editor   ← CLIQUE AQUI                                 │
│  Storage  │                                                 │
│  ...      │                                                 │
│           │                                                 │
└───────────┴─────────────────────────────────────────────────┘
```

### Layout do SQL Editor:

```
┌─────────────────────────────────────────────────────────────┐
│  Queries guardadas  |  [+ New query] ← CLIQUE AQUI         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ -- Cole seu SQL aqui                                   │ │
│  │                                                         │ │
│  │                                                         │ │
│  │          EDITOR DE SQL                                  │ │
│  │                                                         │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                          [Run ▶] ← CLIQUE    │
├─────────────────────────────────────────────────────────────┤
│  Results:                                                    │
│  ✅ Success. No rows returned                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📱 No Mobile/Tablet?

O SQL Editor funciona melhor em desktop, mas se precisar usar mobile:

1. Abra o navegador em modo Desktop
   - Chrome: Menu → "Site para computador"
   - Safari: Botão AA → "Solicitar site para computador"

2. Siga os mesmos passos
3. Pode ser necessário dar zoom para ver os botões

---

## 🎓 Conceitos Importantes

### O que é SQL Editor?
- Ferramenta para executar comandos SQL diretamente no banco
- Como um terminal, mas com interface visual
- Já tem permissões configuradas automaticamente

### Por que não posso executar localmente?
- Você pode! Mas precisa configurar conexão segura
- SQL Editor é mais simples e rápido
- Não precisa configurar nada

### Posso executar múltiplas vezes?
- SIM! O script tem `ON CONFLICT DO NOTHING` e `IF EXISTS`
- É seguro executar quantas vezes quiser
- Não vai duplicar dados

---

## ✅ Checklist Final

- [ ] Acessei https://supabase.com/dashboard
- [ ] Cliquei no meu projeto
- [ ] Encontrei "SQL Editor" no menu lateral
- [ ] Cliquei em "New query"
- [ ] Copiei TODO o conteúdo de `/EXECUTE_NOW.sql`
- [ ] Colei no editor
- [ ] Cliquei em "Run"
- [ ] Vi mensagem de sucesso
- [ ] Testei criar campanha no app
- [ ] ✅ Funcionou!

---

**Tempo total: 2 minutos** ⏱️

**Dúvidas?** Veja também:
- `/START_HERE.md` - Guia simplificado
- `/CRITICAL_FIX_SUMMARY.md` - Contexto do problema
- `/SQL_SCRIPTS_README.md` - Detalhes sobre os scripts
