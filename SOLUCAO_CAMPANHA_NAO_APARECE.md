# 🔍 SOLUÇÃO: Campanha não aparece no site

## ✅ DIAGNÓSTICO REALIZADO

Testei a API e descobri o seguinte:

```
Status: 200 ✅
Resposta: Vazia
```

### O que isso significa:

1. ✅ **Edge Function está deployada e funcionando corretamente**
2. ✅ **API está respondendo sem erros**
3. ❌ **Não há campanhas sendo retornadas do banco de dados**

---

## 🎯 CAUSA PROVÁVEL

A causa mais provável é uma destas:

1. **Banco de dados não foi configurado** (tabelas não existem)
2. **Instituições não foram criadas** (necessário para criar campanhas)
3. **A campanha foi criada mas deu erro** e não foi salva
4. **Banco foi resetado** e perdeu os dados

---

## 🔧 SOLUÇÃO EM 3 PASSOS

### PASSO 1: Verificar e Corrigir o Banco

1. Acesse: **https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw/sql**

2. Clique em **"New query"**

3. Abra o arquivo **`VERIFICAR_E_CORRIGIR_SUPABASE.sql`** que acabei de criar

4. **Copie TODO** o conteúdo

5. **Cole** no SQL Editor

6. Clique em **"Run"** (▶️)

7. **Aguarde** o resultado

#### Resultados Esperados:

```
✅ Todas as tabelas existem (4/4)
✅ Usuário sistema existe
✅ Instituições cadastradas
✅ BANCO PRONTO PARA USO!
```

#### Se aparecer algum ❌:

Execute o **`SETUP_DATABASE.sql`** completo:

1. Abra o arquivo **`SETUP_DATABASE.sql`**
2. Copie **TODO** o conteúdo
3. Cole no SQL Editor
4. Execute
5. Volte e execute o **`VERIFICAR_E_CORRIGIR.sql`** novamente

---

### PASSO 2: Criar uma Campanha de Teste

1. Acesse: **https://campanhas.figma.site/**

2. Clique em **"Nova Campanha"** (botão +)

3. Preencha:
   - **Nome**: `Teste - [Seu Nome]`
   - **Instituição**: Selecione `PUCRS`
   - **Descrição**: `Testando sistema`
   - **Data Início**: Hoje
   - **Data Fim**: Daqui 30 dias
   - **Status**: Deixe como está

4. Clique em **"Salvar"**

5. **IMPORTANTE**: Abra o Console do navegador (F12) e verifique se aparecem erros

---

### PASSO 3: Verificar se Apareceu

1. Aguarde 2-3 segundos

2. A campanha deve aparecer na lista

3. **Se NÃO aparecer:**
   - Pressione **F5** para recarregar a página
   - Verifique se a campanha foi salva no banco (veja abaixo)

---

## 🔎 VERIFICAÇÃO ADICIONAL: Ver Campanhas no Banco

Execute este SQL para ver as campanhas diretamente no banco:

```sql
SELECT 
    c.id,
    c.name as campanha,
    i.name as instituicao,
    c.status,
    c.created_at,
    c.slug
FROM campaigns c
LEFT JOIN institutions i ON c.institution_id = i.id
ORDER BY c.created_at DESC
LIMIT 10;
```

**Se a campanha APARECER aqui mas NÃO no site:**
→ O problema é no frontend ou cache

**Se NÃO aparecer:**
→ A campanha não foi salva (erro ao criar)

---

## 🐛 TROUBLESHOOTING

### Problema 1: "Instituição não encontrada"

**Solução:**
```sql
SELECT * FROM institutions;
```

Se não aparecer nenhuma, execute:
```sql
INSERT INTO institutions (name, initials, is_active) VALUES
    ('Pontifícia Universidade Católica do Rio Grande do Sul', 'PUCRS', true),
    ('Centro Universitário Ritter dos Reis', 'UniRitter', true);
```

---

### Problema 2: Erro no Console "Failed to fetch"

**Causa:** Edge Function não está acessível

**Solução:**
1. Verifique se a Edge Function existe
2. Verifique os Secrets (SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY)

---

### Problema 3: Campanha aparece por 1 segundo e some

**Causa:** Erro ao buscar detalhes ou cache

**Solução:**
1. Limpe o cache do navegador (Ctrl+Shift+Del)
2. Recarregue com Ctrl+F5
3. Tente em modo anônimo

---

### Problema 4: "SYSTEM_USER_NOT_CREATED"

**Solução:**
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

---

## 📊 CHECKLIST COMPLETO

Marque cada item após completar:

- [ ] ✅ Teste de API retornou Status 200
- [ ] ✅ Executei VERIFICAR_E_CORRIGIR.sql
- [ ] ✅ Banco retornou "BANCO PRONTO PARA USO"
- [ ] ✅ Há instituições cadastradas
- [ ] ✅ Usuário sistema existe
- [ ] ✅ Criei uma campanha de teste
- [ ] ✅ Campanha aparece no SQL
- [ ] ✅ Campanha aparece no site

---

## 🎯 TESTE RÁPIDO DA API

Para testar se a API está retornando campanhas, execute:

```powershell
.\testar-api-simples.ps1
```

Deve mostrar:
- Status: 200
- Resposta: JSON com array de campanhas

---

## 📞 PRÓXIMOS PASSOS

1. **Execute o PASSO 1** (VERIFICAR_E_CORRIGIR.sql)
2. **Me informe o resultado** (copie e cole a saída)
3. **Execute o PASSO 2** (criar campanha de teste)
4. **Me diga se apareceu** ou se houve algum erro

Com essas informações, poderei identificar exatamente qual é o problema! 🎯

