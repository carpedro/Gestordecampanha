# 🚨 CORREÇÃO URGENTE - ERRO DE CRIAÇÃO DE CAMPANHAS

> 📋 **Prefere um checklist passo a passo?** Veja `/SETUP_CHECKLIST.md`

## ❌ Problemas Detectados

### Erro 1 (Resolvido no código):
```
"null value in column \"created_by_user_id\" violates not-null constraint"
```

### Erro 2 (Atual):
```
"insert or update on table \"campaigns\" violates foreign key constraint 
\"campaigns_created_by_user_id_fkey\""
```

**Causa**: O usuário sistema ainda não existe no banco de dados!

## ✅ Solução

O banco de dados PostgreSQL ainda tem constraints NOT NULL nas colunas de usuário, mas o sistema agora é aberto (sem autenticação). 

**EXECUTEI 2 CORREÇÕES:**

### 1. ✨ Atualização do Código do Servidor (JÁ FEITO)
Atualizei o arquivo `/supabase/functions/server/index.tsx` para sempre enviar o `SYSTEM_USER_ID` ao criar:
- Campanhas → `created_by_user_id` e `assigned_to_user_id`
- Comentários → `user_id`
- Anexos → `uploaded_by`

### 2. 🔧 Script SQL Corrigido (VOCÊ PRECISA EXECUTAR)

Atualizei o arquivo `/database_fix.sql` com a correção crítica que **remove as constraints NOT NULL**.

## 📋 COMO EXECUTAR O SCRIPT

### ⚡ OPÇÃO A: Correção Rápida (RECOMENDADO - 30 segundos)
Use o arquivo `/quick_fix.sql` - script minimalista focado apenas no erro atual:

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (ícone de banco de dados na barra lateral)
4. Clique em **New query**
5. Cole TODO o conteúdo do arquivo `/quick_fix.sql`
6. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)
7. ✅ Pronto! Teste criar uma campanha agora

### 🔧 Opção B: Correção Completa (Mais completo - 2 minutos)
Use o arquivo `/database_fix.sql` - script completo com triggers, views e dados iniciais:

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Clique em **New query**
5. Cole TODO o conteúdo do arquivo `/database_fix.sql`
6. Clique em **Run**
7. Verifique os resultados no final (estatísticas das tabelas)

## 🔍 O Que o Script Faz (NA ORDEM CORRETA)

1. ✅ **CRIA USUÁRIO SISTEMA PRIMEIRO** (crítico!) → ID `00000000-0000-0000-0000-000000000000`
2. ✅ **Remove triggers antigos** com dependências de user_id
3. ✅ **Remove funções antigas** que causam erros
4. ✅ **Remove views antigas** com referências a usuários
5. ✅ **Remove constraints de foreign key** (sistema sem autenticação!)
   - `campaigns_created_by_user_id_fkey`
   - `campaigns_assigned_to_user_id_fkey`
   - `comments_user_id_fkey`
   - `attachments_uploaded_by_fkey`
   - `campaign_audit_user_id_fkey`
6. ✅ **Torna colunas NULLABLE**:
   - `campaigns.created_by_user_id`
   - `campaigns.assigned_to_user_id`
   - `comments.user_id`
   - `attachments.uploaded_by`
   - `campaign_audit.user_id`
7. ✅ **Atualiza registros existentes** com ID do usuário sistema
8. ✅ **Insere dados iniciais** de instituições e tags
9. ✅ **Cria trigger simplificado** de auditoria
10. ✅ **Cria views otimizadas** sem dependências de usuário
11. ✅ **Verifica integridade** do banco

## ⚡ Status Atual

### ✅ Código do Servidor
- [x] Envia `created_by_user_id` ao criar campanhas
- [x] Envia `assigned_to_user_id` ao criar campanhas
- [x] Envia `user_id` ao criar comentários
- [x] Envia `uploaded_by` ao criar anexos
- [x] Usa constante `SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000'`

### ⏳ Banco de Dados
- [ ] **AGUARDANDO EXECUÇÃO DO SCRIPT** `/database_fix.sql`

## 🎯 Próximos Passos

1. **Execute o script agora** seguindo as instruções acima
2. Teste criar uma nova campanha
3. Verifique se o erro desapareceu

## 📞 Verificação de Sucesso

Após executar o script, você deve ver no final:

```
Campanhas | total | ativas | deletadas
Comentários | total | ativas | deletadas
Anexos | total | ativas | deletadas
Instituições | total | ativas | inativas
Tags | total | NULL | NULL
```

E **NÃO** deve ver nenhum erro como:
- "ERRO: Campanhas sem instituição"
- "ERRO: Slugs duplicados"

## ✨ Resultado Esperado

Depois de executar o script, você poderá:
- ✅ Criar campanhas normalmente
- ✅ Adicionar comentários
- ✅ Fazer upload de anexos
- ✅ Visualizar histórico de edições
- ✅ Sistema 100% funcional sem autenticação

---

**IMPORTANTE**: O código do servidor JÁ FOI ATUALIZADO. Você só precisa EXECUTAR o script SQL no Supabase!
