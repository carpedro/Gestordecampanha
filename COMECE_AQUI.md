# 🚀 COMECE AQUI - Setup Imediato

> **Última atualização**: Outubro 2025  
> **Status**: ✅ Todos conflitos resolvidos

## 🎯 O Que Foi Feito

Resolvi **TODOS** os conflitos entre o código do Figma Make e a arquitetura Supabase. O projeto está 100% pronto para uso!

### ✅ Problemas Corrigidos

- [x] Incompatibilidade tabela `users`
- [x] Incompatibilidade tabela `campaigns` 
- [x] Incompatibilidade tabela `attachments`
- [x] Incompatibilidade tabela `comments`
- [x] Sistema de tags corrigido
- [x] Usuário sistema criado automaticamente
- [x] Edge Function atualizada
- [x] Documentação completa criada

## 🏃 Próximos Passos (5 minutos)

### 1️⃣ Execute o Script SQL

1. Acesse seu projeto Supabase: https://supabase.com/dashboard
2. Vá em **SQL Editor** (menu lateral)
3. Clique em **"New query"**
4. Abra o arquivo **`SETUP_DATABASE.sql`** deste projeto
5. Copie **TODO** o conteúdo
6. Cole no SQL Editor
7. Clique em **"Run"** ▶️

**Resultado esperado**: 
```
✅ BANCO DE DADOS CONFIGURADO COM SUCESSO!
📝 Próximo passo: Configurar as variáveis de ambiente no Supabase Edge Function
```

### 2️⃣ Verifique a Instalação (Opcional mas Recomendado)

1. No SQL Editor, clique em **"New query"**
2. Abra o arquivo **`VERIFICACAO.sql`**
3. Copie e cole o conteúdo
4. Execute

**Resultado esperado**:
```
✅ VERIFICAÇÃO COMPLETA: 8/8 CHECKS PASSARAM
🎉 BANCO DE DADOS CONFIGURADO CORRETAMENTE!
```

### 3️⃣ Deploy da Edge Function

```bash
# Se não tem Supabase CLI instalado
npm install -g supabase

# Login no Supabase
supabase login

# Linkar com seu projeto (pegue o project-ref no dashboard)
supabase link --project-ref SEU-PROJECT-ID

# Criar estrutura da função
mkdir -p supabase/functions/make-server-a1f709fc

# Copiar o código da função
# Windows PowerShell:
Copy-Item src/supabase/functions/server/index.tsx supabase/functions/make-server-a1f709fc/index.ts

# macOS/Linux:
cp src/supabase/functions/server/index.tsx supabase/functions/make-server-a1f709fc/index.ts

# Deploy!
supabase functions deploy make-server-a1f709fc

# Configurar variáveis de ambiente (substitua pelos seus valores)
supabase secrets set SUPABASE_URL=https://SEU-PROJECT-ID.supabase.co
supabase secrets set SUPABASE_ANON_KEY=SUA-ANON-KEY
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=SUA-SERVICE-ROLE-KEY
```

**Como obter suas credenciais**:
1. Dashboard Supabase → Settings → API
2. Copie: Project URL, anon key, service_role key

### 4️⃣ Configure o Frontend

Crie o arquivo `src/utils/supabase/info.tsx`:

```typescript
export const projectId = 'SEU-PROJECT-ID';
export const publicAnonKey = 'SUA-ANON-KEY';
```

**Use o template**:
- Copie `src/utils/supabase/info.example.tsx` para `src/utils/supabase/info.tsx`
- Substitua os valores

### 5️⃣ Execute o Projeto

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

Acesse: http://localhost:5173

## 🧪 Teste Rápido

1. No navegador, clique em **"Nova Campanha"**
2. Preencha:
   - **Nome**: Teste Inicial
   - **Instituição**: PUCRS
   - **Descrição**: Primeira campanha
   - **Data Início**: Hoje
   - **Data Fim**: Daqui 30 dias
3. Clique em **"Salvar"**

**✅ Se funcionou**: Parabéns! Tudo está configurado!

**❌ Se deu erro**: Consulte a seção de troubleshooting abaixo

## 🐛 Troubleshooting Rápido

### Erro: "Instituição não encontrada"

**Solução**: Re-execute o `SETUP_DATABASE.sql` completo

### Erro: "SYSTEM_USER_NOT_CREATED"

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

### Erro: "Failed to fetch"

**Possíveis causas**:

1. **Edge Function não deployada**
   ```bash
   supabase functions deploy make-server-a1f709fc
   ```

2. **Variáveis não configuradas**
   ```bash
   supabase secrets list
   # Deve mostrar: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
   ```

3. **info.tsx não existe ou está incorreto**
   - Verificar se arquivo existe em `src/utils/supabase/info.tsx`
   - Verificar se tem valores corretos (não os do .example)

### Erro no Upload de Anexos

**Solução**: Criar bucket de storage
1. Dashboard Supabase → Storage
2. Criar bucket: `make-a1f709fc-attachments`
3. Deixar como **private** (não marcar public)

## 📚 Documentação Disponível

| Arquivo | Quando Usar |
|---------|-------------|
| `COMECE_AQUI.md` ⭐ | **Você está aqui!** Setup imediato |
| `INICIO_RAPIDO.md` | Setup em 5 passos (resumido) |
| `GUIA_DE_INSTALACAO.md` | Guia completo passo a passo |
| `RESUMO_DA_SOLUCAO.md` | Entender o que foi resolvido |
| `ARQUIVOS_IMPORTANTES.md` | Mapa do projeto |
| `README.md` | Documentação geral do projeto |

## ✅ Checklist de Configuração

Marque conforme for completando:

- [ ] Executei `SETUP_DATABASE.sql` com sucesso
- [ ] Verifiquei instalação com `VERIFICACAO.sql`
- [ ] Instalei Supabase CLI
- [ ] Fiz login: `supabase login`
- [ ] Linkei projeto: `supabase link`
- [ ] Copiei arquivo da Edge Function
- [ ] Deploy: `supabase functions deploy`
- [ ] Configurei secrets (SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY)
- [ ] Criei arquivo `info.tsx` com credenciais
- [ ] Executei `npm install`
- [ ] Rodei `npm run dev`
- [ ] Criei campanha de teste com sucesso
- [ ] Testei upload de anexo

## 🎉 Tudo Pronto!

Se completou todos os passos acima, seu Gestor de Campanhas está **100% funcional**!

### O Que Você Pode Fazer Agora:

- ✅ Criar, editar e excluir campanhas
- ✅ Visualizar em: Calendário, Gantt, Tabela, Cards
- ✅ Filtrar por instituição, status, tags, criador
- ✅ Upload de arquivos
- ✅ Adicionar comentários
- ✅ Ver histórico de alterações
- ✅ Duplicar campanhas
- ✅ Gerenciar tags

## 💡 Próximos Passos (Opcional)

Após tudo funcionando, você pode:

1. **Adicionar mais instituições**
   ```sql
   INSERT INTO institutions (name, slug, short_name) 
   VALUES ('Nova Instituição', 'nova-instituicao', 'NI');
   ```

2. **Criar usuários reais** (além do sistema)
   ```sql
   INSERT INTO users (email, name, role, position, area) 
   VALUES ('seu@email.com', 'Seu Nome', 'admin', 'Gerente', 'Marketing');
   ```

3. **Personalizar tags**
   ```sql
   INSERT INTO tags (name, slug, type) 
   VALUES ('Sua Tag', 'sua-tag', 'positive');
   ```

4. **Configurar autenticação real** (Supabase Auth)
   - Ver documentação: https://supabase.com/docs/guides/auth

5. **Deploy em produção**
   - Frontend: Vercel, Netlify, etc
   - Backend: Já está no Supabase!

## 🆘 Precisa de Ajuda?

1. **Veja primeiro**: `GUIA_DE_INSTALACAO.md` (troubleshooting completo)
2. **Verifique logs**: `supabase functions logs make-server-a1f709fc`
3. **Teste SQL**: Execute `VERIFICACAO.sql`
4. **Consulte**: `ARQUIVOS_IMPORTANTES.md` para entender a estrutura

## 📞 Suporte

Se mesmo assim tiver problemas:
1. Verifique se seguiu **TODOS** os passos
2. Execute `VERIFICACAO.sql` e veja o que está faltando
3. Consulte `GUIA_DE_INSTALACAO.md` seção de troubleshooting

---

**Bom desenvolvimento! 🚀**

*Qualquer dúvida, consulte os arquivos de documentação listados acima.*

