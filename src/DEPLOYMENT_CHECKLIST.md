# ✅ Checklist de Deploy - Campanhas EdTech

## 🎯 Status Geral

| Componente | Status | Ação Necessária |
|------------|--------|-----------------|
| Frontend | ✅ Pronto | Nenhuma |
| Backend/Server | ✅ Pronto | Nenhuma |
| Código sem autenticação | ✅ Completo | Nenhuma |
| **Banco de Dados** | ⚠️ **REQUER ATENÇÃO** | **Executar script SQL** |
| Storage (Supabase) | ✅ Auto-configurado | Nenhuma |

---

## 🚨 **AÇÃO OBRIGATÓRIA: Corrigir Banco de Dados**

### Problema Identificado
Os **triggers SQL** do banco ainda fazem referência a campos de usuário que não existem mais após a remoção da autenticação:
- `created_by_user_id`
- `assigned_to_user_id`
- `user_id`
- `uploaded_by`

### Solução (2 minutos)

1. **Acesse o Supabase**
   - Login em https://supabase.com
   - Selecione o projeto do Campanhas EdTech

2. **Abra o SQL Editor**
   - Menu lateral: **SQL Editor**
   - Clique em **New Query**

3. **Execute o script de correção**
   - Abra o arquivo `/database_fix.sql` deste projeto
   - Copie **TODO** o conteúdo
   - Cole no SQL Editor do Supabase
   - Clique em **Run** (ou pressione Ctrl+Enter)

4. **Verifique os resultados**
   - O script executará e mostrará:
     - ✅ Triggers antigos removidos
     - ✅ Campos de usuário adicionados (nullable)
     - ✅ Valores padrão configurados
     - ✅ Usuário sistema criado
     - ✅ Instituições inseridas
     - ✅ Tags iniciais criadas
     - ✅ Estatísticas finais

5. **Confirmação**
   - Deve aparecer: "Usuário sistema criado: 1"
   - Deve aparecer: "8 instituições" inseridas
   - Sem erros críticos

---

## 📋 **Estrutura do Banco (Após Correção)**

### Tabelas Principais (12)
1. ✅ **campaigns** - Campanhas comerciais
2. ✅ **institutions** - Instituições de ensino
3. ✅ **tags** - Tags de categorização
4. ✅ **campaign_tags** - Relacionamento N:N
5. ✅ **comments** - Comentários e discussões
6. ✅ **attachments** - Arquivos anexados
7. ✅ **campaign_audit** - Histórico de edições
8. ✅ **users** - Usuário sistema (1 registro apenas)
9. ✅ **positions** - Cargos (opcional)
10. ✅ **areas** - Áreas (opcional)
11. ✅ **campaign_views** - Visualizações (opcional)
12. ✅ **notifications** - Notificações (opcional)

### Triggers Ativos
- ✅ `trigger_set_campaign_slug` - Gera slug automático
- ✅ `trigger_log_campaign_changes_simple` - Log de alterações (simplificado)

### Views Disponíveis
- ✅ `vw_campaigns_simple` - Campanhas com dados completos
- ✅ `vw_institution_stats` - Estatísticas por instituição

---

## 🔧 **Configuração do Servidor (já feita)**

### Backend (Hono + Deno)
- ✅ Arquivo: `/supabase/functions/server/index.tsx`
- ✅ CORS habilitado
- ✅ Logging configurado
- ✅ Storage bucket auto-criado: `make-a1f709fc-attachments`

### Rotas Disponíveis (30+)
```
GET    /make-server-a1f709fc/campaigns
GET    /make-server-a1f709fc/campaigns/slug/:slug
POST   /make-server-a1f709fc/campaigns
PUT    /make-server-a1f709fc/campaigns/:id
DELETE /make-server-a1f709fc/campaigns/:id
PUT    /make-server-a1f709fc/campaigns/:id/status
POST   /make-server-a1f709fc/campaigns/:id/duplicate

GET    /make-server-a1f709fc/campaigns/:id/comments
POST   /make-server-a1f709fc/campaigns/:id/comments
PUT    /make-server-a1f709fc/comments/:id
DELETE /make-server-a1f709fc/comments/:id
POST   /make-server-a1f709fc/comments/:id/important

GET    /make-server-a1f709fc/campaigns/:id/history
GET    /make-server-a1f709fc/campaigns/:id/attachments
POST   /make-server-a1f709fc/attachments/upload
DELETE /make-server-a1f709fc/attachments/:id

GET    /make-server-a1f709fc/tags
GET    /make-server-a1f709fc/institutions
GET    /make-server-a1f709fc/positions

GET    /make-server-a1f709fc/auth/profile
PUT    /make-server-a1f709fc/auth/profile
```

---

## 🧪 **Testar o Sistema**

### Teste 1: Verificar Servidor
```bash
# Substitua {projectId} pelo ID real do seu projeto
curl https://{projectId}.supabase.co/functions/v1/make-server-a1f709fc/institutions \
  -H "Authorization: Bearer {publicAnonKey}"
```

**Resultado esperado:**
```json
{
  "institutions": [
    {"id": 1, "name": "PUCRS", "slug": "pucrs"},
    {"id": 2, "name": "PUCRS Grad", "slug": "pucrs-grad"},
    ...
  ]
}
```

### Teste 2: Criar Campanha via API
```bash
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-a1f709fc/campaigns \
  -H "Authorization: Bearer {publicAnonKey}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Campanha Teste",
    "institution": "PUCRS",
    "description": "Esta é uma descrição de teste com mais de 140 caracteres para atender ao requisito mínimo de caracteres estabelecido no sistema de gestão de campanhas comerciais do EdTech.",
    "startDate": "2025-01-15",
    "endDate": "2025-03-15",
    "status": "draft",
    "tagsRelated": [],
    "tagsExcluded": []
  }'
```

**Resultado esperado:**
```json
{
  "id": "uuid-gerado",
  "slug": "campanha-teste",
  "name": "Campanha Teste",
  "status": "draft",
  ...
}
```

### Teste 3: Interface Web
1. Acesse a aplicação no navegador
2. Deve aparecer a tela principal (sem login)
3. Clique em "Nova Iniciativa"
4. Preencha o formulário:
   - Nome: "Teste Deploy"
   - Instituição: Selecione qualquer uma
   - Descrição: Mínimo 140 caracteres
   - Datas: Hoje até daqui 30 dias
5. Salve
6. Deve redirecionar para a página da campanha

### Teste 4: Upload de Anexo
1. Entre em uma campanha criada
2. Edite a campanha
3. Vá na aba "Anexos"
4. Arraste um arquivo (imagem, PDF, etc)
5. Deve fazer upload e aparecer na galeria

### Teste 5: Comentários
1. Entre em uma campanha
2. Role até "Comentários"
3. Digite um comentário
4. Envie
5. Deve aparecer imediatamente na lista

---

## 📊 **Dados Iniciais (Inseridos pelo Script)**

### Instituições (8)
- PUCRS
- PUCRS Grad
- FAAP
- FIA Online
- UNESC
- Santa Casa SP
- Impacta
- FSL Digital

### Tags (18)
- **Nível**: graduação, pós-graduação, MBA
- **Modalidade**: EAD, presencial, híbrido
- **Benefício**: desconto, bolsa, parcelamento
- **Processo**: vestibular, transferência, segunda graduação
- **Área**: medicina, engenharia, direito, administração, tecnologia, saúde

### Usuário Sistema
- **ID**: `00000000-0000-0000-0000-000000000000`
- **Email**: `system@campanhas-edtech.app`
- **Nome**: Sistema
- **Role**: admin

---

## 🔍 **Debugging (Se algo der errado)**

### Erro: "Institution not found"
**Causa**: Instituições não foram inseridas no banco
**Solução**: Execute o script `database_fix.sql` novamente

### Erro: "invalid input syntax for type integer"
**Causa**: `institution_id` está vindo como string ao invés de integer
**Solução**: ✅ Já corrigido no servidor - busca o ID pelo nome

### Erro: "column user_id does not exist"
**Causa**: Triggers antigos ainda ativos
**Solução**: Execute o script `database_fix.sql` para removê-los

### Erro: "Upload failed"
**Causa**: Bucket do Storage não foi criado
**Solução**: O servidor cria automaticamente na primeira execução, aguarde

### Erro 500 no servidor
**Onde ver logs:**
1. Supabase → Edge Functions → make-server-a1f709fc
2. Clique em "Logs"
3. Veja o erro detalhado
4. Copie a mensagem e verifique o console do navegador também

### Interface não carrega
**Verificar:**
1. Console do navegador (F12) → Tem erros?
2. Network tab → Requisições estão falhando?
3. Variáveis `projectId` e `publicAnonKey` em `/utils/supabase/info.tsx` estão corretas?

---

## 📂 **Arquivos Importantes**

### Documentação
- 📄 `/DATABASE_CONNECTIVITY.md` - Documentação completa de conectividade
- 📄 `/database_fix.sql` - Script de correção do banco
- 📄 `/DEPLOYMENT_CHECKLIST.md` - Este arquivo
- 📄 `/README.md` - Documentação geral do projeto
- 📄 `/FEATURES.md` - Lista de funcionalidades
- 📄 `/MOBILE_UX.md` - Funcionalidades mobile

### Código Core
- ⚙️ `/supabase/functions/server/index.tsx` - Backend API
- ⚙️ `/App.tsx` - Aplicação React principal
- ⚙️ `/components/CampaignsApp.tsx` - Dashboard principal
- ⚙️ `/components/CampaignDetailPage.tsx` - Página de campanha
- ⚙️ `/utils/campaignService.ts` - Serviço de campanhas
- ⚙️ `/utils/supabase/client.ts` - Cliente Supabase

---

## 🎯 **Próximos Passos (Após Deploy)**

### Funcionalidades Prontas ✅
- [x] CRUD completo de campanhas
- [x] Sistema de comentários com replies
- [x] Upload de anexos (9 tipos de arquivo)
- [x] Histórico de edições
- [x] Calendário com múltiplas visualizações
- [x] Filtros avançados
- [x] Visualização Gantt
- [x] Visualização Tabela
- [x] Captura por áudio com transcrição
- [x] URL amigável (slug)
- [x] Mobile responsivo
- [x] Sistema sem login

### Melhorias Futuras (Opcional)
- [ ] Busca full-text em campanhas
- [ ] Dashboard com métricas
- [ ] Exportar campanhas (PDF, Excel)
- [ ] Notificações de campanhas expirando
- [ ] Favoritar campanhas
- [ ] Compartilhar campanha por link
- [ ] Dark mode
- [ ] PWA (Progressive Web App)
- [ ] Analytics de visualizações

---

## 🚀 **Deploy em Produção**

### Pré-requisitos
- ✅ Script SQL executado
- ✅ Instituições criadas
- ✅ Testes funcionando localmente

### Passos
1. **Build do Frontend**
   ```bash
   npm run build
   ```

2. **Deploy do Edge Function**
   - Já está no Supabase
   - Verifique se está ativo: Edge Functions → make-server-a1f709fc
   - Status deve ser "Active"

3. **Configurar Domínio (Opcional)**
   - Supabase → Project Settings → Custom Domains
   - Adicione seu domínio
   - Configure DNS

4. **Testes Finais**
   - Acesse a aplicação
   - Crie uma campanha
   - Adicione comentário
   - Faça upload de arquivo
   - Verifique histórico

---

## ✅ **Checklist Final**

Antes de marcar como concluído, verifique:

- [ ] Script `database_fix.sql` executado no Supabase
- [ ] 8 instituições inseridas (verificar em SQL Editor: `SELECT * FROM institutions`)
- [ ] Usuário sistema criado (verificar: `SELECT * FROM users WHERE id = '00000000-0000-0000-0000-000000000000'`)
- [ ] Triggers antigos removidos (não deve haver erros de `column does not exist`)
- [ ] Edge Function ativa e sem erros
- [ ] Interface carrega sem erros no console
- [ ] Consegue criar campanha
- [ ] Consegue adicionar comentário
- [ ] Consegue fazer upload de arquivo
- [ ] URLs amigáveis funcionando (ex: `/campanha/teste-deploy`)

---

## 📞 **Suporte e Logs**

### Onde encontrar logs:

**Frontend (navegador):**
- Pressione F12
- Aba Console → Erros JavaScript
- Aba Network → Requisições HTTP

**Backend (Supabase):**
- Supabase → Edge Functions → make-server-a1f709fc
- Clique em "Logs"
- Veja requisições, erros e respostas

**Banco de Dados (Supabase):**
- Supabase → Database → Logs
- Query Performance
- Erros de SQL

### Dúvidas Comuns

**Q: Preciso configurar autenticação?**
A: Não. O sistema foi projetado para ser completamente aberto.

**Q: Como adicionar mais instituições?**
A: Execute um INSERT no SQL Editor:
```sql
INSERT INTO institutions (id, name, slug, short_name, is_active, sort_order)
VALUES (9, 'Nova Instituição', 'nova-instituicao', 'Nova', true, 9);
```

**Q: Como resetar o banco?**
A: Execute:
```sql
TRUNCATE campaigns, comments, attachments, campaign_tags CASCADE;
```
(Mantém instituições e tags)

**Q: O Storage está gastando muito espaço?**
A: Configure lifecycle policies no Supabase Storage para deletar arquivos antigos automaticamente.

---

## 🎉 **Conclusão**

Após executar o script SQL, o sistema estará **100% funcional** e pronto para uso!

**Última atualização**: 20 de Outubro de 2025  
**Versão**: 1.0.0 (sem autenticação)  
**Status**: ✅ Pronto para produção
