-- ========================================================================
-- CORREÇÃO RÁPIDA - EXECUTAR ESTE SCRIPT AGORA!
-- ========================================================================
-- Este é um script simplificado focado APENAS em corrigir o erro atual
-- ========================================================================

-- 1. CRIAR USUÁRIO SISTEMA (ESSENCIAL!)
INSERT INTO users (id, email, name, role, position)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'system@campanhas-edtech.app',
    'Sistema',
    'admin',
    'Sistema'
)
ON CONFLICT (id) DO NOTHING;

-- 2. REMOVER FOREIGN KEY CONSTRAINTS (sistema sem autenticação)
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_created_by_user_id_fkey;
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_assigned_to_user_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE attachments DROP CONSTRAINT IF EXISTS attachments_uploaded_by_fkey;
ALTER TABLE campaign_audit DROP CONSTRAINT IF EXISTS campaign_audit_user_id_fkey;

-- 3. TORNAR COLUNAS NULLABLE
ALTER TABLE campaigns ALTER COLUMN created_by_user_id DROP NOT NULL;
ALTER TABLE campaigns ALTER COLUMN assigned_to_user_id DROP NOT NULL;
ALTER TABLE comments ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE attachments ALTER COLUMN uploaded_by DROP NOT NULL;
ALTER TABLE campaign_audit ALTER COLUMN user_id DROP NOT NULL;

-- 4. ATUALIZAR REGISTROS EXISTENTES
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

-- 4. CRIAR INSTITUIÇÕES (necessário para criar campanhas)
INSERT INTO institutions (id, name, slug, short_name, is_active, sort_order) VALUES
(1, 'PUCRS', 'pucrs', 'PUCRS', true, 1),
(2, 'PUCRS Grad', 'pucrs-grad', 'PUCRS Grad', true, 2),
(3, 'FAAP', 'faap', 'FAAP', true, 3),
(4, 'FIA Online', 'fia-online', 'FIA Online', true, 4),
(5, 'UNESC', 'unesc', 'UNESC', true, 5),
(6, 'Santa Casa SP', 'santa-casa-sp', 'Santa Casa', true, 6),
(7, 'Impacta', 'impacta', 'Impacta', true, 7),
(8, 'FSL Digital', 'fsl-digital', 'FSL Digital', true, 8)
ON CONFLICT (id) DO NOTHING;

-- PRONTO! Agora você pode criar campanhas sem erros.
