-- ========================================================================
-- SCRIPT DE CORREÇÃO DO BANCO DE DADOS
-- Sistema: Campanhas EdTech (sem autenticação)
-- Objetivo: Remover dependências de campos de usuário dos triggers
-- ========================================================================

-- ========================================================================
-- 1. CRIAR USUÁRIO SISTEMA PRIMEIRO (CRÍTICO!)
-- ========================================================================

-- Criar usuário sistema ANTES de tudo para evitar erros de foreign key
INSERT INTO users (id, email, name, role, position)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'system@campanhas-edtech.app',
    'Sistema',
    'admin',
    'Sistema'
)
ON CONFLICT (id) DO NOTHING;

-- ========================================================================
-- 2. DESABILITAR TRIGGERS ANTIGOS
-- ========================================================================

DROP TRIGGER IF EXISTS trigger_log_campaign_changes ON campaigns;
DROP TRIGGER IF EXISTS trigger_notification_on_mention ON comments;
DROP TRIGGER IF EXISTS trigger_notification_on_reply ON comments;

-- Manter apenas o trigger de slug (este funciona sem user_id)
-- DROP TRIGGER IF EXISTS trigger_set_campaign_slug ON campaigns; -- NÃO REMOVER

-- ========================================================================
-- 3. REMOVER FUNÇÕES ANTIGAS
-- ========================================================================

DROP FUNCTION IF EXISTS log_campaign_changes();
DROP FUNCTION IF EXISTS create_notification_on_mention();
DROP FUNCTION IF EXISTS create_notification_on_reply();
DROP FUNCTION IF EXISTS notify_expiring_campaigns();

-- ========================================================================
-- 4. REMOVER VIEWS ANTIGAS COM REFERÊNCIAS A USUÁRIOS
-- ========================================================================

DROP VIEW IF EXISTS vw_campaigns_full CASCADE;
DROP VIEW IF EXISTS vw_comments_full CASCADE;
DROP VIEW IF EXISTS vw_recent_activity CASCADE;

-- ========================================================================
-- 5. REMOVER CONSTRAINTS DE FOREIGN KEY (SISTEMA SEM AUTENTICAÇÃO)
-- ========================================================================

-- Como o sistema agora é aberto (sem autenticação), removemos as constraints
-- de foreign key para permitir maior flexibilidade
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_created_by_user_id_fkey;
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_assigned_to_user_id_fkey;

ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

ALTER TABLE attachments DROP CONSTRAINT IF EXISTS attachments_uploaded_by_fkey;

ALTER TABLE campaign_audit DROP CONSTRAINT IF EXISTS campaign_audit_user_id_fkey;

-- ========================================================================
-- 6. TORNAR CAMPOS DE USUÁRIO NULLABLE
-- ========================================================================

-- Remover constraints NOT NULL dos campos de usuário
ALTER TABLE campaigns ALTER COLUMN created_by_user_id DROP NOT NULL;
ALTER TABLE campaigns ALTER COLUMN assigned_to_user_id DROP NOT NULL;

ALTER TABLE comments ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE attachments ALTER COLUMN uploaded_by DROP NOT NULL;

ALTER TABLE campaign_audit ALTER COLUMN user_id DROP NOT NULL;

-- ========================================================================
-- 7. SETAR VALORES PADRÃO PARA CAMPOS DE USUÁRIO
-- ========================================================================

-- UUID do usuário sistema (já criado na etapa 1)
UPDATE campaigns 
SET created_by_user_id = '00000000-0000-0000-0000-000000000000'
WHERE created_by_user_id IS NULL;

UPDATE campaigns 
SET assigned_to_user_id = '00000000-0000-0000-0000-000000000000'
WHERE assigned_to_user_id IS NULL;

UPDATE comments 
SET user_id = '00000000-0000-0000-0000-000000000000'
WHERE user_id IS NULL;

UPDATE attachments 
SET uploaded_by = '00000000-0000-0000-0000-000000000000'
WHERE uploaded_by IS NULL;

UPDATE campaign_audit 
SET user_id = '00000000-0000-0000-0000-000000000000'
WHERE user_id IS NULL;

-- ========================================================================
-- 8. INSERIR DADOS INICIAIS - INSTITUIÇÕES
-- ========================================================================

INSERT INTO institutions (id, name, slug, short_name, is_active, sort_order) VALUES
(1, 'PUCRS', 'pucrs', 'PUCRS', true, 1),
(2, 'PUCRS Grad', 'pucrs-grad', 'PUCRS Grad', true, 2),
(3, 'FAAP', 'faap', 'FAAP', true, 3),
(4, 'FIA Online', 'fia-online', 'FIA Online', true, 4),
(5, 'UNESC', 'unesc', 'UNESC', true, 5),
(6, 'Santa Casa SP', 'santa-casa-sp', 'Santa Casa', true, 6),
(7, 'Impacta', 'impacta', 'Impacta', true, 7),
(8, 'FSL Digital', 'fsl-digital', 'FSL Digital', true, 8)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    short_name = EXCLUDED.short_name,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order;

-- ========================================================================
-- 9. INSERIR DADOS INICIAIS - TAGS
-- ========================================================================

INSERT INTO tags (name, category) VALUES
('graduação', 'nivel'),
('pós-graduação', 'nivel'),
('MBA', 'nivel'),
('EAD', 'modalidade'),
('presencial', 'modalidade'),
('híbrido', 'modalidade'),
('desconto', 'beneficio'),
('bolsa', 'beneficio'),
('parcelamento', 'beneficio'),
('vestibular', 'processo'),
('transferência', 'processo'),
('segunda graduação', 'processo'),
('medicina', 'area'),
('engenharia', 'area'),
('direito', 'area'),
('administração', 'area'),
('tecnologia', 'area'),
('saúde', 'area')
ON CONFLICT (name) DO NOTHING;

-- ========================================================================
-- 10. CRIAR TRIGGER SIMPLIFICADO DE AUDITORIA (OPCIONAL)
-- ========================================================================

-- Função simplificada de log sem referências obrigatórias a user_id
CREATE OR REPLACE FUNCTION log_campaign_changes_simple()
RETURNS TRIGGER AS $$
BEGIN
    -- INSERT: log de criação
    IF TG_OP = 'INSERT' THEN
        INSERT INTO campaign_audit (
            campaign_id, 
            action_type, 
            changes_json,
            user_id
        ) VALUES (
            NEW.id,
            'created',
            to_jsonb(NEW),
            NEW.created_by_user_id  -- Agora é nullable/tem valor padrão
        );
        
    -- UPDATE: log de alterações principais
    ELSIF TG_OP = 'UPDATE' THEN
        
        -- Status mudou
        IF OLD.status != NEW.status THEN
            INSERT INTO campaign_audit (
                campaign_id, action_type, field_name,
                old_value, new_value, user_id
            ) VALUES (
                NEW.id, 'status_changed', 'status',
                OLD.status, NEW.status, NEW.assigned_to_user_id
            );
            
            -- Atualiza timestamps específicos
            IF NEW.status = 'published' AND OLD.status != 'published' THEN
                NEW.published_at := CURRENT_TIMESTAMP;
            ELSIF NEW.status = 'archived' AND OLD.status != 'archived' THEN
                NEW.archived_at := CURRENT_TIMESTAMP;
            END IF;
        END IF;
        
        -- Nome mudou
        IF OLD.name IS DISTINCT FROM NEW.name THEN
            INSERT INTO campaign_audit (
                campaign_id, action_type, field_name, 
                old_value, new_value, user_id
            ) VALUES (
                NEW.id, 'updated', 'name',
                OLD.name, NEW.name, NEW.assigned_to_user_id
            );
        END IF;
        
        -- Descrição mudou
        IF OLD.description IS DISTINCT FROM NEW.description THEN
            INSERT INTO campaign_audit (
                campaign_id, action_type, field_name,
                old_value, new_value, user_id
            ) VALUES (
                NEW.id, 'updated', 'description',
                LEFT(COALESCE(OLD.description, ''), 200), 
                LEFT(COALESCE(NEW.description, ''), 200),
                NEW.assigned_to_user_id
            );
        END IF;
        
        -- Datas mudaram
        IF OLD.start_date IS DISTINCT FROM NEW.start_date OR OLD.end_date IS DISTINCT FROM NEW.end_date THEN
            INSERT INTO campaign_audit (
                campaign_id, action_type, field_name,
                old_value, new_value, user_id,
                changes_json
            ) VALUES (
                NEW.id, 'updated', 'dates',
                OLD.start_date::TEXT || ' - ' || OLD.end_date::TEXT,
                NEW.start_date::TEXT || ' - ' || NEW.end_date::TEXT,
                NEW.assigned_to_user_id,
                jsonb_build_object(
                    'old_start_date', OLD.start_date,
                    'old_end_date', OLD.end_date,
                    'new_start_date', NEW.start_date,
                    'new_end_date', NEW.end_date
                )
            );
        END IF;
        
        -- Incrementa versão
        NEW.version := OLD.version + 1;
        
    -- DELETE: log de exclusão
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO campaign_audit (
            campaign_id, action_type, user_id
        ) VALUES (
            OLD.id, 'deleted', OLD.assigned_to_user_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger simplificado
CREATE TRIGGER trigger_log_campaign_changes_simple
BEFORE INSERT OR UPDATE OR DELETE ON campaigns
FOR EACH ROW EXECUTE FUNCTION log_campaign_changes_simple();

-- ========================================================================
-- 11. CRIAR VIEW SIMPLIFICADA DE CAMPANHAS
-- ========================================================================

CREATE OR REPLACE VIEW vw_campaigns_simple AS
SELECT 
    c.id,
    c.slug,
    c.name,
    c.description,
    c.start_date,
    c.end_date,
    c.status,
    c.priority,
    c.version,
    
    -- Instituição
    i.name AS institution_name,
    i.slug AS institution_slug,
    i.short_name AS institution_short_name,
    i.logo_url AS institution_logo,
    
    -- Contadores
    c.attachments_count,
    c.comments_count,
    c.views_count,
    
    -- Tags positivas (relacionadas)
    (
        SELECT ARRAY_AGG(t.name ORDER BY t.name)
        FROM campaign_tags ct
        JOIN tags t ON ct.tag_id = t.id
        WHERE ct.campaign_id = c.id AND ct.relation_type = 'related'
    ) AS tags_related,
    
    -- Tags negativas (excluídas)
    (
        SELECT ARRAY_AGG(t.name ORDER BY t.name)
        FROM campaign_tags ct
        JOIN tags t ON ct.tag_id = t.id
        WHERE ct.campaign_id = c.id AND ct.relation_type = 'excluded'
    ) AS tags_excluded,
    
    -- Datas
    c.created_at,
    c.updated_at,
    c.published_at,
    c.archived_at,
    
    -- Flags úteis
    CASE 
        WHEN c.end_date < CURRENT_DATE THEN TRUE 
        ELSE FALSE 
    END AS is_expired,
    
    CASE 
        WHEN c.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days' 
        THEN TRUE 
        ELSE FALSE 
    END AS is_expiring_soon,
    
    CASE 
        WHEN c.start_date <= CURRENT_DATE AND c.end_date >= CURRENT_DATE 
        THEN TRUE 
        ELSE FALSE 
    END AS is_active_now

FROM campaigns c
JOIN institutions i ON c.institution_id = i.id
WHERE c.deleted_at IS NULL;

COMMENT ON VIEW vw_campaigns_simple IS 'View simplificada de campanhas sem referências a usuários';

-- ========================================================================
-- 12. CRIAR VIEW DE ESTATÍSTICAS POR INSTITUIÇÃO
-- ========================================================================

CREATE OR REPLACE VIEW vw_institution_stats AS
SELECT 
    i.id,
    i.name,
    i.slug,
    
    -- Contadores
    COUNT(DISTINCT c.id) AS total_campaigns,
    COUNT(DISTINCT CASE WHEN c.status = 'published' THEN c.id END) AS published_campaigns,
    COUNT(DISTINCT CASE WHEN c.status = 'draft' THEN c.id END) AS draft_campaigns,
    COUNT(DISTINCT CASE WHEN c.status = 'archived' THEN c.id END) AS archived_campaigns,
    
    -- Campanhas ativas agora
    COUNT(DISTINCT CASE 
        WHEN c.status = 'published' 
        AND c.start_date <= CURRENT_DATE 
        AND c.end_date >= CURRENT_DATE 
        THEN c.id 
    END) AS active_now,
    
    -- Totais agregados
    COALESCE(SUM(c.views_count), 0) AS total_views,
    COALESCE(SUM(c.comments_count), 0) AS total_comments,
    COALESCE(SUM(c.attachments_count), 0) AS total_attachments,
    
    -- Datas
    MIN(c.created_at) AS first_campaign_date,
    MAX(c.created_at) AS last_campaign_date

FROM institutions i
LEFT JOIN campaigns c ON i.id = c.institution_id AND c.deleted_at IS NULL
WHERE i.is_active = TRUE
GROUP BY i.id, i.name, i.slug
ORDER BY i.sort_order;

COMMENT ON VIEW vw_institution_stats IS 'Estatísticas agregadas por instituição';

-- ========================================================================
-- 13. VERIFICAR INTEGRIDADE
-- ========================================================================

-- Verificar se todas as campanhas têm instituição válida
SELECT 'ERRO: Campanhas sem instituição' AS issue, COUNT(*) AS count
FROM campaigns c
LEFT JOIN institutions i ON c.institution_id = i.id
WHERE i.id IS NULL AND c.deleted_at IS NULL;

-- Verificar se há slugs duplicados
SELECT 'ERRO: Slugs duplicados' AS issue, slug, COUNT(*) AS count
FROM campaigns
WHERE deleted_at IS NULL
GROUP BY slug
HAVING COUNT(*) > 1;

-- Verificar se usuário sistema existe
SELECT 'OK: Usuário sistema criado' AS status, COUNT(*) AS count
FROM users
WHERE id = '00000000-0000-0000-0000-000000000000';

-- ========================================================================
-- 14. RESUMO DE ESTATÍSTICAS
-- ========================================================================

SELECT 
    'Campanhas' AS tabela,
    COUNT(*) AS total,
    COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) AS ativas,
    COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) AS deletadas
FROM campaigns

UNION ALL

SELECT 
    'Comentários' AS tabela,
    COUNT(*) AS total,
    COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) AS ativas,
    COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) AS deletadas
FROM comments

UNION ALL

SELECT 
    'Anexos' AS tabela,
    COUNT(*) AS total,
    COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) AS ativas,
    COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) AS deletadas
FROM attachments

UNION ALL

SELECT 
    'Instituições' AS tabela,
    COUNT(*) AS total,
    COUNT(CASE WHEN is_active THEN 1 END) AS ativas,
    COUNT(CASE WHEN NOT is_active THEN 1 END) AS inativas
FROM institutions

UNION ALL

SELECT 
    'Tags' AS tabela,
    COUNT(*) AS total,
    NULL AS ativas,
    NULL AS deletadas
FROM tags;

-- ========================================================================
-- FIM DO SCRIPT
-- ========================================================================

-- EXECUTAR NO SUPABASE:
-- 1. Acesse o painel do Supabase
-- 2. Vá em "SQL Editor"
-- 3. Cole este script completo
-- 4. Execute (Run)
-- 5. Verifique os resultados finais (estatísticas e verificações)
