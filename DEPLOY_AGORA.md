# 🚀 DEPLOY AGORA - Método Mais Rápido

## ✅ O Que Já Está Pronto

- ✅ Arquivo `info.tsx` configurado
- ✅ Edge Function preparada em `supabase/functions/make-server-a1f709fc/index.ts`
- ✅ Banco de dados pronto para ser configurado

## 🎯 Seus Dados

```
Project ID: jkplbqingkcmjhyogoiw
URL: https://jkplbqingkcmjhyogoiw.supabase.co
```

## 📋 3 Passos para Deploy

### ⚡ PASSO 1: Configurar Banco de Dados (5 min)

1. **Abra**: https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw/sql

2. **Clique** em "New query"

3. **Abra** o arquivo `SETUP_DATABASE.sql` deste projeto no seu editor

4. **Copie TUDO** (Ctrl+A, Ctrl+C)

5. **Cole** no SQL Editor do Supabase

6. **Clique** em "Run" (▶️)

7. **Aguarde** aparecer:
   ```
   ✅ BANCO DE DADOS CONFIGURADO COM SUCESSO!
   ```

✅ **Pronto!** Banco configurado.

---

### ⚡ PASSO 2: Deploy da Edge Function (3 min)

#### Opção A: Pelo Dashboard (Mais Fácil)

1. **Abra**: https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw/functions

2. **Clique** em "Create a new function" (botão verde)

3. **Preencha**:
   - Name: `make-server-a1f709fc`
   - Clique em "Create function"

4. **Copie o código**:
   - Abra o arquivo: `supabase/functions/make-server-a1f709fc/index.ts`
   - Copie TODO o conteúdo

5. **Cole** no editor do Supabase

6. **Clique** em "Deploy" ou "Save"

7. **Configure Secrets** (ainda na mesma página):
   - Procure por "Environment Variables" ou "Secrets"
   - Adicione estas 3 variáveis:

```
Nome: SUPABASE_URL
Valor: https://jkplbqingkcmjhyogoiw.supabase.co

Nome: SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcGxicWluZ2tjbWpoeW9nb2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDU1OTUsImV4cCI6MjA3NjIyMTU5NX0.UTs7ArhP1-znaj_SEku7KWtQ_15S6uYxbuL0rxjwzQU

Nome: SUPABASE_SERVICE_ROLE_KEY
Valor: [PEGAR NO PRÓXIMO PASSO]
```

8. **Obter SERVICE_ROLE_KEY**:
   - Abra: https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw/settings/api
   - Role em "Project API keys"
   - Copie o valor de **"service_role"** (⚠️ SECRETO!)
   - Cole na variável acima

✅ **Pronto!** Edge Function deployada.

---

### ⚡ PASSO 3: Rodar Aplicação (1 min)

No terminal do seu projeto:

```powershell
# Instalar dependências
npm install

# Rodar aplicação
npm run dev
```

Acesse: http://localhost:5173

---

## 🧪 Teste

1. Clique em **"Nova Campanha"**
2. Preencha:
   - Nome: `Teste Deploy`
   - Instituição: `PUCRS`
   - Descrição: `Testando`
   - Data Início: hoje
   - Data Fim: daqui 30 dias
3. Clique em **"Salvar"**

**✅ Funcionou?** Parabéns! Está tudo deployado! 🎉

**❌ Deu erro?** Veja abaixo:

---

## 🐛 Erros Comuns

### "Instituição não encontrada"

**Solução**: Execute o SETUP_DATABASE.sql novamente (Passo 1)

### "SYSTEM_USER_NOT_CREATED"

**Solução**: Execute no SQL Editor:

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

### "Failed to fetch"

**Causas possíveis**:
1. Edge Function não foi deployada → Refaça Passo 2
2. Secrets não foram configurados → Verifique as 3 variáveis
3. Nome da função está errado → Deve ser exatamente: `make-server-a1f709fc`

### Frontend não carrega

1. Verificar `src/utils/supabase/info.tsx` existe
2. Verificar valores estão corretos (Project ID e Anon Key)
3. Recarregar página (Ctrl+F5)

---

## 🔍 Verificação Completa

Para ter certeza que tudo está OK, execute no SQL Editor:

1. Abra: https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw/sql
2. Cole o conteúdo de `VERIFICACAO.sql`
3. Execute
4. Deve mostrar: `✅ VERIFICAÇÃO COMPLETA: 8/8 CHECKS PASSARAM`

---

## 📝 Checklist Rápido

- [ ] PASSO 1: `SETUP_DATABASE.sql` executado com sucesso
- [ ] PASSO 2: Edge Function criada e deployada
- [ ] PASSO 2.1: 3 secrets configurados
- [ ] PASSO 3: `npm install` executado
- [ ] PASSO 3.1: `npm run dev` rodando
- [ ] TESTE: Campanha criada com sucesso

---

## 🎉 Pronto!

Se todos os itens acima estão ✅, seu sistema está **100% deployado e funcional**!

### O que você pode fazer agora:

- ✅ Criar, editar, excluir campanhas
- ✅ Ver em: Calendário, Gantt, Tabela, Cards
- ✅ Upload de arquivos
- ✅ Adicionar comentários
- ✅ Filtrar campanhas
- ✅ Duplicar campanhas

---

## 📚 Documentação Adicional

- **Uso completo**: `README.md`
- **Troubleshooting detalhado**: `GUIA_DE_INSTALACAO.md`
- **Entender o projeto**: `ARQUIVOS_IMPORTANTES.md`

---

**Tempo total de deploy**: ~10 minutos

**Dificuldade**: ⭐⭐ (Fácil)

**Precisa de CLI?**: ❌ Não! Tudo pelo dashboard

