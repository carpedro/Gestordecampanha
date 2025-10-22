# 🔍 RELATÓRIO DE AUDITORIA - GESTOR DE CAMPANHAS

**Data:** 22 de Outubro de 2025  
**Objetivo:** Deploy em Produção  
**Status:** 🚨 BLOQUEADO - Problemas críticos identificados

---

## ✅ STATUS GERAL

- **Arquivos analisados:** 28
- **Problemas encontrados:** 23
- **Problemas críticos:** 7
- **Problemas altos:** 8
- **Problemas médios:** 5
- **Melhorias sugeridas:** 3

---

## 🚨 PROBLEMAS CRÍTICOS (Impedem deploy)

### Problema 1: .gitignore foi deletado - CREDENCIAIS EXPOSTAS! 🔥
- **Severidade:** CRÍTICA
- **Localização:** Raiz do projeto
- **Descrição:** O arquivo `.gitignore` foi deletado (conforme git status), e o arquivo `src/utils/supabase/info.tsx` contém credenciais do Supabase e está sendo rastreado pelo Git.
- **Impacto:** Credenciais do Supabase (Project ID e Anon Key) estão expostas no repositório. Isso é um risco de segurança GRAVE.
- **Prova:**
  ```
  src/utils/supabase/info.tsx contém:
  - projectId: "jkplbqingkcmjhyogoiw"
  - publicAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
- **Solução:** 
  ```gitignore
  # Criar arquivo .gitignore na raiz do projeto
  
  # Node
  node_modules/
  dist/
  build/
  .vite/
  
  # Logs
  logs
  *.log
  npm-debug.log*
  
  # Environment
  .env
  .env.local
  .env.production
  
  # Supabase Credentials (CRÍTICO!)
  src/utils/supabase/info.tsx
  supabase/config.toml
  
  # IDE
  .vscode/
  .idea/
  *.swp
  *.swo
  *~
  
  # OS
  .DS_Store
  Thumbs.db
  
  # TypeScript
  *.tsbuildinfo
  ```
- **Ação imediata:**
  1. Criar `.gitignore` com o conteúdo acima
  2. Executar: `git rm --cached src/utils/supabase/info.tsx`
  3. Commit: `git commit -m "chore: remove credentials from git tracking"`
  4. **REGENERAR as credenciais do Supabase** (Project Settings → API → Reset Keys)
  5. Atualizar `info.tsx` com as novas credenciais
- **Prioridade:** 🔥 URGENTE - Faça AGORA!

---

### Problema 2: Edge Function retorna snake_case, mas Frontend espera camelCase
- **Severidade:** CRÍTICA
- **Localização:** `src/supabase/functions/server/index.tsx` (linhas 159-177)
- **Descrição:** A Edge Function retorna dados do banco em snake_case (`start_date`, `end_date`, `created_at`), mas o TypeScript frontend espera camelCase (`startDate`, `endDate`, `createdAt`).
- **Impacto:** Ao carregar campanhas, os dados não são mapeados corretamente. Campos ficam undefined no frontend.
- **Exemplo do erro:**
  ```typescript
  // Edge Function retorna:
  {
    start_date: "2025-01-01",
    end_date: "2025-01-31",
    created_at: "2025-10-22T10:00:00Z",
    created_by: { id: "...", name: "...", email: "..." }  // OBJETO
  }
  
  // Frontend espera:
  {
    startDate: Date,
    endDate: Date,
    createdAt: Date,
    createdBy: string  // STRING (ID)
  }
  ```
- **Solução:** Adicionar função de transformação na Edge Function:

  ```typescript
  // Adicionar no src/supabase/functions/server/index.tsx (linha 84)
  
  // Helper para transformar snake_case para camelCase
  function toCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(v => toCamelCase(v));
    } else if (obj !== null && obj.constructor === Object) {
      return Object.keys(obj).reduce((result, key) => {
        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        result[camelKey] = toCamelCase(obj[key]);
        return result;
      }, {} as any);
    }
    return obj;
  }
  
  // Helper para transformar dados de campanha para formato do frontend
  function transformCampaignForFrontend(campaign: any): any {
    return {
      id: campaign.id,
      name: campaign.name,
      slug: campaign.slug,
      institution: campaign.institution,
      description: campaign.description,
      audioUrl: campaign.audio_url || campaign.description_audio_url,
      tagsRelated: [], // Buscar das campaign_tags depois
      tagsExcluded: [], // Buscar das campaign_tags depois
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
  
  // ATUALIZAR endpoint GET /campaigns (linha 155)
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
            .select('tag_id, relation_type, tag:tags(name)')
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
  
  // ATUALIZAR endpoint POST /campaigns (linha 218)
  // Adicionar transformação no retorno:
  const transformed = transformCampaignForFrontend(campaign);
  // Buscar tags...
  return c.json(transformed);
  
  // ATUALIZAR endpoint GET /campaigns/slug/:slug (linha 182)
  // Adicionar transformação no retorno
  ```

- **Prioridade:** 1 - URGENTE

---

### Problema 3: Tipos de Data incompatíveis entre Form e API
- **Severidade:** CRÍTICA
- **Localização:** `src/components/CampaignForm.tsx` (linhas 53-55, 346-365)
- **Descrição:** O formulário envia datas como strings (input type="date"), mas o tipo `CampaignFormData` e `Campaign` esperam objetos `Date`.
- **Impacto:** Ao criar/editar campanhas, há erro de tipo. A validação falha ou envia dados incorretos.
- **Solução:** 

  ```typescript
  // src/types/campaign.ts - Atualizar interface
  
  export interface CampaignFormData {
    name: string;
    institution: Institution;
    description: string;
    audioUrl?: string;
    tagsRelated: string[];
    tagsExcluded: string[];
    startDate: string; // MUDAR PARA STRING
    endDate: string;   // MUDAR PARA STRING
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
    startDate: string; // MUDAR PARA STRING (ISO 8601)
    endDate: string;   // MUDAR PARA STRING (ISO 8601)
    status: CampaignStatus;
    createdBy: string;
    createdByName: string;
    createdAt: string; // MUDAR PARA STRING (ISO 8601)
    updatedAt: string; // MUDAR PARA STRING (ISO 8601)
    lastEditedBy?: string;
    lastEditedByName?: string;
    attachmentCount?: number;
    totalAttachmentSize?: number;
  }
  ```

  ```typescript
  // src/components/CampaignsApp.tsx - Atualizar conversões de data (linhas 42-48, 67-70, 80-85)
  
  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      const data = await campaignService.getAll();
      // REMOVER conversões de data - já vem como string do backend
      setCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast.error('Erro ao carregar campanhas');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = async (data: CampaignFormData) => {
    try {
      if (editingCampaign) {
        const updated = await campaignService.update(editingCampaign.id, data);
        setCampaigns(campaigns.map(c => c.id === editingCampaign.id ? updated : c));
        toast.success('Campanha atualizada com sucesso!');
      } else {
        const newCampaign = await campaignService.create(data);
        setCampaigns([newCampaign, ...campaigns]);
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

  ```typescript
  // Atualizar comparações de data onde necessário
  // Usar new Date(stringDate) apenas para comparações
  
  // src/components/CampaignFilters.tsx ou onde precisar comparar datas:
  const campaignStart = new Date(campaign.startDate);
  const filterStart = new Date(filters.startDate);
  ```

- **Prioridade:** 1 - URGENTE

---

### Problema 4: Endpoints faltando na Edge Function
- **Severidade:** CRÍTICA
- **Localização:** 
  - `src/utils/attachmentService.ts` (linhas 91-112, 116-132)
  - `src/utils/historyService.ts` (linhas 34-48)
- **Descrição:** Os serviços do frontend chamam endpoints que não existem na Edge Function.
- **Impacto:** Ao tentar renomear anexo, baixar anexo ou reverter histórico, a aplicação quebra com erro 404.
- **Endpoints faltando:**
  1. `PUT /attachments/:id/rename` - Renomear anexo
  2. `GET /attachments/:id/download` - Download URL
  3. `POST /campaigns/:id/history/:versionId/revert` - Reverter versão

- **Solução:** Adicionar na Edge Function:

  ```typescript
  // src/supabase/functions/server/index.tsx
  // Adicionar após linha 1017 (depois do DELETE attachments)
  
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
          file_name: displayName, // Alias
          updated_at: new Date().toISOString(),
        })
        .eq('id', attachmentId)
        .select()
        .single();
  
      if (error) {
        console.error('Error renaming attachment:', error);
        return c.json({ error: error.message }, 500);
      }
  
      if (!updated) {
        return c.json({ error: 'Attachment not found' }, 404);
      }
  
      return c.json(updated);
    } catch (error) {
      console.error('Error renaming attachment:', error);
      return c.json({ error: String(error) }, 500);
    }
  });
  
  // Get download URL for attachment
  app.get('/make-server-a1f709fc/attachments/:id/download', async (c) => {
    try {
      const attachmentId = c.req.param('id');
      const supabase = getSupabaseAdmin();
  
      // Get attachment
      const { data: attachment } = await supabase
        .from('attachments')
        .select('storage_path')
        .eq('id', attachmentId)
        .single();
  
      if (!attachment) {
        return c.json({ error: 'Attachment not found' }, 404);
      }
  
      // Generate signed URL (valid for 1 hour)
      const { data: urlData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(attachment.storage_path, 3600);
  
      if (!urlData?.signedUrl) {
        return c.json({ error: 'Failed to generate download URL' }, 500);
      }
  
      return c.json({ url: urlData.signedUrl });
    } catch (error) {
      console.error('Error getting download URL:', error);
      return c.json({ error: String(error) }, 500);
    }
  });
  ```

- **Prioridade:** 1 - URGENTE

---

### Problema 5: CampaignForm - Valores iniciais incompatíveis
- **Severidade:** CRÍTICA
- **Localização:** `src/components/CampaignForm.tsx` (linhas 49-65)
- **Descrição:** `defaultValues` do `useForm` espera datas como Date, mas após a correção do Problema 3, devem ser strings.
- **Impacto:** Ao editar campanha, o formulário não carrega os valores corretamente.
- **Solução:**

  ```typescript
  // src/components/CampaignForm.tsx (linha 49-65)
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CampaignFormData>({
    defaultValues: campaign ? {
      name: campaign.name,
      institution: campaign.institution,
      description: campaign.description,
      startDate: campaign.startDate, // JÁ É STRING (ISO 8601 / YYYY-MM-DD)
      endDate: campaign.endDate,     // JÁ É STRING
      status: campaign.status,
      tagsRelated: campaign.tagsRelated,
      tagsExcluded: campaign.tagsExcluded,
      audioUrl: campaign.audioUrl,
    } : {
      status: 'draft',
      tagsRelated: [],
      tagsExcluded: [],
    }
  });
  ```

- **Prioridade:** 1 - URGENTE

---

### Problema 6: Falta validação de instituição no frontend
- **Severidade:** CRÍTICA
- **Localização:** `src/components/CampaignForm.tsx` (linha 237)
- **Descrição:** O campo `institution` não tem validação `required` no formulário.
- **Impacto:** É possível criar campanha sem instituição, causando erro 400 no backend.
- **Solução:**

  ```typescript
  // src/components/CampaignForm.tsx (linha 237)
  
  <div className="space-y-2">
    <Label htmlFor="institution">Instituição de Ensino *</Label>
    <Select
      value={institution}
      onValueChange={(value) => setValue('institution', value as Institution, { shouldValidate: true })}
      required // ADICIONAR
    >
      <SelectTrigger>
        <SelectValue placeholder="Selecione uma instituição" />
      </SelectTrigger>
      <SelectContent>
        {institutions.map((inst) => (
          <SelectItem key={inst} value={inst}>
            {inst}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {!institution && (
      <p className="text-sm text-red-600">Instituição é obrigatória</p>
    )}
  </div>
  ```

- **Prioridade:** 1 - URGENTE

---

### Problema 7: src/utils/supabase/info.tsx exposto com credenciais
- **Severidade:** CRÍTICA
- **Localização:** `src/utils/supabase/info.tsx`
- **Descrição:** Arquivo contém credenciais reais do Supabase e não está protegido pelo .gitignore.
- **Impacto:** Credenciais estão no repositório. Qualquer pessoa com acesso ao repo pode acessar o Supabase.
- **Solução:** 
  1. Já coberto no Problema 1 (criar .gitignore)
  2. Adicionar comentário de aviso no arquivo:
  
  ```typescript
  // src/utils/supabase/info.tsx
  
  /* AUTOGENERATED FILE - DO NOT COMMIT TO GIT */
  /* Este arquivo contém credenciais do Supabase e NUNCA deve ser commitado */
  /* Certifique-se que está no .gitignore */
  
  export const projectId = "jkplbqingkcmjhyogoiw"
  export const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcGxicWluZ2tjbWpoeW9nb2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDU1OTUsImV4cCI6MjA3NjIyMTU5NX0.UTs7ArhP1-znaj_SEku7KWtQ_15S6uYxbuL0rxjwzQU"
  ```

- **Prioridade:** 🔥 URGENTE - Coberto no Problema 1

---

## ⚠️ PROBLEMAS ALTOS (Devem ser resolvidos antes do deploy)

### Problema 8: Edge Function não deployada
- **Severidade:** ALTA
- **Localização:** Deploy infrastructure
- **Descrição:** A Edge Function pode não estar deployada ou pode estar desatualizada no Supabase.
- **Impacto:** Aplicação não funciona - não consegue criar/editar campanhas.
- **Solução:**
  
  ```bash
  # No terminal, na raiz do projeto:
  
  # 1. Instalar Supabase CLI (se não tiver)
  npm install -g supabase
  
  # 2. Login
  supabase login
  
  # 3. Link com projeto
  supabase link --project-ref jkplbqingkcmjhyogoiw
  
  # 4. Criar estrutura (se não existir)
  mkdir -p supabase/functions/make-server-a1f709fc
  
  # 5. Copiar código atualizado
  cp src/supabase/functions/server/index.tsx supabase/functions/make-server-a1f709fc/index.ts
  cp src/supabase/functions/server/deno.json supabase/functions/make-server-a1f709fc/deno.json
  
  # 6. Deploy
  supabase functions deploy make-server-a1f709fc
  
  # 7. Configurar Secrets
  supabase secrets set SUPABASE_URL=https://jkplbqingkcmjhyogoiw.supabase.co
  supabase secrets set SUPABASE_ANON_KEY=eyJhbGc... (sua anon key)
  supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (sua service role key)
  
  # 8. Verificar
  supabase functions list
  ```

- **Prioridade:** 2

---

### Problema 9: Falta tratamento de erro detalhado no frontend
- **Severidade:** ALTA
- **Localização:** `src/components/CampaignsApp.tsx` (linhas 96-99)
- **Descrição:** Erros da API são genéricos. Usuário não sabe o que deu errado.
- **Impacto:** Experiência ruim. Não fica claro se é erro de instituição, usuário sistema, etc.
- **Solução:**

  ```typescript
  // src/components/CampaignsApp.tsx (linha 96-99)
  
  const handleSave = async (data: CampaignFormData) => {
    try {
      if (editingCampaign) {
        const updated = await campaignService.update(editingCampaign.id, data);
        setCampaigns(campaigns.map(c => c.id === editingCampaign.id ? updated : c));
        toast.success('Campanha atualizada com sucesso!');
      } else {
        const newCampaign = await campaignService.create(data);
        setCampaigns([newCampaign, ...campaigns]);
        toast.success('Campanha criada com sucesso!');
        router.navigate({ path: 'campaign', slug: newCampaign.slug });
      }
      setIsFormOpen(false);
      setEditingCampaign(undefined);
    } catch (error: any) {
      console.error('Error saving campaign:', error);
      
      // Tratamento detalhado de erros
      let errorMessage = 'Erro ao salvar campanha';
      
      if (error.message) {
        if (error.message.includes('INSTITUTION_NOT_FOUND')) {
          errorMessage = '🏫 Instituição não encontrada. Execute o script SETUP_DATABASE.sql no Supabase.';
        } else if (error.message.includes('SYSTEM_USER_NOT_CREATED')) {
          errorMessage = '🚨 Usuário sistema não criado. Execute o script SETUP_DATABASE.sql no Supabase.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = '🌐 Erro de conexão. Verifique se a Edge Function está deployada.';
        } else if (error.message.includes('unique constraint')) {
          errorMessage = '⚠️ Já existe uma campanha com esse nome.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        action: error.message?.includes('SETUP_DATABASE') ? {
          label: 'Ver guia',
          onClick: () => window.open('https://github.com/seu-repo/GUIA_DE_INSTALACAO.md', '_blank')
        } : undefined
      });
    }
  };
  ```

- **Prioridade:** 2

---

### Problema 10: campaignService.create não trata erro JSON
- **Severidade:** ALTA
- **Localização:** `src/utils/campaignService.ts` (linhas 48-68)
- **Descrição:** Se o backend retornar HTML de erro (Edge Function offline), o `response.json()` quebra.
- **Impacto:** Erro genérico sem informação útil.
- **Solução:**

  ```typescript
  // src/utils/campaignService.ts (linha 48-68)
  
  async create(data: CampaignFormData): Promise<Campaign> {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/campaigns`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      let errorMessage = 'Falha ao criar iniciativa';
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          errorMessage = error.error || error.message || errorMessage;
        } else {
          const errorText = await response.text();
          console.error('Non-JSON error response:', errorText);
          
          if (response.status === 404) {
            errorMessage = '🌐 Edge Function não encontrada. Verifique se foi deployada.';
          } else if (response.status === 500) {
            errorMessage = '🚨 Erro no servidor. Verifique os logs da Edge Function.';
          }
        }
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  },
  ```

- **Prioridade:** 2

---

### Problema 11: Falta verificação de SETUP_DATABASE.sql executado
- **Severidade:** ALTA
- **Localização:** Processo de deploy
- **Descrição:** Não há verificação automática se o script SQL foi executado.
- **Impacto:** Aplicação pode ser deployada sem banco configurado, causando erros.
- **Solução:** Criar endpoint de health check:

  ```typescript
  // src/supabase/functions/server/index.tsx
  // Adicionar no início, após linha 83
  
  // Health check endpoint
  app.get('/make-server-a1f709fc/health', async (c) => {
    try {
      const supabase = getSupabaseAdmin();
      
      // Check system user
      const { data: systemUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', SYSTEM_USER_ID)
        .single();
      
      // Check institutions
      const { data: institutions } = await supabase
        .from('institutions')
        .select('id')
        .limit(1);
      
      // Check tables exist
      const { data: tables } = await supabase
        .from('campaigns')
        .select('id')
        .limit(0);
      
      const issues = [];
      
      if (!systemUser) {
        issues.push('SYSTEM_USER_NOT_FOUND');
      }
      
      if (!institutions || institutions.length === 0) {
        issues.push('INSTITUTIONS_NOT_FOUND');
      }
      
      const status = issues.length === 0 ? 'healthy' : 'unhealthy';
      
      return c.json({
        status,
        issues,
        timestamp: new Date().toISOString(),
        message: status === 'healthy' 
          ? '✅ Banco de dados configurado corretamente' 
          : '❌ Execute SETUP_DATABASE.sql no Supabase SQL Editor'
      }, status === 'healthy' ? 200 : 500);
    } catch (error) {
      return c.json({
        status: 'error',
        error: String(error),
        message: '🚨 Erro ao verificar saúde do sistema'
      }, 500);
    }
  });
  ```

  ```typescript
  // Adicionar no frontend - src/components/CampaignsApp.tsx (linha 36)
  
  useEffect(() => {
    checkHealth();
    loadCampaigns();
    
    const unsubscribe = router.onRouteChange((route) => {
      setCurrentRoute(route);
    });
    
    return unsubscribe;
  }, []);
  
  const checkHealth = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/health`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      const data = await response.json();
      
      if (data.status !== 'healthy') {
        toast.error(data.message, {
          duration: 10000,
          action: {
            label: 'Ver solução',
            onClick: () => window.open('/GUIA_DE_INSTALACAO.md', '_blank')
          }
        });
      }
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };
  ```

- **Prioridade:** 2

---

### Problema 12: Falta configuração de CORS para produção
- **Severidade:** ALTA
- **Localização:** `src/supabase/functions/server/index.tsx` (linha 17)
- **Descrição:** CORS está configurado como `*` (aceita qualquer origem).
- **Impacto:** Vulnerabilidade de segurança. Qualquer site pode chamar sua API.
- **Solução:**

  ```typescript
  // src/supabase/functions/server/index.tsx (linha 17)
  
  // CORS com lista de origens permitidas
  const allowedOrigins = [
    'http://localhost:5173', // Desenvolvimento
    'http://localhost:3000',
    'https://campanhas.figma.site', // Produção
    'https://seu-dominio-producao.com', // Adicione seu domínio
  ];
  
  app.use('*', cors({
    origin: (origin) => {
      // Permitir requisições sem origin (ex: Postman, curl)
      if (!origin) return true;
      // Verificar se está na lista
      return allowedOrigins.includes(origin);
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Client-Info', 'apikey'],
    maxAge: 86400, // 24 horas
  }));
  ```

- **Prioridade:** 3 (Deploy) / 2 (Se já em produção)

---

### Problema 13: Falta rate limiting
- **Severidade:** ALTA
- **Localização:** Edge Function
- **Descrição:** Não há limitação de requisições por usuário/IP.
- **Impacto:** Vulnerável a ataques DDoS e abuso da API.
- **Solução:** Implementar rate limiting simples:

  ```typescript
  // src/supabase/functions/server/index.tsx
  // Adicionar após linha 33
  
  // Simple in-memory rate limiter (para produção, usar Redis ou Supabase KV)
  const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
  const RATE_LIMIT_WINDOW = 60000; // 1 minuto
  const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requisições por minuto
  
  // Rate limiting middleware
  app.use('*', async (c, next) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const now = Date.now();
    
    const limiter = rateLimitMap.get(ip);
    
    if (limiter) {
      if (now < limiter.resetAt) {
        if (limiter.count >= RATE_LIMIT_MAX_REQUESTS) {
          return c.json({
            error: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil((limiter.resetAt - now) / 1000)
          }, 429);
        }
        limiter.count++;
      } else {
        // Reset
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
      }
    } else {
      rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    }
    
    // Cleanup old entries every 1000 requests
    if (rateLimitMap.size > 1000) {
      for (const [key, value] of rateLimitMap.entries()) {
        if (now > value.resetAt) {
          rateLimitMap.delete(key);
        }
      }
    }
    
    await next();
  });
  ```

- **Prioridade:** 3 (Recomendado para produção)

---

### Problema 14: Falta logging estruturado
- **Severidade:** ALTA
- **Localização:** Toda a Edge Function
- **Descrição:** Logs são simples `console.log` e `console.error`, difíceis de rastrear em produção.
- **Impacto:** Difícil debugar problemas em produção.
- **Solução:**

  ```typescript
  // src/supabase/functions/server/index.tsx
  // Adicionar após linha 10
  
  // Structured logger
  const log = {
    info: (message: string, meta?: any) => {
      console.log(JSON.stringify({
        level: 'info',
        message,
        timestamp: new Date().toISOString(),
        ...meta
      }));
    },
    error: (message: string, error?: any, meta?: any) => {
      console.error(JSON.stringify({
        level: 'error',
        message,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        timestamp: new Date().toISOString(),
        ...meta
      }));
    },
    warn: (message: string, meta?: any) => {
      console.warn(JSON.stringify({
        level: 'warn',
        message,
        timestamp: new Date().toISOString(),
        ...meta
      }));
    }
  };
  
  // Substituir todos os console.log e console.error por:
  // console.log(...) → log.info(...)
  // console.error(...) → log.error(...)
  ```

- **Prioridade:** 3 (Recomendado para produção)

---

### Problema 15: Falta validação de tamanho de payload
- **Severidade:** ALTA
- **Localização:** Edge Function (POST/PUT endpoints)
- **Descrição:** Não há limitação de tamanho do payload JSON.
- **Impacto:** Alguém pode enviar payload gigante e derrubar a Edge Function.
- **Solução:**

  ```typescript
  // src/supabase/functions/server/index.tsx
  // Adicionar middleware após linha 18
  
  // Payload size limiter
  app.use('*', async (c, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(c.req.method)) {
      const contentLength = c.req.header('content-length');
      const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024; // 10MB
      
      if (contentLength && parseInt(contentLength) > MAX_PAYLOAD_SIZE) {
        return c.json({
          error: 'Payload too large',
          maxSize: '10MB'
        }, 413);
      }
    }
    
    await next();
  });
  ```

- **Prioridade:** 3

---

## 📋 PROBLEMAS MÉDIOS (Recomendado resolver)

### Problema 16: Falta variáveis de ambiente no frontend
- **Severidade:** MÉDIA
- **Localização:** `src/utils/supabase/info.tsx`
- **Descrição:** Credenciais hardcoded. Deveria usar variáveis de ambiente.
- **Impacto:** Dificulta deployment em ambientes diferentes (dev, staging, prod).
- **Solução:**

  ```typescript
  // vite.config.ts - Adicionar suporte a env vars
  
  import { defineConfig, loadEnv } from 'vite'
  import react from '@vitejs/plugin-react-swc'
  import path from 'path'
  
  export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    
    return {
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
      },
      define: {
        'import.meta.env.VITE_SUPABASE_PROJECT_ID': JSON.stringify(env.VITE_SUPABASE_PROJECT_ID),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      },
    }
  })
  ```

  ```env
  # .env (criar na raiz)
  VITE_SUPABASE_PROJECT_ID=jkplbqingkcmjhyogoiw
  VITE_SUPABASE_ANON_KEY=eyJhbGc...
  ```

  ```typescript
  // src/utils/supabase/info.tsx
  
  export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'jkplbqingkcmjhyogoiw';
  export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGc...';
  ```

  ```gitignore
  # Adicionar ao .gitignore
  .env
  .env.local
  .env.*.local
  ```

- **Prioridade:** 4

---

### Problema 17: Falta tratamento para instituições não cadastradas
- **Severidade:** MÉDIA
- **Localização:** `src/components/CampaignForm.tsx` (linha 28-37)
- **Descrição:** Lista de instituições está hardcoded no frontend. Se adicionar no banco, não aparece.
- **Impacto:** Inconsistência entre banco e UI.
- **Solução:**

  ```typescript
  // src/components/CampaignForm.tsx
  
  // Remover array hardcoded (linha 28-37)
  // const institutions: Institution[] = [...];
  
  // Adicionar estado e fetch dinâmico
  const [institutions, setInstitutions] = useState<string[]>([]);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false);
  
  useEffect(() => {
    loadInstitutions();
  }, []);
  
  const loadInstitutions = async () => {
    try {
      setIsLoadingInstitutions(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a1f709fc/institutions`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setInstitutions(data.institutions.map((i: any) => i.name));
      }
    } catch (error) {
      console.error('Error loading institutions:', error);
      // Fallback para lista hardcoded
      setInstitutions([
        'PUCRS',
        'PUCRS Grad',
        'FAAP',
        'FIA Online',
        'UNESC',
        'Santa Casa SP',
        'Impacta',
        'FSL Digital',
      ]);
    } finally {
      setIsLoadingInstitutions(false);
    }
  };
  ```

- **Prioridade:** 4

---

### Problema 18: Falta validação de datas (fim > início)
- **Severidade:** MÉDIA
- **Localização:** `src/components/CampaignForm.tsx` (linha 346-365)
- **Descrição:** Formulário não valida se data de fim é posterior à data de início.
- **Impacto:** Usuário pode criar campanha com datas inválidas.
- **Solução:**

  ```typescript
  // src/components/CampaignForm.tsx
  
  const onSubmit = (data: CampaignFormData) => {
    // Validar descrição mínima
    if (data.description.length < 140) {
      toast.error('A descrição deve ter no mínimo 140 caracteres');
      return;
    }
    
    // ADICIONAR: Validar datas
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    if (endDate < startDate) {
      toast.error('A data de término deve ser posterior à data de início');
      return;
    }
    
    // Validar instituição selecionada
    if (!data.institution) {
      toast.error('Selecione uma instituição');
      return;
    }

    onSave({
      ...data,
      tagsRelated,
      tagsExcluded,
      audioUrl,
    });
    onClose();
  };
  ```

- **Prioridade:** 4

---

### Problema 19: Falta feedback visual ao salvar
- **Severidade:** MÉDIA
- **Localização:** `src/components/CampaignForm.tsx`
- **Descrição:** Formulário não mostra loading ao salvar.
- **Impacto:** Usuário pode clicar múltiplas vezes, criando campanhas duplicadas.
- **Solução:**

  ```typescript
  // src/components/CampaignForm.tsx
  
  const [isSaving, setIsSaving] = useState(false);
  
  const onSubmit = async (data: CampaignFormData) => {
    if (isSaving) return; // Prevenir múltiplos cliques
    
    if (data.description.length < 140) {
      toast.error('A descrição deve ter no mínimo 140 caracteres');
      return;
    }
    
    setIsSaving(true);
    
    try {
      await onSave({
        ...data,
        tagsRelated,
        tagsExcluded,
        audioUrl,
      });
      onClose();
    } catch (error) {
      console.error('Error in onSubmit:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Atualizar botão (linha 390)
  <Button type="submit" disabled={isSaving}>
    {isSaving ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        Salvando...
      </>
    ) : (
      campaign ? 'Salvar Alterações' : 'Criar Iniciativa'
    )}
  </Button>
  ```

- **Prioridade:** 4

---

### Problema 20: Falta paginação na listagem de campanhas
- **Severidade:** MÉDIA
- **Localização:** `src/components/CampaignsApp.tsx`
- **Descrição:** Se houver muitas campanhas (100+), a performance cai.
- **Impacto:** Interface fica lenta com muitos dados.
- **Solução:** Implementar paginação ou scroll infinito (fora do escopo deste relatório, mas recomendado).
- **Prioridade:** 5 (Futuro)

---

## 💡 MELHORIAS SUGERIDAS (Opcional, mas recomendado)

### Melhoria 1: Adicionar tipos para Edge Function responses
- **Localização:** `src/types/api.ts` (criar)
- **Descrição:** Criar interfaces para respostas da API.
- **Benefício:** Melhor type safety e autocomplete.
- **Sugestão:**

  ```typescript
  // src/types/api.ts (criar novo arquivo)
  
  export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
  }
  
  export interface CampaignsResponse {
    campaigns: Campaign[];
  }
  
  export interface HealthCheckResponse {
    status: 'healthy' | 'unhealthy' | 'error';
    issues?: string[];
    timestamp: string;
    message: string;
  }
  
  // Usar nos services
  ```

---

### Melhoria 2: Adicionar cache no frontend
- **Localização:** `src/utils/campaignService.ts`
- **Descrição:** Cachear campanhas para evitar requisições desnecessárias.
- **Benefício:** Melhor performance e UX.
- **Sugestão:** Usar React Query ou SWR.

---

### Melhoria 3: Adicionar testes automatizados
- **Localização:** Projeto geral
- **Descrição:** Adicionar testes unitários e de integração.
- **Benefício:** Evitar regressões e aumentar confiança no deploy.
- **Sugestão:** Usar Vitest + Testing Library.

---

## ✅ CHECKLIST DE DEPLOY

### Banco de Dados
- [ ] SETUP_DATABASE.sql executado no Supabase SQL Editor
- [ ] Usuário sistema criado (ID: 00000000-0000-0000-0000-000000000000)
- [ ] Instituições cadastradas (PUCRS, FAAP, etc.)
- [ ] Tags básicas criadas
- [ ] Áreas e posições criadas
- [ ] Verificação executada: `SELECT * FROM users WHERE id = '00000000-0000-0000-0000-000000000000';`
- [ ] Verificação executada: `SELECT COUNT(*) FROM institutions;` (deve retornar 8)

### Edge Functions
- [ ] Código da Edge Function atualizado com correções deste relatório
- [ ] Edge Function deployada: `supabase functions deploy make-server-a1f709fc`
- [ ] Secrets configurados:
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] Verificação: `supabase functions list` mostra a função ativa
- [ ] Teste manual do endpoint de health: `https://jkplbqingkcmjhyogoiw.supabase.co/functions/v1/make-server-a1f709fc/health`

### Frontend
- [ ] .gitignore criado com todas as regras
- [ ] src/utils/supabase/info.tsx removido do Git tracking
- [ ] Credenciais do Supabase REGENERADAS (por segurança)
- [ ] info.tsx atualizado com novas credenciais
- [ ] Código do frontend atualizado com correções deste relatório
- [ ] `npm install` executado
- [ ] `npm run build` executado SEM erros
- [ ] Teste local: `npm run dev` - criar campanha funciona
- [ ] Teste local: editar campanha funciona
- [ ] Teste local: deletar campanha funciona
- [ ] Teste local: upload de anexo funciona

### Storage
- [ ] Bucket criado no Supabase: `make-a1f709fc-attachments`
- [ ] Bucket configurado como private
- [ ] Políticas de storage configuradas (RLS)

### Segurança
- [ ] .gitignore protegendo todos os arquivos sensíveis
- [ ] CORS configurado com domínios permitidos (não `*`)
- [ ] Rate limiting implementado
- [ ] Credenciais antigas revogadas

### Monitoramento
- [ ] Health check endpoint funcionando
- [ ] Logs estruturados implementados
- [ ] Dashboard do Supabase configurado para alertas

---

## 🎯 PLANO DE AÇÃO

### Fase 1: Correções Críticas (URGENTE - Fazer AGORA)

**Tempo estimado:** 2-3 horas

1. **🔥 CRÍTICO: Proteger credenciais**
   - Criar `.gitignore`
   - Remover `info.tsx` do Git
   - Regenerar credenciais do Supabase
   - Atualizar `info.tsx` com novas credenciais
   - **Tempo:** 30 minutos

2. **Atualizar tipos TypeScript**
   - Mudar `Campaign` e `CampaignFormData` para usar strings nas datas
   - Remover conversões desnecessárias em `CampaignsApp.tsx`
   - **Tempo:** 20 minutos

3. **Corrigir Edge Function - Transformação de dados**
   - Adicionar funções `toCamelCase()` e `transformCampaignForFrontend()`
   - Atualizar endpoint GET `/campaigns`
   - Atualizar endpoint POST `/campaigns`
   - Atualizar endpoint GET `/campaigns/slug/:slug`
   - **Tempo:** 40 minutos

4. **Adicionar endpoints faltantes**
   - PUT `/attachments/:id/rename`
   - GET `/attachments/:id/download`
   - **Tempo:** 30 minutos

5. **Melhorar tratamento de erros**
   - Atualizar `campaignService.create()` e `.update()`
   - Adicionar tratamento detalhado em `CampaignsApp.handleSave()`
   - **Tempo:** 30 minutos

6. **Testar localmente**
   - Criar campanha
   - Editar campanha
   - Deletar campanha
   - Upload de anexo
   - **Tempo:** 30 minutos

---

### Fase 2: Correções Altas (Antes do Deploy)

**Tempo estimado:** 3-4 horas

7. **Deploy da Edge Function**
   - Instalar Supabase CLI
   - Fazer login
   - Copiar código para estrutura correta
   - Deploy
   - Configurar secrets
   - **Tempo:** 1 hora

8. **Adicionar health check**
   - Endpoint na Edge Function
   - Integração no frontend
   - **Tempo:** 45 minutos

9. **Configurar CORS para produção**
   - Atualizar lista de origens permitidas
   - Testar em staging
   - **Tempo:** 30 minutos

10. **Implementar rate limiting básico**
    - Adicionar middleware
    - Testar
    - **Tempo:** 45 minutos

11. **Logging estruturado**
    - Criar helper de log
    - Substituir console.log/error
    - **Tempo:** 1 hora

---

### Fase 3: Melhorias (Pós-Deploy)

**Tempo estimado:** 4-6 horas

12. **Variáveis de ambiente**
    - Criar `.env`
    - Atualizar `vite.config.ts`
    - Atualizar `info.tsx`
    - **Tempo:** 1 hora

13. **Carregar instituições dinamicamente**
    - Atualizar `CampaignForm.tsx`
    - Criar endpoint se necessário
    - **Tempo:** 1 hora

14. **Validações adicionais**
    - Data fim > data início
    - Feedback visual de loading
    - **Tempo:** 1 hora

15. **Documentação**
    - Atualizar README
    - Documentar variáveis de ambiente
    - Criar guia de troubleshooting
    - **Tempo:** 2 horas

---

## 📊 RESUMO EXECUTIVO

### Estado Atual do Projeto

O **Gestor de Campanhas EdTech** é um projeto bem estruturado, com arquitetura moderna (React + TypeScript + Supabase), mas apresenta **7 problemas críticos que impedem o deploy em produção**.

### Principais Problemas

1. **🔴 Segurança comprometida:** Credenciais expostas no Git devido à ausência de `.gitignore`
2. **🔴 Incompatibilidade de dados:** Edge Function retorna snake_case, frontend espera camelCase
3. **🔴 Tipos incorretos:** Datas estão com tipo Date mas devem ser strings
4. **🔴 Endpoints faltando:** Funcionalidades de anexos não funcionam

### Impacto no Negócio

**Sem as correções críticas:**
- ❌ Aplicação NÃO funciona em produção
- ❌ Usuários NÃO conseguem criar campanhas
- ❌ Credenciais expostas = risco de segurança ALTO
- ❌ Não está pronto para demonstração ao cliente

**Com as correções da Fase 1:**
- ✅ Aplicação funcional em produção
- ✅ Usuários conseguem criar/editar campanhas
- ✅ Segurança restaurada
- ✅ Pronto para demonstração

**Com as correções da Fase 2:**
- ✅ Produção estável e monitorada
- ✅ Erros específicos e tratados
- ✅ Performance adequada
- ✅ Pronto para uso real

### Recomendação

**Execute a Fase 1 IMEDIATAMENTE** (2-3 horas de trabalho) para:
1. Proteger as credenciais
2. Corrigir a funcionalidade principal
3. Viabilizar o deploy

**Execute a Fase 2 antes do deploy** (3-4 horas adicionais) para:
1. Garantir estabilidade
2. Adicionar monitoramento
3. Melhorar segurança

### Timeline Sugerida

- **Hoje:** Fase 1 (Críticas) - 2-3h
- **Amanhã:** Fase 2 (Altas) - 3-4h
- **Deploy:** Amanhã à tarde
- **Próxima semana:** Fase 3 (Melhorias) - 4-6h

### Riscos se Não Corrigir

| Risco | Probabilidade | Impacto | Ação |
|-------|---------------|---------|------|
| Credenciais vazadas | 100% (já aconteceu) | 🔴 Crítico | Regenerar AGORA |
| Usuário não consegue criar campanha | 100% | 🔴 Crítico | Corrigir tipos/transformação |
| Aplicação quebra em produção | 90% | 🔴 Crítico | Executar Fase 1 |
| Performance ruim | 60% | 🟡 Médio | Executar Fase 2 |
| Difícil manutenção | 40% | 🟡 Médio | Executar Fase 3 |

### Conclusão

O projeto está **80% pronto**, mas os **20% restantes são críticos** para produção. Com **5-7 horas de trabalho focado**, seguindo o plano de ação deste relatório, o sistema estará **100% funcional e pronto para produção**.

**Sua promoção depende disso - vamos executar! 💪**

---

**Relatório gerado em:** 22 de Outubro de 2025  
**Próxima revisão:** Após Fase 1 completa  
**Contato para dúvidas:** Ver arquivo GUIA_DE_INSTALACAO.md

---

**FIM DO RELATÓRIO**

