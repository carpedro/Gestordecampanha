# 🔧 Última Correção Aplicada

**Data:** Agora mesmo  
**Problema:** Erro "Institution not found" ao criar campanhas

---

## ❌ Erro Identificado

```
Error creating campaign: {"error":"Institution not found"}
Error saving campaign: Error: Falha ao criar iniciativa
```

---

## ✅ Causa Raiz

O script `EXECUTE_NOW.sql` criava o usuário sistema e ajustava constraints, mas **não criava as instituições de ensino**. 

Quando o usuário tentava criar uma campanha:
1. Frontend enviava nome da instituição (ex: "PUCRS")
2. Servidor buscava no banco: `SELECT id FROM institutions WHERE name = 'PUCRS'`
3. ❌ **Não encontrava** → Retornava erro "Institution not found"

---

## 🔧 Correções Aplicadas

### 1. Scripts SQL Atualizados

**Arquivos modificados:**
- ✅ `EXECUTE_NOW.sql` - Adicionada seção #4 com 8 instituições
- ✅ `quick_fix.sql` - Adicionada seção #4 com 8 instituições

**O que foi adicionado:**
```sql
-- 4. CRIAR INSTITUIÇÕES (necessário para criar campanhas)
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

### 2. Mensagens de Erro Melhoradas

**Arquivo modificado:**
- ✅ `/supabase/functions/server/index.tsx` (2 localizações)

**Antes:**
```javascript
if (!institution) {
  return c.json({ error: 'Institution not found' }, 400);
}
```

**Depois:**
```javascript
if (!institution) {
  console.error('Institution not found:', body.institution, instError);
  return c.json({ 
    error: `🏫 Instituição "${body.institution}" não encontrada. Execute /EXECUTE_NOW.sql no Supabase para criar as instituições. Veja /INSTITUTION_ERROR_FIX.md`,
    errorCode: 'INSTITUTION_NOT_FOUND',
    institutionRequested: body.institution
  }, 400);
}
```

**Benefícios:**
- Mensagem clara em português
- Instrução de como resolver
- Link para documentação específica
- Mostra qual instituição foi solicitada
- Código de erro estruturado

### 3. Documentação Criada/Atualizada

**Novos arquivos:**
- ✅ `INSTITUTION_ERROR_FIX.md` - Guia específico para este erro

**Arquivos atualizados:**
- ✅ `START_HERE.md` - Mencionado que cria 8 instituições
- ✅ `ERROR_GUIDE.md` - Adicionado erro "Institution not found"
- ✅ `FINAL_SOLUTION.md` - Adicionada seção #4 no script
- ✅ `INDEX.md` - Incluído INSTITUTION_ERROR_FIX.md
- ✅ `README.md` - Destaque para erro de instituição

---

## 🎯 Para o Usuário Executar

### Se Você Ainda NÃO Executou Nenhum Script

✅ Execute: `EXECUTE_NOW.sql` (versão atualizada)

→ Já inclui tudo: usuário sistema + constraints + instituições

### Se Você JÁ Executou EXECUTE_NOW.sql (versão antiga)

❌ A versão antiga não tinha as instituições!

✅ Execute novamente: `EXECUTE_NOW.sql` (versão nova)

→ O script tem `ON CONFLICT DO NOTHING` → É seguro executar múltiplas vezes

### Solução Alternativa (Apenas Instituições)

Se preferir adicionar apenas as instituições sem executar todo o script:

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

## ✅ Verificação

### Testar Se As Instituições Foram Criadas

SQL:
```sql
SELECT id, name FROM institutions ORDER BY sort_order;
```

**Resultado esperado:** 8 linhas

### Testar Criação de Campanha

1. Abrir app
2. Clicar em "Nova Campanha"
3. Preencher:
   - Nome: "Teste"
   - Instituição: "PUCRS"
   - Descrição: (mínimo 140 caracteres)
   - Datas: Hoje → Amanhã
4. Salvar

**Resultado esperado:** ✅ Campanha criada com sucesso!

---

## 📊 Resumo das Mudanças

| Componente | Mudança | Status |
|------------|---------|--------|
| EXECUTE_NOW.sql | + Seção #4 (instituições) | ✅ Atualizado |
| quick_fix.sql | + Seção #4 (instituições) | ✅ Atualizado |
| Server (index.tsx) | Mensagem de erro melhorada | ✅ Implementado |
| INSTITUTION_ERROR_FIX.md | Guia novo criado | ✅ Criado |
| Outros .md | Referências atualizadas | ✅ Atualizados |

---

## 🎉 Resultado

Agora quando o usuário executar `EXECUTE_NOW.sql`:

1. ✅ Cria usuário sistema
2. ✅ Remove constraints
3. ✅ Torna colunas nullable
4. ✅ **Cria 8 instituições de ensino**

E se algo der errado:
- ✅ Mensagem de erro clara
- ✅ Instrução de como resolver
- ✅ Link para documentação

---

**Tempo total para implementar:** ~15 minutos  
**Tempo para usuário resolver:** 1 minuto (executar script atualizado)

---

## 📚 Links Úteis

- [`INSTITUTION_ERROR_FIX.md`](./INSTITUTION_ERROR_FIX.md) - Guia específico
- [`EXECUTE_NOW.sql`](./EXECUTE_NOW.sql) - Script atualizado
- [`START_HERE.md`](./START_HERE.md) - Guia completo de setup
- [`ERROR_GUIDE.md`](./ERROR_GUIDE.md) - Guia geral de erros

---

✅ **Correção completa e pronta para uso!**
