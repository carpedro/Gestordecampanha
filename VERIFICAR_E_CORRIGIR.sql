-- ============================================
-- VERIFICAÇÃO E CORREÇÃO DO BANCO DE DADOS
-- ============================================

-- ========================================
-- PARTE 1: VERIFICAÇÃO
-- ========================================

\echo '🔍 VERIFICANDO ESTRUTURA DO BANCO...'
\echo ''

-- 1. Verificar se as tabelas existem
\echo '1️⃣ Verificando tabelas...'
SELECT 
    CASE 
        WHEN COUNT(*) = 4 THEN '✅ Todas as tabelas existem (4/4)'
        ELSE '❌ FALTAM TABELAS! Encontradas: ' || COUNT(*) || '/4'
    END as status_tabelas
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('campaigns', 'institutions', 'users', 'edit_history');

\echo ''

-- 2. Verificar se há usuário sistema
\echo '2️⃣ Verificando usuário sistema...'
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Usuário sistema existe'
        ELSE '❌ USUÁRIO SISTEMA NÃO EXISTE!'
    END as status_user
FROM users 
WHERE id = '00000000-0000-0000-0000-000000000000';

\echo ''

-- 3. Verificar instituições
\echo '3️⃣ Verificando instituições...'
SELECT 
    COUNT(*) as total_instituicoes,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Instituições cadastradas'
        ELSE '❌ NENHUMA INSTITUIÇÃO CADASTRADA!'
    END as status_instituicoes
FROM institutions;

SELECT name as instituicao, initials as sigla FROM institutions LIMIT 5;

\echo ''

-- 4. Verificar campanhas
\echo '4️⃣ Verificando campanhas...'
SELECT 
    COUNT(*) as total_campanhas,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Campanhas cadastradas'
        ELSE '⚠️ NENHUMA CAMPANHA CADASTRADA (isso é esperado se você ainda não criou nenhuma)'
    END as status_campanhas
FROM campaigns;

-- Se houver campanhas, mostrar
SELECT 
    c.name as campanha,
    i.name as instituicao,
    c.status,
    c.created_at
FROM campaigns c
LEFT JOIN institutions i ON c.institution_id = i.id
ORDER BY c.created_at DESC
LIMIT 5;

\echo ''
\echo ''

-- ========================================
-- PARTE 2: CORREÇÃO (SE NECESSÁRIO)
-- ========================================

\echo '🔧 APLICANDO CORREÇÕES...'
\echo ''

-- Criar usuário sistema se não existir
INSERT INTO users (
    id, 
    email, 
    name, 
    full_name, 
    role, 
    position, 
    area, 
    is_active, 
    email_verified
) 
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'sistema@campanhas-edtech.app',
    'Sistema',
    'Usuário Sistema',
    'admin',
    'Sistema',
    'Tecnologia',
    TRUE,
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- Garantir que temos instituições
INSERT INTO institutions (name, initials, is_active) VALUES
    ('Pontifícia Universidade Católica do Rio Grande do Sul', 'PUCRS', true),
    ('Centro Universitário Ritter dos Reis', 'UniRitter', true),
    ('Escola de Humanidades', 'Humanidades', true),
    ('Escola Politécnica', 'Politécnica', true),
    ('Escola de Negócios', 'Negócios', true),
    ('Escola de Medicina', 'Medicina', true),
    ('Escola de Ciências da Saúde e da Vida', 'ESCVIDA', true),
    ('Escola de Direito', 'Direito', true)
ON CONFLICT (name) DO NOTHING;

\echo '✅ Correções aplicadas!'
\echo ''

-- ========================================
-- PARTE 3: VERIFICAÇÃO FINAL
-- ========================================

\echo '📊 VERIFICAÇÃO FINAL'
\echo ''

-- Resumo completo
SELECT 
    (SELECT COUNT(*) FROM users WHERE id = '00000000-0000-0000-0000-000000000000') as usuario_sistema,
    (SELECT COUNT(*) FROM institutions) as total_instituicoes,
    (SELECT COUNT(*) FROM campaigns) as total_campanhas,
    CASE 
        WHEN (SELECT COUNT(*) FROM users WHERE id = '00000000-0000-0000-0000-000000000000') > 0 
         AND (SELECT COUNT(*) FROM institutions) > 0
        THEN '✅ BANCO PRONTO PARA USO!'
        ELSE '❌ AINDA HÁ PROBLEMAS - Execute SETUP_DATABASE.sql'
    END as status_final;

\echo ''
\echo '============================================'
\echo '📋 INSTRUÇÕES:'
\echo ''
\echo 'Se o status_final for ✅ BANCO PRONTO PARA USO:'
\echo '  → Você pode criar campanhas normalmente'
\echo '  → Se as campanhas não aparecem, é problema no frontend'
\echo ''
\echo 'Se houver ❌:'
\echo '  1. Execute o arquivo SETUP_DATABASE.sql'
\echo '  2. Execute este arquivo novamente'
\echo ''
\echo 'Para criar uma campanha de teste, acesse:'
\echo '  https://campanhas.figma.site/'
\echo ''
\echo '============================================'

