# ✅ Checklist de Configuração - Campanhas EdTech

## 🚨 Ação Urgente Necessária

### Status Atual
- ✅ Código do servidor → PRONTO
- ⏳ Banco de dados → **AGUARDANDO SUA AÇÃO**

---

## 📋 O Que Fazer AGORA

### [ ] Passo 1: Abrir Supabase
```
https://supabase.com/dashboard
→ Selecione seu projeto
→ Menu lateral: SQL Editor
→ Clique em "New query"
```

### [ ] Passo 2: Escolher Script
Escolha UMA opção:

**Opção A - Rápida** ⚡ (RECOMENDADO)
- [ ] Copie TODO o conteúdo de `/quick_fix.sql`
- [ ] Cole no SQL Editor
- [ ] Clique em "Run" (ou Ctrl/Cmd + Enter)
- [ ] Aguarde mensagem de sucesso (~5 segundos)

**Opção B - Completa** 🔧 (Opcional)
- [ ] Copie TODO o conteúdo de `/database_fix.sql`
- [ ] Cole no SQL Editor
- [ ] Clique em "Run"
- [ ] Aguarde resultados (~30 segundos)

### [ ] Passo 3: Verificar
Execute `/DIAGNOSTIC.sql` para confirmar:
- [ ] Copie TODO o conteúdo de `/DIAGNOSTIC.sql`
- [ ] Cole no SQL Editor
- [ ] Clique em "Run"
- [ ] Verifique se vê: "✅✅✅ TUDO OK! Sistema pronto para uso!"

### [ ] Passo 4: Testar
- [ ] Volte para a aplicação
- [ ] Clique em "+ Nova Campanha"
- [ ] Preencha nome e instituição
- [ ] Salve
- [ ] ✅ Se funcionar sem erros, está PRONTO!

---

## 🔍 Solução de Problemas

### Erro Persiste Após Executar Script?

1. **Verifique se o script foi executado completamente**
   - Deve mostrar "Query executed successfully" ou similar
   - Não deve haver erros em vermelho

2. **Execute o diagnóstico**
   - Use `/DIAGNOSTIC.sql`
   - Procure por ❌ nos resultados
   - Se encontrar, execute `/quick_fix.sql` novamente

3. **Limpe o cache do navegador**
   - Às vezes o frontend precisa de refresh
   - Pressione Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)

### Ainda Com Problemas?

Veja os logs detalhados:
- No navegador: Abra DevTools (F12) → Console
- No Supabase: Logs → Edge Functions
- Copie a mensagem de erro completa

---

## 📊 Status Esperado Após Setup

```
✅ Usuário sistema criado
✅ Foreign keys removidas
✅ Colunas de usuário nullable
✅ Registros existentes atualizados
✅ Servidor enviando SYSTEM_USER_ID
```

## 🎯 Resultado Final

Depois de completar todos os passos:
- ✅ Criar campanhas sem erros
- ✅ Adicionar comentários
- ✅ Upload de anexos
- ✅ Editar inline
- ✅ Visualizar histórico
- ✅ Filtros e visualizações
- ✅ **Sistema 100% funcional!**

---

## ⏱️ Tempo Total Estimado

- Script rápido: **30 segundos**
- Script completo: **2 minutos**
- Teste final: **30 segundos**

**Total: 1-3 minutos para setup completo!**

---

## 📚 Documentação de Apoio

| Documento | Para Que Serve |
|-----------|----------------|
| `CRITICAL_FIX_SUMMARY.md` | Entender o problema em detalhes |
| `FIX_DATABASE_NOW.md` | Guia passo a passo completo |
| `quick_fix.sql` | **Script de correção rápida** |
| `database_fix.sql` | Script completo com dados iniciais |
| `DIAGNOSTIC.sql` | Verificar se tudo está OK |
| `QUICK_TEST.md` | Testar funcionalidades após setup |

---

**💡 Dica**: Execute primeiro o `/quick_fix.sql`, teste o sistema, e depois (se quiser) execute o `/database_fix.sql` para adicionar dados iniciais e recursos extras.
