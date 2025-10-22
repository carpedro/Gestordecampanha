# 📁 Arquivos Importantes do Projeto

## 🔧 Configuração e Setup

### `SETUP_DATABASE.sql` ⭐⭐⭐
**O QUE É**: Script SQL completo que cria toda estrutura do banco de dados  
**QUANDO USAR**: No início do projeto, executar no Supabase SQL Editor  
**IMPORTÂNCIA**: CRÍTICO - Sem isso, nada funciona!

### `GUIA_DE_INSTALACAO.md` ⭐⭐⭐
**O QUE É**: Documentação completa passo a passo  
**QUANDO USAR**: Para configurar o projeto pela primeira vez  
**IMPORTÂNCIA**: ESSENCIAL para iniciantes

### `INICIO_RAPIDO.md` ⭐⭐
**O QUE É**: Guia resumido em 5 passos  
**QUANDO USAR**: Se você já tem experiência com Supabase  
**IMPORTÂNCIA**: Útil para setup rápido

### `src/utils/supabase/info.example.tsx` ⭐⭐⭐
**O QUE É**: Template de configuração do Supabase  
**QUANDO USAR**: Copiar para `info.tsx` e preencher com suas credenciais  
**IMPORTÂNCIA**: CRÍTICO - Frontend não funciona sem isso

## 🎨 Frontend (React)

### `src/App.tsx`
**O QUE É**: Componente raiz da aplicação  
**FUNÇÃO**: Gerencia rotas e layout principal

### `src/components/CampaignsApp.tsx` ⭐⭐
**O QUE É**: Componente principal do gestor de campanhas  
**FUNÇÃO**: Lista, filtra e gerencia campanhas  
**FEATURES**: 
- Visualizações: Calendário, Gantt, Tabela, Cards
- Filtros avançados
- Criação/Edição/Exclusão

### `src/components/CampaignDetailPage.tsx`
**O QUE É**: Página de detalhes de uma campanha  
**FUNÇÃO**: Visualizar/editar campanha específica  
**FEATURES**: 
- Edição inline
- Upload de anexos
- Comentários
- Histórico de alterações

### `src/components/CampaignForm.tsx`
**O QUE É**: Formulário de criação/edição de campanha  
**FUNÇÃO**: Modal com todos os campos da campanha

## 🔌 Backend (Supabase Edge Functions)

### `src/supabase/functions/server/index.tsx` ⭐⭐⭐
**O QUE É**: Edge Function principal (API Backend)  
**FUNÇÃO**: Processa todas requisições (CRUD de campanhas, comentários, anexos)  
**ENDPOINTS PRINCIPAIS**:
- `GET /campaigns` - Listar campanhas
- `POST /campaigns` - Criar campanha
- `PUT /campaigns/:id` - Atualizar campanha
- `DELETE /campaigns/:id` - Excluir campanha
- `POST /attachments/upload` - Upload de arquivos
- `POST /campaigns/:id/comments` - Criar comentário

**⚠️ IMPORTANTE**: Este arquivo deve ser copiado para `supabase/functions/make-server-a1f709fc/index.ts` antes do deploy

## 📦 Services (Integração)

### `src/utils/campaignService.ts` ⭐⭐
**O QUE É**: Service que conecta frontend com Edge Function  
**FUNÇÃO**: Abstrai chamadas HTTP para a API

### `src/utils/supabase/client.ts`
**O QUE É**: Cliente Supabase singleton  
**FUNÇÃO**: Gerencia conexão com Supabase

## 📊 Types (TypeScript)

### `src/types/campaign.ts` ⭐
**O QUE É**: Definições de tipos para campanhas  
**CONTÉM**: 
- `Campaign` - Estrutura completa de uma campanha
- `CampaignFormData` - Dados do formulário
- `Institution` - Enum de instituições
- `CampaignStatus` - Status possíveis

### `src/types/user.ts`
**O QUE É**: Definições de tipos para usuários  
**CONTÉM**: 
- `User` - Estrutura de usuário
- `UserRole` - Papéis (admin, editor, viewer)

### `src/types/comment.ts`
**O QUE É**: Definições de tipos para comentários

### `src/types/attachment.ts`
**O QUE É**: Definições de tipos para anexos

## 🎨 UI Components

### `src/components/ui/*` ⭐
**O QUE É**: Componentes reutilizáveis baseados em shadcn/ui  
**PRINCIPAIS**:
- `button.tsx` - Botões
- `dialog.tsx` - Modais
- `table.tsx` - Tabelas
- `calendar.tsx` - Calendário
- `tabs.tsx` - Abas

## 📝 Documentação Legada

Os arquivos abaixo são documentação antiga e podem ser ignorados ou removidos:

- `src/BEFORE_AFTER.md`
- `src/CRITICAL_FIX_SUMMARY.md`
- `src/DATABASE_CONNECTIVITY.md`
- `src/database_fix.sql`
- `src/DEPLOYMENT_CHECKLIST.md`
- `src/DIAGNOSTIC.sql`
- `src/ERROR_GUIDE.md`
- `src/EXECUTE_NOW.sql` (substituído por `SETUP_DATABASE.sql`)
- `src/FEATURES.md`
- `src/FINAL_SOLUTION.md`
- `src/FIX_DATABASE_NOW.md`
- `src/FLUXO_COMPLETO.md`
- `src/INDEX.md`
- `src/INSTITUTION_ERROR_FIX.md`
- `src/LATEST_FIX_SUMMARY.md`
- `src/MOBILE_UX.md`
- `src/quick_fix.sql`
- `src/QUICK_TEST.md`
- `src/README.md`
- `src/RESUMO_CONECTIVIDADE.md`
- `src/SETUP_CHECKLIST.md`
- `src/SOLUTION_SUMMARY.md`
- `src/SQL_SCRIPTS_README.md`
- `src/START_HERE.md`
- `src/SUPABASE_VISUAL_GUIDE.md`

## 🗑️ Sugestão de Limpeza

Você pode remover com segurança:

```bash
# Remover documentação antiga
rm src/*.md
rm src/*.sql

# Manter apenas estes na raiz:
# - SETUP_DATABASE.sql
# - GUIA_DE_INSTALACAO.md
# - INICIO_RAPIDO.md
# - ARQUIVOS_IMPORTANTES.md (este arquivo)
```

## 📋 Fluxo de Desenvolvimento

### Para Adicionar Nova Feature:

1. **Backend**: Adicionar endpoint em `src/supabase/functions/server/index.tsx`
2. **Service**: Adicionar método em `src/utils/[nome]Service.ts`
3. **Types**: Adicionar tipos em `src/types/[nome].ts`
4. **Frontend**: Criar componente em `src/components/`
5. **Deploy**: `supabase functions deploy make-server-a1f709fc`

### Para Modificar Banco:

1. **SQL**: Criar migration no Supabase SQL Editor
2. **Types**: Atualizar tipos TypeScript correspondentes
3. **Backend**: Ajustar queries na Edge Function
4. **Frontend**: Ajustar componentes se necessário

## 🆘 Troubleshooting

Se algo não funcionar:

1. ✅ Verificar `SETUP_DATABASE.sql` foi executado
2. ✅ Verificar `info.tsx` tem credenciais corretas
3. ✅ Verificar Edge Function foi deployada
4. ✅ Verificar variáveis de ambiente da Edge Function
5. ✅ Verificar logs: `supabase functions logs make-server-a1f709fc`

## 📞 Onde Encontrar O Quê

| Preciso de... | Arquivo |
|--------------|---------|
| Criar tabelas no banco | `SETUP_DATABASE.sql` |
| Configurar projeto | `GUIA_DE_INSTALACAO.md` |
| Setup rápido | `INICIO_RAPIDO.md` |
| Credenciais Supabase | `src/utils/supabase/info.tsx` |
| API Backend | `src/supabase/functions/server/index.tsx` |
| Componente principal | `src/components/CampaignsApp.tsx` |
| Tipos TypeScript | `src/types/*.ts` |
| UI Components | `src/components/ui/*.tsx` |

---

💡 **Dica**: Se você é novo no projeto, comece lendo `INICIO_RAPIDO.md` ou `GUIA_DE_INSTALACAO.md`

