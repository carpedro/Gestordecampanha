# 📊 Scripts SQL - Guia de Uso

## 🎯 Qual Script Executar?

### Para Novos Usuários (Primeira Vez)

Execute **um** dos scripts abaixo no Supabase SQL Editor:

| Script | Tempo | Recomendação | O Que Faz |
|--------|-------|--------------|-----------|
| `quick_fix.sql` | ⚡ 30s | **ESCOLHA ESTE** | Apenas o essencial para funcionar |
| `database_fix.sql` | 🔧 2min | Opcional | Script completo com dados iniciais |

### Para Diagnóstico

| Script | Quando Usar |
|--------|-------------|
| `DIAGNOSTIC.sql` | Depois de executar um dos scripts acima para verificar se está tudo OK |

---

## 📋 Como Executar

### 1. Acessar Supabase
```
1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto
3. Menu lateral → SQL Editor
4. Clique em "New query"
```

### 2. Copiar e Colar
```
1. Abra um dos arquivos .sql abaixo
2. Copie TODO o conteúdo (Ctrl/Cmd + A, depois Ctrl/Cmd + C)
3. Cole no SQL Editor (Ctrl/Cmd + V)
```

### 3. Executar
```
1. Clique em "Run" (ou pressione Ctrl/Cmd + Enter)
2. Aguarde a mensagem de sucesso
3. Verifique se não há erros em vermelho
```

---

## 📄 Descrição dos Scripts

### `quick_fix.sql` ⚡ (RECOMENDADO)

**Tamanho**: ~50 linhas  
**Tempo**: 30 segundos  
**Propósito**: Correção rápida focada apenas no erro atual

**O que faz:**
1. ✅ Cria usuário sistema (`00000000-0000-0000-0000-000000000000`)
2. ✅ Remove foreign key constraints (sistema sem autenticação)
3. ✅ Torna colunas de usuário nullable
4. ✅ Atualiza registros existentes com ID do sistema

**Quando usar:**
- Primeira vez configurando o sistema
- Quer começar a usar o mais rápido possível
- Não precisa de dados iniciais

**Resultado:**
- Sistema funcionando imediatamente
- Pode criar campanhas sem erros
- Banco mínimo configurado

---

### `database_fix.sql` 🔧 (COMPLETO)

**Tamanho**: ~450 linhas  
**Tempo**: 2 minutos  
**Propósito**: Configuração completa do banco com todos os recursos

**O que faz:**
1. ✅ Tudo do `quick_fix.sql` +
2. ✅ Remove triggers antigos problemáticos
3. ✅ Remove funções antigas
4. ✅ Remove views antigas com referências a usuários
5. ✅ Cria trigger simplificado de auditoria
6. ✅ Cria views otimizadas (campanhas, estatísticas)
7. ✅ Insere 8 instituições de ensino
8. ✅ Insere 18+ tags categorizadas
9. ✅ Executa verificações de integridade
10. ✅ Mostra estatísticas finais

**Quando usar:**
- Quer começar com dados de exemplo
- Precisa das views e triggers otimizados
- Quer um banco completo desde o início

**Resultado:**
- Sistema funcionando com dados iniciais
- 8 instituições prontas para usar
- 18+ tags para categorização
- Views otimizadas para consultas
- Trigger de auditoria ativo

---

### `DIAGNOSTIC.sql` 🔍 (VERIFICAÇÃO)

**Tamanho**: ~170 linhas  
**Tempo**: 10 segundos  
**Propósito**: Verificar se o banco está configurado corretamente

**O que faz:**
1. ✅ Verifica se usuário sistema existe
2. ✅ Verifica se foreign keys foram removidas
3. ✅ Verifica se colunas são nullable
4. ✅ Verifica instituições cadastradas
5. ✅ Verifica tags cadastradas
6. ✅ Lista campanhas com problemas
7. ✅ Lista triggers ativos
8. ✅ Mostra estatísticas gerais
9. ✅ Dá resumo final (OK ou ERRO)

**Quando usar:**
- Depois de executar `quick_fix.sql` ou `database_fix.sql`
- Para confirmar que tudo está funcionando
- Para debugar problemas

**Resultado:**
- Relatório completo do status do banco
- Mensagem final clara: "TUDO OK!" ou "EXECUTE /quick_fix.sql"

---

## 🔄 Ordem Recomendada

### Cenário 1: Setup Rápido
```
1. quick_fix.sql        (executar)
2. DIAGNOSTIC.sql       (verificar)
3. Testar no sistema    (usar)
```

### Cenário 2: Setup Completo
```
1. database_fix.sql     (executar)
2. DIAGNOSTIC.sql       (verificar)
3. Testar no sistema    (usar)
```

### Cenário 3: Já Executou Mas Quer Verificar
```
1. DIAGNOSTIC.sql       (verificar)
2. Se der erro → quick_fix.sql
3. DIAGNOSTIC.sql novamente
```

---

## ⚠️ Perguntas Frequentes

### P: Posso executar os scripts múltiplas vezes?
**R**: Sim! Os scripts são idempotentes (seguros para re-executar).

### P: O que acontece se executar `database_fix.sql` depois de `quick_fix.sql`?
**R**: Funciona normalmente. O `database_fix.sql` vai adicionar os dados extras.

### P: Posso executar só partes do script?
**R**: Não recomendado. Execute o script completo para evitar inconsistências.

### P: O script vai apagar meus dados?
**R**: Não! Os scripts apenas:
- Criam o usuário sistema
- Removem constraints
- Atualizam campos NULL
- Inserem dados iniciais (se ainda não existirem)

### P: Quanto espaço no banco isso vai usar?
**R**: Mínimo! 
- `quick_fix.sql`: ~1KB (apenas 1 usuário)
- `database_fix.sql`: ~50KB (instituições + tags)

---

## 🆘 Solução de Problemas

### Erro: "relation users does not exist"
**Solução**: Você precisa criar as tabelas do banco primeiro. Veja o schema completo no Supabase.

### Erro: "permission denied"
**Solução**: Use uma conexão com privilégios de admin (SERVICE_ROLE_KEY).

### Script não executa completamente
**Solução**: 
1. Verifique se copiou TODO o script
2. Certifique-se de não ter selecionado apenas parte
3. Execute linha por linha se necessário

### Mensagem "Query executed successfully" mas sistema ainda dá erro
**Solução**:
1. Execute `DIAGNOSTIC.sql`
2. Procure por linhas com ❌
3. Se encontrar, execute `quick_fix.sql` novamente
4. Limpe o cache do navegador (Ctrl+Shift+R)

---

## 📚 Documentação Relacionada

- `/SETUP_CHECKLIST.md` - Checklist visual passo a passo
- `/CRITICAL_FIX_SUMMARY.md` - Resumo do problema
- `/FIX_DATABASE_NOW.md` - Guia detalhado
- `/SOLUTION_SUMMARY.md` - Resumo técnico da solução

---

## ✅ Verificação Final

Depois de executar um script, você deve:

1. **Ver mensagens de sucesso** no SQL Editor
2. **Executar DIAGNOSTIC.sql** → ver "✅✅✅ TUDO OK!"
3. **Criar uma campanha** no sistema → funcionar sem erros
4. **Celebrar!** 🎉

---

**💡 Dica Pro**: Execute primeiro o `quick_fix.sql`, teste o sistema, e se precisar de dados iniciais, execute depois o `database_fix.sql`.
