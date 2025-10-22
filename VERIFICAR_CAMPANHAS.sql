-- ============================================
-- VERIFICAR SE AS CAMPANHAS FORAM SALVAS
-- ============================================

-- 1. Ver todas as campanhas no banco
SELECT 
    'TOTAL DE CAMPANHAS' as info,
    COUNT(*) as quantidade
FROM campaigns;

-- 2. Listar últimas campanhas (se houver)
SELECT 
    id,
    name as nome,
    slug,
    status,
    institution_id,
    created_at as criado_em
FROM campaigns
ORDER BY created_at DESC
LIMIT 10;

-- 3. Verificar campanhas COM instituição
SELECT 
    c.id,
    c.name as campanha,
    i.name as instituicao,
    c.status,
    c.start_date as inicio,
    c.end_date as fim,
    c.created_at
FROM campaigns c
LEFT JOIN institutions i ON c.institution_id = i.id
ORDER BY c.created_at DESC
LIMIT 10;

-- 4. Verificar se há campanhas órfãs (sem instituição)
SELECT 
    'CAMPANHAS SEM INSTITUIÇÃO' as problema,
    COUNT(*) as quantidade
FROM campaigns
WHERE institution_id IS NULL;


