-- =====================================================
-- SETUP COMPLETO DO BANCO DE DADOS - GESTOR DE CAMPANHAS
-- VERSÃO COM LIMPEZA - Recria todas as tabelas
-- =====================================================
-- ⚠️ ATENÇÃO: Este script REMOVE todas as tabelas existentes!
-- Execute apenas se você tem certeza que quer começar do zero
-- =====================================================

-- =====================================================
-- 0. LIMPAR TUDO (COMEÇAR DO ZERO)
-- =====================================================

-- Remover tabelas dependentes primeiro (ordem importante!)
DROP TABLE IF EXISTS campaign_favorites CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS campaign_views CASCADE;
DROP TABLE IF EXISTS user_activity CASCADE;
DROP TABLE IF EXISTS campaign_audit CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS campaign_tags CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS institutions CASCADE;
DROP TABLE IF EXISTS areas CASCADE;
DROP TABLE IF EXISTS positions CASCADE;

-- Remover funções
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_slug(TEXT) CASCADE;
DROP FUNCTION IF EXISTS sync_campaign_institution() CASCADE;

-- =====================================================
-- 1. EXTENSÕES NECESSÁRIAS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. TABELAS DE REFERÊNCIA (SEM DEPENDÊNCIAS)
-- =====================================================

-- Tabela de posições hierárquicas
CREATE TABLE positions (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    level       INTEGER NOT NULL,
    description TEXT,
    sort_order  INTEGER DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de áreas de atuação
CREATE TABLE areas (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color       VARCHAR(7),
    icon        VARCHAR(50),
    sort_order  INTEGER DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de instituições de ensino
CREATE TABLE institutions (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) UNIQUE NOT NULL,
    slug        VARCHAR(255) UNIQUE NOT NULL,
    short_name  VARCHAR(50),
    logo_url    VARCHAR(512),
    website     VARCHAR(255),
    description TEXT,
    settings    JSONB DEFAULT '{}',
    sort_order  INTEGER DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tags
CREATE TABLE tags (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    type        VARCHAR(20) NOT NULL DEFAULT 'positive',
    description TEXT,
    color       VARCHAR(7),
    usage_count INTEGER DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_tags_type CHECK (type IN ('positive', 'negative'))
);

-- =====================================================
-- 3. TABELA DE USUÁRIOS
-- =====================================================

CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255) UNIQUE NOT NULL,
    name                VARCHAR(255) NOT NULL,
    full_name           VARCHAR(255),
    avatar_url          VARCHAR(512),
    role                VARCHAR(20) NOT NULL DEFAULT 'viewer',
    position            VARCHAR(100),
    position_id         INTEGER REFERENCES positions(id),
    area                VARCHAR(100),
    area_id             INTEGER REFERENCES areas(id),
    institution         VARCHAR(255),
    institution_id      INTEGER REFERENCES institutions(id),
    password_hash       VARCHAR(255),
    email_verified      BOOLEAN DEFAULT FALSE,
    email_verified_at   TIMESTAMP,
    is_active           BOOLEAN DEFAULT TRUE,
    last_login_at       TIMESTAMP,
    last_login_ip       INET,
    notification_settings JSONB DEFAULT '{}',
    ui_preferences      JSONB DEFAULT '{}',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at          TIMESTAMP,
    
    CONSTRAINT chk_user_role CHECK (role IN ('admin', 'editor', 'viewer'))
);

-- =====================================================
-- 4. TABELA DE CAMPANHAS
-- =====================================================

CREATE TABLE campaigns (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug                VARCHAR(255) UNIQUE NOT NULL,
    name                VARCHAR(255) NOT NULL,
    institution         VARCHAR(255),
    institution_id      INTEGER REFERENCES institutions(id),
    created_by_user_id  UUID NOT NULL REFERENCES users(id),
    assigned_to_user_id UUID REFERENCES users(id),
    description         TEXT NOT NULL,
    description_audio_url VARCHAR(512),
    audio_url           VARCHAR(512),
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'draft',
    priority            VARCHAR(20) DEFAULT 'medium',
    metadata            JSONB DEFAULT '{}',
    attachments_count   INTEGER DEFAULT 0,
    comments_count      INTEGER DEFAULT 0,
    views_count         INTEGER DEFAULT 0,
    version             INTEGER DEFAULT 1,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at        TIMESTAMP,
    archived_at         TIMESTAMP,
    deleted_at          TIMESTAMP,
    
    CONSTRAINT chk_campaigns_status CHECK (status IN ('draft', 'published', 'archived')),
    CONSTRAINT chk_campaigns_priority CHECK (priority IN ('low', 'medium', 'high')),
    CONSTRAINT chk_campaigns_dates CHECK (end_date >= start_date)
);

-- =====================================================
-- 5. TABELAS DE RELACIONAMENTO
-- =====================================================

CREATE TABLE campaign_tags (
    id              BIGSERIAL PRIMARY KEY,
    campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    tag_id          INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    tag_type        VARCHAR(20) NOT NULL DEFAULT 'positive',
    relation_type   VARCHAR(20) NOT NULL DEFAULT 'related',
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(campaign_id, tag_id),
    CONSTRAINT chk_campaign_tags_type CHECK (tag_type IN ('positive', 'negative')),
    CONSTRAINT chk_campaign_tags_relation CHECK (relation_type IN ('related', 'excluded'))
);

-- =====================================================
-- 6. TABELAS DE CONTEÚDO
-- =====================================================

CREATE TABLE attachments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    original_name   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(255),
    file_name       VARCHAR(255),
    file_path       VARCHAR(512),
    storage_path    VARCHAR(512),
    file_url        VARCHAR(512),
    file_size       BIGINT NOT NULL,
    mime_type       VARCHAR(100) NOT NULL,
    file_type       VARCHAR(50),
    file_extension  VARCHAR(10),
    thumbnail_url   VARCHAR(512),
    file_metadata   JSONB DEFAULT '{}',
    version         INTEGER DEFAULT 1,
    replaces_id     UUID REFERENCES attachments(id),
    uploaded_by     UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP
);

CREATE TABLE comments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    parent_id       UUID REFERENCES comments(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    content_html    TEXT,
    user_id         UUID NOT NULL REFERENCES users(id),
    attachment_id   UUID REFERENCES attachments(id),
    attachments     JSONB DEFAULT '[]',
    mentions        UUID[],
    mentioned_users UUID[],
    is_important    BOOLEAN DEFAULT FALSE,
    is_edited       BOOLEAN DEFAULT FALSE,
    edited_at       TIMESTAMP,
    replies_count   INTEGER DEFAULT 0,
    likes_count     INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP
);

CREATE TABLE comment_likes (
    id              BIGSERIAL PRIMARY KEY,
    comment_id      UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(comment_id, user_id)
);

-- =====================================================
-- 7. TABELAS DE AUDITORIA
-- =====================================================

CREATE TABLE campaign_audit (
    id              BIGSERIAL PRIMARY KEY,
    campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    action_type     VARCHAR(50) NOT NULL,
    action          VARCHAR(50),
    field_name      VARCHAR(100),
    field_changed   VARCHAR(100),
    old_value       TEXT,
    new_value       TEXT,
    changes_json    JSONB,
    metadata        JSONB DEFAULT '{}',
    user_id         UUID REFERENCES users(id),
    user_ip         INET,
    user_agent      TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_activity (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type   VARCHAR(50) NOT NULL,
    campaign_id     UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    resource_type   VARCHAR(50),
    resource_id     UUID,
    metadata        JSONB DEFAULT '{}',
    session_id      UUID,
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE campaign_views (
    id              BIGSERIAL PRIMARY KEY,
    campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address      INET,
    user_agent      TEXT,
    referrer        VARCHAR(512),
    duration_seconds INTEGER,
    viewed_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    campaign_id     UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    comment_id      UUID REFERENCES comments(id) ON DELETE CASCADE,
    action_url      VARCHAR(512),
    is_read         BOOLEAN DEFAULT FALSE,
    read_at         TIMESTAMP,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at      TIMESTAMP
);

CREATE TABLE campaign_favorites (
    id              BIGSERIAL PRIMARY KEY,
    campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(campaign_id, user_id)
);

-- =====================================================
-- 8. ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_position ON users(position_id);
CREATE INDEX idx_users_area ON users(area_id);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_campaigns_slug ON campaigns(slug);
CREATE INDEX idx_campaigns_institution ON campaigns(institution_id);
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by_user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);

CREATE INDEX idx_campaigns_search ON campaigns 
    USING gin(to_tsvector('portuguese', name || ' ' || COALESCE(description, '')));

CREATE INDEX idx_campaign_tags_campaign ON campaign_tags(campaign_id);
CREATE INDEX idx_campaign_tags_tag ON campaign_tags(tag_id);

CREATE INDEX idx_attachments_campaign ON attachments(campaign_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);

CREATE INDEX idx_comments_campaign ON comments(campaign_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- =====================================================
-- 9. DADOS INICIAIS (SEEDS)
-- =====================================================

INSERT INTO positions (name, slug, level, sort_order) VALUES
('Estagiário', 'estagiario', 1, 1),
('Assistente', 'assistente', 2, 2),
('Analista', 'analista', 3, 3),
('Especialista', 'especialista', 4, 4),
('Coordenador', 'coordenador', 5, 5),
('Gerente', 'gerente', 6, 6),
('Diretor', 'diretor', 7, 7),
('C-Level', 'c-level', 8, 8);

INSERT INTO areas (name, slug, color, sort_order) VALUES
('Negócios', 'negocios', '#2196F3', 1),
('Produto', 'produto', '#4CAF50', 2),
('Tecnologia', 'tecnologia', '#9C27B0', 3),
('Marketing', 'marketing', '#FF9800', 4),
('Relacionamento', 'relacionamento', '#E91E63', 5),
('Retenção', 'retencao', '#00BCD4', 6),
('Financeiro', 'financeiro', '#607D8B', 7);

INSERT INTO institutions (name, slug, short_name, sort_order) VALUES
('PUCRS', 'pucrs', 'PUCRS', 1),
('PUCRS Grad', 'pucrs-grad', 'PUCRS Grad', 2),
('FAAP', 'faap', 'FAAP', 3),
('FIA Online', 'fia-online', 'FIA Online', 4),
('UNESC', 'unesc', 'UNESC', 5),
('Santa Casa SP', 'santa-casa-sp', 'Santa Casa', 6),
('Impacta', 'impacta', 'Impacta', 7),
('FSL Digital', 'fsl-digital', 'FSL Digital', 8);

INSERT INTO tags (name, slug, type, color) VALUES
('Captação', 'captacao', 'positive', '#4CAF50'),
('Retenção', 'retencao', 'positive', '#2196F3'),
('Vestibular', 'vestibular', 'positive', '#FF9800'),
('EAD', 'ead', 'positive', '#9C27B0'),
('Presencial', 'presencial', 'positive', '#00BCD4'),
('Pós-Graduação', 'pos-graduacao', 'positive', '#E91E63'),
('Graduação', 'graduacao', 'positive', '#607D8B'),
('MBA', 'mba', 'positive', '#795548'),
('Técnico', 'tecnico', 'positive', '#009688'),
('Extensão', 'extensao', 'positive', '#FFC107');

-- =====================================================
-- 10. CRIAR USUÁRIO SISTEMA
-- =====================================================

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
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'sistema@campanhas-edtech.app',
    'Sistema',
    'Usuário Sistema',
    'admin',
    'Sistema',
    'Tecnologia',
    TRUE,
    TRUE
);

-- =====================================================
-- 11. FUNÇÕES AUXILIARES
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
    slug TEXT;
BEGIN
    slug := unaccent(LOWER(TRIM(input_text)));
    slug := regexp_replace(slug, '[^a-z0-9]+', '-', 'g');
    slug := regexp_replace(slug, '^-+|-+$', '', 'g');
    RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION sync_campaign_institution()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.institution_id IS NOT NULL THEN
        SELECT name INTO NEW.institution
        FROM institutions
        WHERE id = NEW.institution_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. TRIGGERS
-- =====================================================

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attachments_updated_at BEFORE UPDATE ON attachments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_areas_updated_at BEFORE UPDATE ON areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER sync_campaign_institution_trigger 
    BEFORE INSERT OR UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION sync_campaign_institution();

-- =====================================================
-- 13. VERIFICAÇÃO FINAL
-- =====================================================

SELECT 'Usuário Sistema criado:' as status, id, name, email, role 
FROM users 
WHERE id = '00000000-0000-0000-0000-000000000000';

SELECT 'Total de instituições:' as status, COUNT(*) as total FROM institutions;
SELECT 'Total de áreas:' as status, COUNT(*) as total FROM areas;
SELECT 'Total de posições:' as status, COUNT(*) as total FROM positions;
SELECT 'Total de tags:' as status, COUNT(*) as total FROM tags;

SELECT '✅ BANCO DE DADOS CONFIGURADO COM SUCESSO!' as mensagem;
SELECT '📝 Próximo passo: Deploy da Edge Function' as proximo_passo;

