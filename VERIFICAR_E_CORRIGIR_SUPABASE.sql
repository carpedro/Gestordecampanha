-- ============================================
-- VERIFICAÇÃO E CORREÇÃO DO BANCO DE DADOS
-- Versão compatível com Supabase SQL Editor
-- ============================================

-- ========================================
-- PARTE 1: VERIFICAÇÃO DAS TABELAS
-- ========================================
-- 1. Verificar se as tabelas existem
SELECT 
    '1️⃣ VERIFICANDO TABELAS' as passo,
    CASE 
        WHEN COUNT(*) = 4 THEN '✅ Todas as tabelas existem (4/4)'
        ELSE '❌ FALTAM TABELAS! Encontradas: ' || COUNT(*) || '/4'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('campaigns', 'institutions', 'users', 'edit_history');

-- 2. Verificar se há usuário sistema
SELECT 
    '2️⃣ VERIFICANDO USUÁRIO SISTEMA' as passo,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Usuário sistema existe'
        ELSE '❌ USUÁRIO SISTEMA NÃO EXISTE!'
    END as status
FROM users 
WHERE id = '00000000-0000-0000-0000-000000000000';

-- 3. Verificar instituições
SELECT 
    '3️⃣ VERIFICANDO INSTITUIÇÕES' as passo,
    COUNT(*) as total,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Instituições cadastradas'
        ELSE '❌ NENHUMA INSTITUIÇÃO CADASTRADA!'
    END as status
FROM institutions;

-- Listar as primeiras 5 instituições
SELECT 
    '📋 INSTITUIÇÕES CADASTRADAS' as info,
    name as instituicao, 
    short_name as sigla 
FROM institutions 
LIMIT 5;

-- 4. Verificar campanhas
SELECT 
    '4️⃣ VERIFICANDO CAMPANHAS' as passo,
    COUNT(*) as total,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Campanhas cadastradas'
        ELSE '⚠️ NENHUMA CAMPANHA CADASTRADA (isso é esperado se você ainda não criou nenhuma)'
    END as status
FROM campaigns;

-- Se houver campanhas, mostrar as 5 mais recentes
SELECT 
    '📋 ÚLTIMAS CAMPANHAS' as info,
    c.name as campanha,
    i.name as instituicao,
    c.status,
    c.created_at
FROM campaigns c
LEFT JOIN institutions i ON c.institution_id = i.id
ORDER BY c.created_at DESC
LIMIT 5;

-- ========================================
-- PARTE 2: APLICAR CORREÇÕES
-- ========================================

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
INSERT INTO institutions (name, slug, short_name, is_active) VALUES
    ('Pontifícia Universidade Católica do Rio Grande do Sul', 'pucrs', 'PUCRS', true),
    ('Centro Universitário Ritter dos Reis', 'uniritter', 'UniRitter', true),
    ('Escola de Humanidades', 'humanidades', 'Humanidades', true),
    ('Escola Politécnica', 'politecnica', 'Politécnica', true),
    ('Escola de Negócios', 'negocios', 'Negócios', true),
    ('Escola de Medicina', 'medicina', 'Medicina', true),
    ('Escola de Ciências da Saúde e da Vida', 'escvida', 'ESCVIDA', true),
    ('Escola de Direito', 'direito', 'Direito', true)
ON CONFLICT (name) DO NOTHING;

-- Confirmar correções
SELECT 
    '✅ CORREÇÕES APLICADAS' as resultado,
    'Usuário sistema e instituições inseridos/verificados' as detalhes;

-- ========================================
-- PARTE 3: VERIFICAÇÃO FINAL
-- ========================================

-- Resumo completo
SELECT 
    '📊 VERIFICAÇÃO FINAL' as titulo,
    (SELECT COUNT(*) FROM users WHERE id = '00000000-0000-0000-0000-000000000000') as usuario_sistema,
    (SELECT COUNT(*) FROM institutions) as total_instituicoes,
    (SELECT COUNT(*) FROM campaigns) as total_campanhas,
    CASE 
        WHEN (SELECT COUNT(*) FROM users WHERE id = '00000000-0000-0000-0000-000000000000') > 0 
         AND (SELECT COUNT(*) FROM institutions) > 0
        THEN '✅ BANCO PRONTO PARA USO!'
        ELSE '❌ AINDA HÁ PROBLEMAS - Execute SETUP_DATABASE.sql'
    END as status_final;

-- ============================================
-- INSTRUÇÕES FINAIS
-- ============================================
-- 
-- Se o status_final for "✅ BANCO PRONTO PARA USO":
--   → Você pode criar campanhas normalmente
--   → Acesse: https://campanhas.figma.site/
--   → Se as campanhas não aparecem após criar, é problema no frontend
--
-- Se houver "❌ AINDA HÁ PROBLEMAS":
--   1. Execute o arquivo SETUP_DATABASE.sql
--   2. Execute este arquivo novamente
--
-- Para verificar se as campanhas estão no banco:
--   SELECT * FROM campaigns ORDER BY created_at DESC;
--
-- ============================================

