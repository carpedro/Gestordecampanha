# 🏫 Erro: "Institution not found"

## 🚨 O Problema

Você tentou criar uma campanha e recebeu:

```
Error: Institution not found
```

Ou viu no console:

```
Error creating campaign: {"error":"Institution not found"}
Error saving campaign: Error: Falha ao criar iniciativa
```

---

## ✅ Causa do Erro

O formulário enviou o nome da instituição (ex: "PUCRS", "FAAP"), mas o banco de dados **não tem essa instituição cadastrada**.

### Por que acontece?

1. O frontend tem uma lista hardcoded de 8 instituições
2. O servidor busca a instituição no banco pelo nome
3. Se não encontrar → retorna erro "Institution not found"

---

## 🔧 Solução Rápida

### Você já executou EXECUTE_NOW.sql?

**SIM** → Execute novamente! A versão antiga não criava instituições.

**NÃO** → Execute agora! A versão atual já inclui as instituições.

### Passo a Passo:

1. Abra: **https://supabase.com/dashboard**
2. Seu projeto → **SQL Editor** → **New query**
3. Cole todo o conteúdo de: **`EXECUTE_NOW.sql`**
4. Clique em **Run**
5. ✅ Pronto!

---

## 📊 O Que o Script Faz

O script atualizado (`EXECUTE_NOW.sql`) agora cria:

1. ✅ Usuário sistema
2. ✅ Remove constraints
3. ✅ Torna colunas nullable
4. ✅ **8 Instituições de ensino** (NOVO!)

As instituições criadas:
- PUCRS
- PUCRS Grad
- FAAP
- FIA Online
- UNESC
- Santa Casa SP
- Impacta
- FSL Digital

---

## 🔍 Verificar Se As Instituições Foram Criadas

Execute este SQL no Supabase SQL Editor:

```sql
SELECT id, name, slug FROM institutions ORDER BY sort_order;
```

**Resultado esperado:** 8 linhas com as instituições acima.

Se retornar **0 linhas** → As instituições não foram criadas.

---

## 🛠️ Solução Manual (Se o Script Não Funcionou)

Se por algum motivo o script completo não funcionou, execute apenas a parte das instituições:

```sql
INSERT INTO institutions (id, name, slug, short_name, is_active, sort_order) VALUES
(1, 'PUCRS', 'pucrs', 'PUCRS', true, 1),
(2, 'PUCRS Grad', 'pucrs-grad', 'PUCRS Grad', true, 2),
(3, 'FAAP', 'faap', 'FAAP', true, 3),
(4, 'FIA Online', 'fia-online', 'FIA Online', true, 4),
(5, 'UNESC', 'unesc', 'UNESC', true, 5),
(6, 'Santa Casa SP', 'santa-casa-sp', 'Santa Casa', true, 6),
(7, 'Impacta', 'impacta', 'Impacta', true, 7),
(8, 'FSL Digital', 'fsl-digital', 'FSL Digital', true, 8)
ON CONFLICT (id) DO NOTHING;
```

---

## ✅ Como Saber Se Resolveu?

1. Volte para a aplicação
2. Clique em **"+ Nova Campanha"**
3. Preencha:
   - **Nome:** "Teste"
   - **Instituição:** Selecione "PUCRS" (ou qualquer uma)
   - **Descrição:** (mínimo 140 caracteres)
   - **Datas:** Hoje até amanhã
4. Clique em **Salvar**

**Se a campanha foi criada com sucesso → problema resolvido!** 🎉

---

## 🆘 Ainda Não Funcionou?

### Erro: "relation institutions does not exist"

**Significa:** A tabela `institutions` não foi criada no banco.

**Solução:** Você precisa executar o schema completo do banco primeiro.

### Script executou mas erro persiste

**Solução:** Limpe o cache do navegador:
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### Verificar diagnóstico completo

Execute: [`DIAGNOSTIC.sql`](./DIAGNOSTIC.sql) e veja se há problemas.

---

## 📚 Documentação Relacionada

- [`START_HERE.md`](./START_HERE.md) - Guia completo de setup
- [`ERROR_GUIDE.md`](./ERROR_GUIDE.md) - Guia geral de erros
- [`EXECUTE_NOW.sql`](./EXECUTE_NOW.sql) - Script atualizado
- [`SUPABASE_VISUAL_GUIDE.md`](./SUPABASE_VISUAL_GUIDE.md) - Tutorial visual

---

## 💡 Por Que As Instituições Precisam Estar No Banco?

**Design da aplicação:**

1. Frontend mostra lista de instituições no select
2. Usuário escolhe uma (ex: "PUCRS")
3. Frontend envia o **nome** para o servidor
4. Servidor busca no banco: `SELECT id FROM institutions WHERE name = 'PUCRS'`
5. Se encontrar → usa o ID para criar a campanha
6. Se **não** encontrar → retorna "Institution not found"

**Alternativas consideradas mas não implementadas:**
- ❌ Frontend enviar ID direto (não confiável)
- ❌ Criar instituição automaticamente (dados inconsistentes)
- ✅ **Pré-popular banco com instituições fixas** ← Solução implementada

---

**Tempo para resolver: 1 minuto** ⏱️

Execute `EXECUTE_NOW.sql` agora! 👈
