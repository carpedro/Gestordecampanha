-- =====================================================
-- SCRIPT DE VERIFICAÇÃO - GESTOR DE CAMPANHAS
-- =====================================================
-- Execute este script após SETUP_DATABASE.sql
-- para verificar se tudo está configurado corretamente
-- =====================================================

\echo '================================'
\echo '🔍 VERIFICAÇÃO DO BANCO DE DADOS'
\echo '================================'
\echo ''

-- =====================================================
-- 1. VERIFICAR EXTENSÕES
-- =====================================================

\echo '1️⃣ Extensões Instaladas:'
SELECT 
    extname as "Extensão",
    extversion as "Versão"
FROM pg_extension
WHERE extname IN ('unaccent', 'uuid-ossp')
ORDER BY extname;

\echo ''

-- =====================================================
-- 2. VERIFICAR TABELAS
-- =====================================================

\echo '2️⃣ Tabelas Criadas:'
SELECT 
    table_name as "Tabela",
    (SELECT COUNT(*) 
     FROM information_schema.columns 
     WHERE columns.table_name = tables.table_name 
     AND columns.table_schema = 'public') as "Colunas"
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

\echo ''

-- =====================================================
-- 3. VERIFICAR DADOS SEED
-- =====================================================

\echo '3️⃣ Dados Iniciais (Seeds):'
\echo ''

\echo '📍 Posições:'
SELECT 
    COUNT(*) as "Total",
    STRING_AGG(name, ', ' ORDER BY sort_order) as "Posições"
FROM positions;

\echo ''
\echo '📊 Áreas:'
SELECT 
    COUNT(*) as "Total",
    STRING_AGG(name, ', ' ORDER BY sort_order) as "Áreas"
FROM areas;

\echo ''
\echo '🏫 Instituições:'
SELECT 
    COUNT(*) as "Total",
    STRING_AGG(name, ', ' ORDER BY sort_order) as "Instituições"
FROM institutions;

\echo ''
\echo '🏷️ Tags:'
SELECT 
    COUNT(*) as "Total",
    STRING_AGG(name, ', ') as "Tags"
FROM tags;

\echo ''

-- =====================================================
-- 4. VERIFICAR USUÁRIO SISTEMA
-- =====================================================

\echo '4️⃣ Usuário Sistema:'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM users 
            WHERE id = '00000000-0000-0000-0000-000000000000'
        ) THEN '✅ CRIADO'
        ELSE '❌ NÃO ENCONTRADO'
    END as "Status",
    (SELECT name FROM users WHERE id = '00000000-0000-0000-0000-000000000000') as "Nome",
    (SELECT email FROM users WHERE id = '00000000-0000-0000-0000-000000000000') as "Email",
    (SELECT role FROM users WHERE id = '00000000-0000-0000-0000-000000000000') as "Role";

\echo ''

-- =====================================================
-- 5. VERIFICAR ÍNDICES
-- =====================================================

\echo '5️⃣ Índices Criados:'
SELECT 
    COUNT(*) as "Total de Índices"
FROM pg_indexes
WHERE schemaname = 'public';

\echo ''

-- =====================================================
-- 6. VERIFICAR TRIGGERS
-- =====================================================

\echo '6️⃣ Triggers Criados:'
SELECT 
    trigger_name as "Trigger",
    event_object_table as "Tabela",
    action_timing as "Timing"
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

\echo ''

-- =====================================================
-- 7. VERIFICAR FUNÇÕES
-- =====================================================

\echo '7️⃣ Funções Criadas:'
SELECT 
    routine_name as "Função",
    routine_type as "Tipo"
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('update_updated_at_column', 'generate_slug', 'sync_campaign_institution')
ORDER BY routine_name;

\echo ''

-- =====================================================
-- 8. VERIFICAR FOREIGN KEYS
-- =====================================================

\echo '8️⃣ Foreign Keys:'
SELECT 
    COUNT(*) as "Total de FKs"
FROM information_schema.table_constraints
WHERE constraint_schema = 'public'
AND constraint_type = 'FOREIGN KEY';

\echo ''

-- =====================================================
-- 9. VERIFICAR STORAGE (se existir)
-- =====================================================

\echo '9️⃣ Storage Buckets:'
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM storage.buckets 
            WHERE name = 'make-a1f709fc-attachments'
        ) THEN '✅ CRIADO'
        ELSE '⚠️ NÃO ENCONTRADO (criar manualmente)'
    END as "Bucket Status";

\echo ''

-- =====================================================
-- 10. RESUMO FINAL
-- =====================================================

\echo '================================'
\echo '📊 RESUMO DA VERIFICAÇÃO'
\echo '================================'

SELECT 
    'Tabelas' as "Item",
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as "Quantidade",
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.tables 
              WHERE table_schema = 'public' AND table_type = 'BASE TABLE') >= 15 
        THEN '✅ OK' 
        ELSE '❌ FALTA' 
    END as "Status"
UNION ALL
SELECT 
    'Posições' as "Item",
    (SELECT COUNT(*) FROM positions) as "Quantidade",
    CASE 
        WHEN (SELECT COUNT(*) FROM positions) >= 8 
        THEN '✅ OK' 
        ELSE '❌ FALTA' 
    END as "Status"
UNION ALL
SELECT 
    'Áreas' as "Item",
    (SELECT COUNT(*) FROM areas) as "Quantidade",
    CASE 
        WHEN (SELECT COUNT(*) FROM areas) >= 7 
        THEN '✅ OK' 
        ELSE '❌ FALTA' 
    END as "Status"
UNION ALL
SELECT 
    'Instituições' as "Item",
    (SELECT COUNT(*) FROM institutions) as "Quantidade",
    CASE 
        WHEN (SELECT COUNT(*) FROM institutions) >= 8 
        THEN '✅ OK' 
        ELSE '❌ FALTA' 
    END as "Status"
UNION ALL
SELECT 
    'Tags' as "Item",
    (SELECT COUNT(*) FROM tags) as "Quantidade",
    CASE 
        WHEN (SELECT COUNT(*) FROM tags) >= 10 
        THEN '✅ OK' 
        ELSE '⚠️ POUCAS' 
    END as "Status"
UNION ALL
SELECT 
    'Usuário Sistema' as "Item",
    1 as "Quantidade",
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM users 
            WHERE id = '00000000-0000-0000-0000-000000000000'
        ) 
        THEN '✅ OK' 
        ELSE '❌ FALTA' 
    END as "Status"
UNION ALL
SELECT 
    'Índices' as "Item",
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as "Quantidade",
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') >= 20 
        THEN '✅ OK' 
        ELSE '⚠️ POUCOS' 
    END as "Status"
UNION ALL
SELECT 
    'Triggers' as "Item",
    (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') as "Quantidade",
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') >= 8 
        THEN '✅ OK' 
        ELSE '⚠️ POUCOS' 
    END as "Status";

\echo ''
\echo '================================'

-- =====================================================
-- 11. TESTE DE CRIAÇÃO (OPCIONAL)
-- =====================================================

\echo ''
\echo '🧪 TESTE RÁPIDO (opcional):'
\echo 'Para testar se tudo funciona, execute:'
\echo ''
\echo 'INSERT INTO campaigns (name, slug, institution, institution_id, description, start_date, end_date, created_by_user_id, assigned_to_user_id)'
\echo 'VALUES ('
\echo '  ''Campanha Teste'','
\echo '  ''campanha-teste'','
\echo '  ''PUCRS'','
\echo '  (SELECT id FROM institutions WHERE name = ''PUCRS''),'
\echo '  ''Esta é uma campanha de teste'','
\echo '  CURRENT_DATE,'
\echo '  CURRENT_DATE + INTERVAL ''30 days'','
\echo '  ''00000000-0000-0000-0000-000000000000'','
\echo '  ''00000000-0000-0000-0000-000000000000'''
\echo ');'
\echo ''
\echo 'SELECT id, name, slug, institution, status FROM campaigns WHERE slug = ''campanha-teste'';'
\echo ''
\echo '-- Para remover o teste:'
\echo 'DELETE FROM campaigns WHERE slug = ''campanha-teste'';'
\echo ''

-- =====================================================
-- MENSAGEM FINAL
-- =====================================================

DO $$
DECLARE
    total_ok INTEGER;
    total_checks INTEGER := 8;
BEGIN
    -- Contar quantos checks passaram
    SELECT COUNT(*) INTO total_ok
    FROM (
        SELECT 
            CASE 
                WHEN (SELECT COUNT(*) FROM information_schema.tables 
                      WHERE table_schema = 'public' AND table_type = 'BASE TABLE') >= 15 
                THEN 1 ELSE 0 
            END
        UNION ALL
        SELECT 
            CASE 
                WHEN (SELECT COUNT(*) FROM positions) >= 8 
                THEN 1 ELSE 0 
            END
        UNION ALL
        SELECT 
            CASE 
                WHEN (SELECT COUNT(*) FROM areas) >= 7 
                THEN 1 ELSE 0 
            END
        UNION ALL
        SELECT 
            CASE 
                WHEN (SELECT COUNT(*) FROM institutions) >= 8 
                THEN 1 ELSE 0 
            END
        UNION ALL
        SELECT 
            CASE 
                WHEN (SELECT COUNT(*) FROM tags) >= 10 
                THEN 1 ELSE 0 
            END
        UNION ALL
        SELECT 
            CASE 
                WHEN EXISTS (
                    SELECT 1 FROM users 
                    WHERE id = '00000000-0000-0000-0000-000000000000'
                ) 
                THEN 1 ELSE 0 
            END
        UNION ALL
        SELECT 
            CASE 
                WHEN (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') >= 20 
                THEN 1 ELSE 0 
            END
        UNION ALL
        SELECT 
            CASE 
                WHEN (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') >= 8 
                THEN 1 ELSE 0 
            END
    ) as checks
    WHERE checks.case = 1;
    
    RAISE NOTICE '';
    RAISE NOTICE '================================';
    IF total_ok = total_checks THEN
        RAISE NOTICE '✅ VERIFICAÇÃO COMPLETA: %/% CHECKS PASSARAM', total_ok, total_checks;
        RAISE NOTICE '🎉 BANCO DE DADOS CONFIGURADO CORRETAMENTE!';
        RAISE NOTICE '';
        RAISE NOTICE '📝 Próximos passos:';
        RAISE NOTICE '1. Deploy da Edge Function';
        RAISE NOTICE '2. Configurar src/utils/supabase/info.tsx';
        RAISE NOTICE '3. Rodar npm install && npm run dev';
    ELSE
        RAISE NOTICE '⚠️ ATENÇÃO: %/% CHECKS PASSARAM', total_ok, total_checks;
        RAISE NOTICE '❌ Alguns itens precisam de atenção!';
        RAISE NOTICE '';
        RAISE NOTICE '💡 Verifique os itens marcados com ❌ ou ⚠️ acima';
        RAISE NOTICE '📖 Consulte GUIA_DE_INSTALACAO.md para ajuda';
    END IF;
    RAISE NOTICE '================================';
    RAISE NOTICE '';
END $$;

