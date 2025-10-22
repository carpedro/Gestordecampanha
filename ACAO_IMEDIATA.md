# 🚨 AÇÃO IMEDIATA - DEPLOY EM PRODUÇÃO

**URGENTE:** Execute estas ações AGORA para viabilizar seu deploy!

---

## ⏰ Tempo Total: 2-3 horas

---

## 🔥 PASSO 1: PROTEGER CREDENCIAIS (30 min) - CRÍTICO!

### Por que é urgente?
Suas credenciais do Supabase estão expostas no repositório Git!

### Ações:

```bash
# 1. Verificar se .gitignore foi criado
ls -la .gitignore

# 2. Remover info.tsx do tracking do Git
git rm --cached src/utils/supabase/info.tsx

# 3. Commit
git add .gitignore
git commit -m "chore: add .gitignore and remove credentials from tracking"

# 4. Push
git push
```

### 🔒 REGENERAR CREDENCIAIS:

1. Acesse: https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw/settings/api
2. Clique em "Reset" em "anon key"
3. Confirme
4. Copie a nova chave
5. Atualize `src/utils/supabase/info.tsx` com a nova chave

**⚠️ Não pule esta etapa! Suas credenciais antigas estão comprometidas.**

---

## 📝 PASSO 2: CORRIGIR TIPOS (20 min)

### Arquivo: `src/types/campaign.ts`

Substitua:

```typescript
export interface CampaignFormData {
  name: string;
  institution: Institution;
  description: string;
  audioUrl?: string;
  tagsRelated: string[];
  tagsExcluded: string[];
  startDate: string; // ← MUDAR AQUI (era Date)
  endDate: string;   // ← MUDAR AQUI (era Date)
  status: CampaignStatus;
}

export interface Campaign {
  id: string;
  name: string;
  slug: string;
  institution: Institution;
  description: string;
  audioUrl?: string;
  tagsRelated: string[];
  tagsExcluded: string[];
  startDate: string; // ← MUDAR AQUI (era Date)
  endDate: string;   // ← MUDAR AQUI (era Date)
  status: CampaignStatus;
  createdBy: string;
  createdByName: string;
  createdAt: string; // ← MUDAR AQUI (era Date)
  updatedAt: string; // ← MUDAR AQUI (era Date)
  lastEditedBy?: string;
  lastEditedByName?: string;
  attachmentCount?: number;
  totalAttachmentSize?: number;
}
```

### Arquivo: `src/components/CampaignsApp.tsx`

Remover conversões de data:

**Linha 42-48 (loadCampaigns):**
```typescript
const loadCampaigns = async () => {
  try {
    setIsLoading(true);
    const data = await campaignService.getAll();
    // REMOVER estas linhas:
    // const parsedCampaigns = data.map((c: any) => ({
    //   ...c,
    //   startDate: new Date(c.startDate),
    //   endDate: new Date(c.endDate),
    //   ...
    // }));
    setCampaigns(data); // ← Usar direto!
  } catch (error) {
    console.error('Error loading campaigns:', error);
    toast.error('Erro ao carregar campanhas');
  } finally {
    setIsLoading(false);
  }
};
```

**Linha 58-99 (handleSave):**
```typescript
const handleSave = async (data: CampaignFormData) => {
  try {
    if (editingCampaign) {
      const updated = await campaignService.update(editingCampaign.id, data);
      setCampaigns(campaigns.map(c => c.id === editingCampaign.id ? updated : c)); // ← Sem conversão
      toast.success('Campanha atualizada com sucesso!');
    } else {
      const newCampaign = await campaignService.create(data);
      setCampaigns([newCampaign, ...campaigns]); // ← Sem conversão
      toast.success('Campanha criada com sucesso!');
      router.navigate({ path: 'campaign', slug: newCampaign.slug });
    }
    
    setIsFormOpen(false);
    setEditingCampaign(undefined);
  } catch (error: any) {
    console.error('Error saving campaign:', error);
    toast.error(error.message || 'Erro ao salvar campanha');
  }
};
```

Repetir o mesmo para `handleToggleStatus` e `handleDuplicate` (remover conversões de data).

---

## 🔧 PASSO 3: CORRIGIR EDGE FUNCTION (1h)

### Arquivo: `src/supabase/functions/server/index.tsx`

**Adicionar após linha 84:**

```typescript
// Helper para transformar dados de campanha para formato do frontend
function transformCampaignForFrontend(campaign: any): any {
  return {
    id: campaign.id,
    name: campaign.name,
    slug: campaign.slug,
    institution: campaign.institution || campaign.institution?.name || '',
    description: campaign.description,
    audioUrl: campaign.audio_url || campaign.description_audio_url,
    tagsRelated: [],
    tagsExcluded: [],
    startDate: campaign.start_date,
    endDate: campaign.end_date,
    status: campaign.status,
    createdBy: campaign.created_by_user_id,
    createdByName: campaign.created_by?.name || 'Sistema',
    createdAt: campaign.created_at,
    updatedAt: campaign.updated_at,
    lastEditedBy: campaign.assigned_to_user_id,
    lastEditedByName: campaign.created_by?.name || 'Sistema',
    attachmentCount: campaign.attachments_count || 0,
    totalAttachmentSize: 0,
  };
}
```

**Substituir endpoint GET /campaigns (linha 155-178):**

```typescript
app.get('/make-server-a1f709fc/campaigns', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        institution:institutions!campaigns_institution_id_fkey(name),
        created_by:users!campaigns_created_by_user_id_fkey(id, name, email)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching campaigns:', error);
      return c.json({ error: error.message }, 500);
    }
    
    // Buscar tags para cada campanha
    const campaignsWithTags = await Promise.all(
      (campaigns || []).map(async (campaign: any) => {
        const { data: tags } = await supabase
          .from('campaign_tags')
          .select('relation_type, tag:tags(name)')
          .eq('campaign_id', campaign.id);
        
        const tagsRelated = (tags || [])
          .filter(t => t.relation_type === 'related')
          .map(t => t.tag.name);
        
        const tagsExcluded = (tags || [])
          .filter(t => t.relation_type === 'excluded')
          .map(t => t.tag.name);
        
        return {
          ...transformCampaignForFrontend(campaign),
          tagsRelated,
          tagsExcluded,
        };
      })
    );
    
    return c.json({ campaigns: campaignsWithTags });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return c.json({ error: String(error) }, 500);
  }
});
```

**No endpoint POST /campaigns (linha 218), adicionar transformação no retorno (linha ~368):**

```typescript
// Buscar tags para o retorno
const { data: tags } = await supabase
  .from('campaign_tags')
  .select('relation_type, tag:tags(name)')
  .eq('campaign_id', campaign.id);

const tagsRelated = (tags || [])
  .filter(t => t.relation_type === 'related')
  .map(t => t.tag.name);

const tagsExcluded = (tags || [])
  .filter(t => t.relation_type === 'excluded')
  .map(t => t.tag.name);

return c.json({
  ...transformCampaignForFrontend(campaign),
  tagsRelated,
  tagsExcluded,
});
```

**Adicionar endpoints faltantes (após linha 1017):**

```typescript
// Rename attachment
app.put('/make-server-a1f709fc/attachments/:id/rename', async (c) => {
  try {
    const attachmentId = c.req.param('id');
    const { displayName } = await c.req.json();
    const supabase = getSupabaseAdmin();

    const { data: updated, error } = await supabase
      .from('attachments')
      .update({ 
        display_name: displayName,
        file_name: displayName,
      })
      .eq('id', attachmentId)
      .select()
      .single();

    if (error) {
      console.error('Error renaming attachment:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json(updated);
  } catch (error) {
    console.error('Error renaming attachment:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get download URL
app.get('/make-server-a1f709fc/attachments/:id/download', async (c) => {
  try {
    const attachmentId = c.req.param('id');
    const supabase = getSupabaseAdmin();

    const { data: attachment } = await supabase
      .from('attachments')
      .select('storage_path')
      .eq('id', attachmentId)
      .single();

    if (!attachment) {
      return c.json({ error: 'Attachment not found' }, 404);
    }

    const { data: urlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(attachment.storage_path, 3600);

    return c.json({ url: urlData?.signedUrl });
  } catch (error) {
    console.error('Error getting download URL:', error);
    return c.json({ error: String(error) }, 500);
  }
});
```

---

## 🚀 PASSO 4: DEPLOY DA EDGE FUNCTION (30 min)

```bash
# 1. Instalar Supabase CLI (se não tiver)
npm install -g supabase

# 2. Login
supabase login

# 3. Link com projeto
supabase link --project-ref jkplbqingkcmjhyogoiw

# 4. Criar estrutura
mkdir -p supabase/functions/make-server-a1f709fc

# 5. Copiar arquivos
cp src/supabase/functions/server/index.tsx supabase/functions/make-server-a1f709fc/index.ts
cp src/supabase/functions/server/deno.json supabase/functions/make-server-a1f709fc/deno.json
cp src/supabase/functions/server/types.d.ts supabase/functions/make-server-a1f709fc/types.d.ts

# 6. Deploy
supabase functions deploy make-server-a1f709fc

# 7. Configurar Secrets
supabase secrets set SUPABASE_URL=https://jkplbqingkcmjhyogoiw.supabase.co
supabase secrets set SUPABASE_ANON_KEY=[SUA_NOVA_ANON_KEY]
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=[SUA_SERVICE_ROLE_KEY]

# 8. Verificar
supabase functions list
```

---

## ✅ PASSO 5: TESTAR (30 min)

### Teste Local:

```bash
# 1. Instalar dependências
npm install

# 2. Rodar dev
npm run dev

# 3. Abrir navegador
# http://localhost:5173

# 4. Testar:
# - Criar campanha ✅
# - Editar campanha ✅
# - Deletar campanha ✅
# - Upload de anexo ✅
```

### Checklist de Teste:

- [ ] Clicar em "Nova Campanha"
- [ ] Preencher todos os campos
- [ ] Selecionar instituição "PUCRS"
- [ ] Adicionar descrição com 140+ caracteres
- [ ] Clicar em "Salvar"
- [ ] Campanha aparece na lista ✅
- [ ] Clicar na campanha
- [ ] Editar descrição
- [ ] Salvar
- [ ] Mudanças aparecem ✅

---

## 🎯 APÓS ESTES PASSOS

Você terá:
- ✅ Credenciais protegidas
- ✅ Tipos corrigidos
- ✅ Edge Function funcionando
- ✅ Criação de campanhas funcional
- ✅ Sistema pronto para demonstração

---

## 📋 CHECKLIST GERAL

- [ ] Passo 1: Credenciais protegidas e regeneradas
- [ ] Passo 2: Tipos corrigidos
- [ ] Passo 3: Edge Function corrigida
- [ ] Passo 4: Edge Function deployada
- [ ] Passo 5: Testes passando
- [ ] .gitignore commitado
- [ ] info.tsx fora do Git
- [ ] Build de produção funciona: `npm run build`

---

## 🆘 SE ALGO DER ERRADO

### Erro: "Institution not found"
**Solução:** Execute `SETUP_DATABASE.sql` no Supabase SQL Editor

### Erro: "Failed to fetch"
**Solução:** Verifique se a Edge Function foi deployada:
```bash
supabase functions list
```

### Erro: "SYSTEM_USER_NOT_CREATED"
**Solução:** Execute no SQL Editor:
```sql
SELECT * FROM users WHERE id = '00000000-0000-0000-0000-000000000000';
```
Se não retornar nada, execute `SETUP_DATABASE.sql`

---

## 📚 DOCUMENTOS DE REFERÊNCIA

- `RELATORIO_AUDITORIA_PRODUCAO.md` - Relatório completo
- `GUIA_DE_INSTALACAO.md` - Guia detalhado
- `COMECE_AQUI.md` - Visão geral

---

**BOA SORTE! SUA PROMOÇÃO DEPENDE DISSO! 💪🚀**

*Tempo total estimado: 2-3 horas*  
*Última atualização: 22 de Outubro de 2025*

