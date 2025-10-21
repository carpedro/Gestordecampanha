# 🚨 Você Viu Um Destes Erros?

```
Error: Key (created_by_user_id)=(00000000-0000-0000-0000-000000000000) 
is not present in table "users"
```

ou

```
Error: insert or update on table "campaigns" violates foreign key 
constraint "campaigns_created_by_user_id_fkey"
```

ou

```
Error: Institution not found
```

---

## ✅ Solução Rápida (2 Minutos)

### Esse erro significa:
> O banco de dados ainda não foi configurado. Você precisa executar UM script SQL no Supabase.

### Como resolver:

1. **Abra o guia:** [`START_HERE.md`](./START_HERE.md)
2. **Siga 4 passos simples** (leva 2 minutos)
3. **Teste novamente** - vai funcionar! ✅

---

## 🎯 Ou Execute Diretamente

Se você já sabe usar o SQL Editor do Supabase:

1. Vá para: https://supabase.com/dashboard
2. Seu projeto → SQL Editor → New query
3. Cole todo o conteúdo de: [`EXECUTE_NOW.sql`](./EXECUTE_NOW.sql)
4. Run
5. ✅ Pronto!

---

## 🤔 Por Que Esse Erro Acontece?

**Resposta simples:**
- O código está funcionando perfeitamente ✅
- Mas o banco de dados precisa ser configurado primeiro
- É uma configuração única (só precisa fazer uma vez)

**Resposta técnica:**
- O sistema foi convertido para "aberto" (sem login)
- Todas as ações são feitas por um "usuário sistema"
- Esse usuário precisa ser criado no banco
- As instituições de ensino também precisam ser criadas
- O script SQL faz isso automaticamente

---

## 📚 Precisa de Mais Ajuda?

### Nunca usou SQL Editor antes?
→ [`SUPABASE_VISUAL_GUIDE.md`](./SUPABASE_VISUAL_GUIDE.md) - Tutorial visual com screenshots

### Quer entender o problema?
→ [`CRITICAL_FIX_SUMMARY.md`](./CRITICAL_FIX_SUMMARY.md) - Resumo executivo

### Quer ver antes/depois?
→ [`BEFORE_AFTER.md`](./BEFORE_AFTER.md) - Comparação detalhada

### Quer um checklist completo?
→ [`SETUP_CHECKLIST.md`](./SETUP_CHECKLIST.md) - Passo a passo com checkboxes

---

## ⏱️ Tempo Total

- **Ler o guia:** 1 minuto
- **Executar script:** 30 segundos
- **Testar:** 30 segundos

**Total: 2 minutos!**

---

## ✅ Como Saber Se Resolveu?

Depois de executar o script:

1. Volte para a aplicação
2. Clique em "Nova Campanha"
3. Preencha nome e instituição
4. Salve

**Se funcionou sem erros = problema resolvido!** 🎉

---

## 🆘 O Script Não Funcionou?

### Viu erro: "relation users does not exist"
→ As tabelas do banco não foram criadas ainda. Precisa criar o schema primeiro.

### Viu erro: "permission denied"
→ Use o SQL Editor do Supabase Dashboard (não use psql ou DBeaver sem credenciais corretas)

### Script executou mas erro persiste no app
→ Limpe o cache: Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)

### Outro erro
→ Execute [`DIAGNOSTIC.sql`](./DIAGNOSTIC.sql) e veja o que deu errado

---

## 💡 Dica

Esse erro aparece quando você:
- ✅ Configurou o projeto pela primeira vez
- ✅ Clonou o repositório
- ✅ Conectou a um banco novo
- ✅ Resetou as tabelas do banco

É **normal** e **esperado**. A solução é simples e rápida! 🚀

---

**Próximo passo:** Abra [`START_HERE.md`](./START_HERE.md) agora! 👈
