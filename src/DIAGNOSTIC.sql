-- ========================================================================
-- DIAGNÓSTICO DO BANCO DE DADOS
-- Execute este script para verificar se tudo está configurado corretamente
-- ========================================================================

-- ========================================================================
-- 1. VERIFICAR SE USUÁRIO SISTEMA EXISTE
-- ========================================================================
SELECT 
    'VERIFICAÇÃO: Usuário Sistema' AS check_name,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ OK - Usuário sistema existe'
        ELSE '❌ ERRO - Usuário sistema NÃO existe! Execute /quick_fix.sql'
    END AS status,
    COUNT(*) AS count
FROM users
WHERE id = '00000000-0000-0000-0000-000000000000';

-- ========================================================================
-- 2. VERIFICAR CONSTRAINTS DE FOREIGN KEY
-- ========================================================================
SELECT 
    'VERIFICAÇÃO: Foreign Keys' AS check_name,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK - Foreign keys removidas (sistema sem autenticação)'
        ELSE '❌ ERRO - Foreign keys ainda existem! Execute /quick_fix.sql'
    END AS status,
    COUNT(*) AS count
FROM information_schema.table_constraints
WHERE table_name IN ('campaigns', 'comments', 'attachments', 'campaign_audit')
  AND constraint_type = 'FOREIGN KEY'
  AND constraint_name LIKE '%user%';

-- ========================================================================
-- 3. VERIFICAR CONSTRAINTS NOT NULL
-- ========================================================================
SELECT 
    'VERIFICAÇÃO: NOT NULL Constraints' AS check_name,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK - Colunas de usuário são NULLABLE'
        ELSE '⚠️ AVISO - Algumas colunas ainda são NOT NULL'
    END AS status,
    COUNT(*) AS count
FROM information_schema.columns
WHERE table_name IN ('campaigns', 'comments', 'attachments', 'campaign_audit')
  AND column_name IN ('created_by_user_id', 'assigned_to_user_id', 'user_id', 'uploaded_by')
  AND is_nullable = 'NO';

-- ========================================================================
-- 4. VERIFICAR INSTITUIÇÕES
-- ========================================================================
SELECT 
    'VERIFICAÇÃO: Instituições' AS check_name,
    CASE 
        WHEN COUNT(*) >= 3 THEN '✅ OK - Instituições cadastradas'
        WHEN COUNT(*) > 0 THEN '⚠️ AVISO - Poucas instituições'
        ELSE '❌ ERRO - Nenhuma instituição! Execute /database_fix.sql'
    END AS status,
    COUNT(*) AS count
FROM institutions;

-- ========================================================================
-- 5. VERIFICAR TAGS
-- ========================================================================
SELECT 
    'VERIFICAÇÃO: Tags' AS check_name,
    CASE 
        WHEN COUNT(*) >= 10 THEN '✅ OK - Tags cadastradas'
        WHEN COUNT(*) > 0 THEN '⚠️ AVISO - Poucas tags'
        ELSE '❌ ERRO - Nenhuma tag! Execute /database_fix.sql'
    END AS status,
    COUNT(*) AS count
FROM tags;

-- ========================================================================
-- 6. VERIFICAR CAMPANHAS COM PROBLEMAS
-- ========================================================================
SELECT 
    'VERIFICAÇÃO: Campanhas com user_id NULL' AS check_name,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ OK - Todas campanhas têm created_by_user_id'
        ELSE '⚠️ AVISO - Existem campanhas sem created_by_user_id (OK se colunas são NULLABLE)'
    END AS status,
    COUNT(*) AS count
FROM campaigns
WHERE created_by_user_id IS NULL;

-- ========================================================================
-- 7. VERIFICAR TRIGGERS
-- ========================================================================
SELECT 
    'VERIFICAÇÃO: Triggers Ativos' AS check_name,
    '📊 INFO - Triggers encontrados' AS status,
    COUNT(*) AS count
FROM information_schema.triggers
WHERE event_object_table IN ('campaigns', 'comments', 'attachments');

-- ========================================================================
-- 8. ESTATÍSTICAS GERAIS
-- ========================================================================
SELECT 
    '📊 ESTATÍSTICAS GERAIS' AS section,
    NULL AS check_name,
    NULL AS status,
    NULL AS count
UNION ALL
SELECT 
    NULL,
    'Total de Campanhas' AS check_name,
    NULL AS status,
    COUNT(*)::text AS count
FROM campaigns
UNION ALL
SELECT 
    NULL,
    'Total de Comentários' AS check_name,
    NULL AS status,
    COUNT(*)::text AS count
FROM comments
UNION ALL
SELECT 
    NULL,
    'Total de Anexos' AS check_name,
    NULL AS status,
    COUNT(*)::text AS count
FROM attachments
UNION ALL
SELECT 
    NULL,
    'Total de Instituições' AS check_name,
    NULL AS status,
    COUNT(*)::text AS count
FROM institutions
UNION ALL
SELECT 
    NULL,
    'Total de Tags' AS check_name,
    NULL AS status,
    COUNT(*)::text AS count
FROM tags;

-- ========================================================================
-- 9. RESUMO FINAL
-- ========================================================================
SELECT 
    '🎯 RESUMO' AS section,
    CASE 
        WHEN (
            -- Usuário sistema existe
            (SELECT COUNT(*) FROM users WHERE id = '00000000-0000-0000-0000-000000000000') > 0
            AND
            -- Foreign keys removidas
            (SELECT COUNT(*) FROM information_schema.table_constraints
             WHERE table_name IN ('campaigns', 'comments', 'attachments', 'campaign_audit')
               AND constraint_type = 'FOREIGN KEY'
               AND constraint_name LIKE '%user%') = 0
        ) THEN '✅✅✅ TUDO OK! Sistema pronto para uso!'
        ELSE '❌ ATENÇÃO! Execute /quick_fix.sql no SQL Editor'
    END AS status;

-- ========================================================================
-- FIM DO DIAGNÓSTICO
-- ========================================================================
