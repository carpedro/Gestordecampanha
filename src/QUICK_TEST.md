# ⚡ Testes Rápidos - Conectividade

## 🎯 Objetivo
Verificar se a conectividade está funcionando após executar o script SQL.

---

## ✅ Pré-requisito

Execute primeiro o script de correção:
```sql
-- No Supabase SQL Editor, execute TODO o conteúdo de:
/database_fix.sql
```

---

## 🧪 Teste 1: Verificar Dados Iniciais

### SQL (Supabase SQL Editor)
```sql
-- 1. Verificar instituições (deve retornar 8)
SELECT COUNT(*) AS total_institutions FROM institutions;

-- 2. Verificar usuário sistema (deve retornar 1)
SELECT * FROM users WHERE id = '00000000-0000-0000-0000-000000000000';

-- 3. Verificar tags (deve retornar 18+)
SELECT COUNT(*) AS total_tags FROM tags;

-- 4. Verificar triggers (não deve ter triggers antigos)
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table IN ('campaigns', 'comments', 'attachments');
```

**Resultado Esperado:**
- 8 instituições ✅
- 1 usuário sistema ✅
- 18+ tags ✅
- Apenas 2 triggers: `trigger_set_campaign_slug`, `trigger_log_campaign_changes_simple` ✅

---

## 🧪 Teste 2: API - Listar Instituições

### cURL (Terminal)
```bash
# Substitua {projectId} e {publicAnonKey} pelos valores reais
curl https://{projectId}.supabase.co/functions/v1/make-server-a1f709fc/institutions \
  -H "Authorization: Bearer {publicAnonKey}"
```

### JavaScript (Console do Navegador)
```javascript
// Abra o console (F12) na sua aplicação
fetch('https://{projectId}.supabase.co/functions/v1/make-server-a1f709fc/institutions', {
  headers: {
    Authorization: 'Bearer {publicAnonKey}'
  }
})
.then(r => r.json())
.then(data => console.log('Instituições:', data))
.catch(err => console.error('Erro:', err));
```

**Resultado Esperado:**
```json
{
  "institutions": [
    {
      "id": 1,
      "name": "PUCRS",
      "slug": "pucrs",
      "short_name": "PUCRS",
      "is_active": true
    },
    {
      "id": 2,
      "name": "PUCRS Grad",
      "slug": "pucrs-grad",
      "short_name": "PUCRS Grad",
      "is_active": true
    },
    ...
  ]
}
```

---

## 🧪 Teste 3: API - Listar Tags

### cURL
```bash
curl https://{projectId}.supabase.co/functions/v1/make-server-a1f709fc/tags \
  -H "Authorization: Bearer {publicAnonKey}"
```

**Resultado Esperado:**
```json
{
  "tags": [
    {"id": "uuid", "name": "graduação", "category": "nivel"},
    {"id": "uuid", "name": "pós-graduação", "category": "nivel"},
    {"id": "uuid", "name": "MBA", "category": "nivel"},
    ...
  ]
}
```

---

## 🧪 Teste 4: API - Criar Campanha

### cURL
```bash
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-a1f709fc/campaigns \
  -H "Authorization: Bearer {publicAnonKey}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Conectividade 2025",
    "institution": "PUCRS",
    "description": "Esta é uma descrição de teste com mais de 140 caracteres para atender ao requisito mínimo estabelecido no sistema de gestão de campanhas comerciais do EdTech. Testando a conectividade completa.",
    "startDate": "2025-01-20",
    "endDate": "2025-12-20",
    "status": "draft",
    "tagsRelated": [],
    "tagsExcluded": []
  }'
```

**Resultado Esperado:**
```json
{
  "id": "uuid-gerado",
  "slug": "teste-conectividade-2025",
  "name": "Teste Conectividade 2025",
  "institution_id": 1,
  "description": "Esta é uma descrição...",
  "start_date": "2025-01-20",
  "end_date": "2025-12-20",
  "status": "draft",
  "version": 1,
  "created_at": "2025-10-20T...",
  "institution": {
    "name": "PUCRS"
  }
}
```

---

## 🧪 Teste 5: API - Listar Campanhas

### cURL
```bash
curl https://{projectId}.supabase.co/functions/v1/make-server-a1f709fc/campaigns \
  -H "Authorization: Bearer {publicAnonKey}"
```

**Resultado Esperado:**
```json
{
  "campaigns": [
    {
      "id": "uuid",
      "slug": "teste-conectividade-2025",
      "name": "Teste Conectividade 2025",
      "status": "draft",
      "institution": { "name": "PUCRS" },
      ...
    }
  ]
}
```

---

## 🧪 Teste 6: Interface - Criar Campanha

### Passos
1. Abra a aplicação no navegador
2. **Verificar**: Não deve pedir login ✅
3. Clique no botão **"Nova Iniciativa"**
4. Preencha o formulário:
   - **Nome**: "Teste Frontend 2025"
   - **Instituição**: Selecione "PUCRS"
   - **Descrição**: Digite pelo menos 140 caracteres
   - **Data Início**: Hoje
   - **Data Término**: Hoje + 30 dias
   - **Status**: Rascunho
5. Clique em **"Criar Iniciativa"**

**Resultado Esperado:**
- ✅ Toast: "Iniciativa criada com sucesso!"
- ✅ Modal fecha
- ✅ Nova campanha aparece na lista
- ✅ Pode clicar na campanha e abrir página de detalhe

---

## 🧪 Teste 7: Interface - Adicionar Comentário

### Passos
1. Entre em uma campanha criada
2. Role até a seção **"Comentários"**
3. Digite no campo de texto: "Testando comentários do sistema"
4. Clique em **"Enviar"**

**Resultado Esperado:**
- ✅ Toast: "Comentário adicionado!"
- ✅ Comentário aparece imediatamente na lista
- ✅ Mostra timestamp correto
- ✅ Botões de ação funcionam (editar, excluir, importante)

---

## 🧪 Teste 8: Interface - Upload de Anexo

### Passos
1. Entre em uma campanha criada
2. Clique em **"Editar"** (ícone de lápis)
3. Vá na aba **"Anexos"**
4. Arraste ou selecione um arquivo (ex: imagem JPG < 10MB)
5. Aguarde o upload

**Resultado Esperado:**
- ✅ Barra de progresso aparece
- ✅ Progress: 0% → 100%
- ✅ Toast: "1 arquivo(s) enviado(s) com sucesso!"
- ✅ Arquivo aparece na galeria
- ✅ Preview funciona (se for imagem)
- ✅ Pode clicar para abrir em nova aba

---

## 🧪 Teste 9: Interface - Histórico de Edições

### Passos
1. Entre em uma campanha que já foi editada
2. Role até a seção **"Histórico de Edições"**
3. Clique para expandir

**Resultado Esperado:**
- ✅ Mostra timeline de alterações
- ✅ Primeira entrada: "Campanha criada"
- ✅ Outras entradas mostram campos alterados
- ✅ Diff visual funciona (old vs new)
- ✅ Timestamps corretos

---

## 🧪 Teste 10: Interface - Filtros

### Passos
1. Na página principal, clique em **"Filtros"**
2. Selecione:
   - **Status**: "Rascunho"
   - **Instituição**: "PUCRS"
3. Aplique os filtros

**Resultado Esperado:**
- ✅ Lista atualiza para mostrar apenas campanhas filtradas
- ✅ Badges dos filtros aparecem
- ✅ Pode remover filtros individualmente
- ✅ "Limpar filtros" remove todos

---

## 🧪 Teste 11: Interface - Calendário

### Passos
1. Na página principal, clique na aba **"Calendário"**
2. Verifique se as campanhas aparecem nos dias corretos
3. Clique em uma campanha no calendário

**Resultado Esperado:**
- ✅ Campanhas aparecem nas datas corretas
- ✅ Badge de status correto
- ✅ Clicar abre modal com detalhes
- ✅ Navegação entre meses funciona

---

## 🧪 Teste 12: Interface - Gantt

### Passos
1. Na página principal, clique na aba **"Gantt"**
2. Verifique as barras de duração das campanhas
3. Teste o zoom (botões +/-)

**Resultado Esperado:**
- ✅ Barras aparecem com duração correta
- ✅ Cores por status funcionam
- ✅ Zoom in/out funciona
- ✅ Tooltip ao passar mouse

---

## 🧪 Teste 13: Interface - Tabela

### Passos
1. Na página principal, clique na aba **"Tabela"**
2. Teste ordenação por colunas
3. Teste paginação (se houver muitas campanhas)

**Resultado Esperado:**
- ✅ Todas as colunas aparecem
- ✅ Ordenação funciona (nome, data, status)
- ✅ Paginação funciona
- ✅ Ações (editar, duplicar, excluir) funcionam

---

## 🧪 Teste 14: Mobile - Responsividade

### Passos
1. Abra DevTools (F12)
2. Clique no ícone de dispositivo móvel
3. Selecione "iPhone 12 Pro" ou similar
4. Teste navegação

**Resultado Esperado:**
- ✅ Layout adapta para mobile
- ✅ Menu hamburguer funciona
- ✅ Bottom sheets aparecem
- ✅ Gestos touch funcionam
- ✅ Cards empilham verticalmente

---

## 🧪 Teste 15: Logs do Servidor

### Passos
1. Acesse: Supabase → Edge Functions → make-server-a1f709fc
2. Clique em **"Logs"**
3. Faça uma ação na interface (criar campanha)
4. Verifique os logs

**Resultado Esperado:**
- ✅ Log de requisição aparece
- ✅ Status: 200 (sucesso)
- ✅ Body da requisição visível
- ✅ Tempo de resposta < 500ms
- ✅ Sem erros 500

---

## ❌ Troubleshooting

### Problema: "Institution not found"
```bash
# Verificar se instituições existem
SELECT * FROM institutions;

# Se vazio, executar novamente:
INSERT INTO institutions (id, name, slug, short_name, is_active, sort_order) VALUES
(1, 'PUCRS', 'pucrs', 'PUCRS', true, 1),
(2, 'PUCRS Grad', 'pucrs-grad', 'PUCRS Grad', true, 2);
```

### Problema: "column user_id does not exist"
```bash
# Verificar se colunas existem
SELECT column_name FROM information_schema.columns 
WHERE table_name='campaigns' AND column_name LIKE '%user%';

# Se vazio, executar:
ALTER TABLE campaigns ADD COLUMN created_by_user_id UUID;
ALTER TABLE campaigns ADD COLUMN assigned_to_user_id UUID;
```

### Problema: Upload falha
```bash
# Verificar bucket no Supabase:
# Storage → Buckets → Deve ter "make-a1f709fc-attachments"

# Se não existir, o servidor cria automaticamente na primeira vez.
# Aguarde 1 minuto e tente novamente.
```

### Problema: Edge Function offline
```bash
# Verificar status:
# Supabase → Edge Functions → make-server-a1f709fc
# Status deve ser "Active" (verde)

# Se estiver "Inactive", redeploye:
# (normalmente não é necessário, é auto-deploy)
```

---

## ✅ Checklist Completo

Marque conforme testa:

- [ ] **SQL**: Dados iniciais inseridos (instituições, tags, usuário)
- [ ] **API**: Listar instituições retorna 8 itens
- [ ] **API**: Listar tags retorna 18+ itens
- [ ] **API**: Criar campanha funciona
- [ ] **API**: Listar campanhas retorna campanhas criadas
- [ ] **Interface**: Criar campanha via formulário
- [ ] **Interface**: Editar campanha funciona
- [ ] **Interface**: Adicionar comentário funciona
- [ ] **Interface**: Upload de anexo funciona
- [ ] **Interface**: Histórico de edições aparece
- [ ] **Interface**: Filtros funcionam
- [ ] **Interface**: Calendário mostra campanhas
- [ ] **Interface**: Gantt mostra barras
- [ ] **Interface**: Tabela funciona
- [ ] **Mobile**: Layout responsivo funciona
- [ ] **Logs**: Servidor logando corretamente

---

## 🎉 Conclusão

Se todos os testes passaram: **✅ Sistema 100% operacional!**

Se algum teste falhou: 
1. Verifique os logs (Console + Edge Function)
2. Execute o script SQL novamente
3. Verifique as variáveis em `/utils/supabase/info.tsx`

---

**Tempo estimado para todos os testes**: 10-15 minutos  
**Dificuldade**: Baixa (apenas executar e verificar)
