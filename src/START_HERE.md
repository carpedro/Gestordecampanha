# 🚨 COMECE AQUI - CONFIGURAÇÃO OBRIGATÓRIA

## ❌ Erro Atual
```
Error: Key (created_by_user_id)=(00000000-0000-0000-0000-000000000000) 
is not present in table "users"
```

## ✅ Solução (2 minutos)

### Passo 1: Abrir Supabase
1. Vá para: **https://supabase.com/dashboard**
2. Clique no seu projeto
3. No menu lateral esquerdo, clique em **SQL Editor**
4. Clique no botão **New query**

### Passo 2: Copiar o Script
1. Abra o arquivo: **`/EXECUTE_NOW.sql`** (nesta mesma pasta)
2. Selecione TODO o conteúdo (Ctrl/Cmd + A)
3. Copie (Ctrl/Cmd + C)

### Passo 3: Colar e Executar
1. Cole no SQL Editor do Supabase (Ctrl/Cmd + V)
2. Clique no botão verde **Run** (ou pressione Ctrl/Cmd + Enter)
3. Aguarde ~2 segundos
4. Você verá: "Success. No rows returned"

### Passo 4: Testar
1. Volte para a aplicação
2. Clique em **"+ Nova Campanha"**
3. Preencha nome e instituição
4. Clique em **Salvar**
5. ✅ **Deve funcionar agora!**

---

## 🎯 O Que o Script Faz

1. ✅ Cria o usuário sistema com ID `00000000-0000-0000-0000-000000000000`
2. ✅ Remove foreign keys (sistema sem autenticação)
3. ✅ Torna colunas de usuário opcionais
4. ✅ Cria as 8 instituições de ensino (PUCRS, FAAP, FIA Online, etc.)

---

## ⚠️ IMPORTANTE

**O sistema NÃO funcionará até você executar este script!**

O código do servidor já está correto, mas o banco precisa dessa configuração única.

---

## 🆘 Problemas?

### "relation users does not exist"
→ Você precisa criar as tabelas primeiro. Use o schema completo do Supabase.

### "permission denied"
→ Use o SQL Editor do Supabase Dashboard (já tem permissões corretas).

### Script executou mas erro persiste
→ Limpe o cache: Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)

---

## ✅ Como Saber Se Funcionou

Execute este SQL para verificar:

```sql
SELECT * FROM users WHERE id = '00000000-0000-0000-0000-000000000000';
```

Se retornar 1 linha com email 'system@campanhas-edtech.app', está OK! ✅

---

## 📚 Mais Informações

- Ver detalhes técnicos: `/CRITICAL_FIX_SUMMARY.md`
- Ver antes/depois: `/BEFORE_AFTER.md`
- Checklist completo: `/SETUP_CHECKLIST.md`

---

**Tempo total: 2 minutos** ⏱️
