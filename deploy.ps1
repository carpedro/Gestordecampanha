# =====================================================
# Script de Deploy Automático - Gestor de Campanhas
# =====================================================

Write-Host "================================" -ForegroundColor Cyan
Write-Host "🚀 DEPLOY - GESTOR DE CAMPANHAS" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Configurações do projeto
$PROJECT_ID = "jkplbqingkcmjhyogoiw"
$PROJECT_URL = "https://jkplbqingkcmjhyogoiw.supabase.co"
$ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcGxicWluZ2tjbWpoeW9nb2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDU1OTUsImV4cCI6MjA3NjIyMTU5NX0.UTs7ArhP1-znaj_SEku7KWtQ_15S6uYxbuL0rxjwzQU"

# Verificar se Supabase CLI está instalado
Write-Host "1️⃣ Verificando Supabase CLI..." -ForegroundColor Yellow
$supabaseCLI = Get-Command supabase -ErrorAction SilentlyContinue

if ($null -eq $supabaseCLI) {
    Write-Host "❌ Supabase CLI não está instalado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📦 Opções de instalação:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opção 1 - Via NPM (Rápido):" -ForegroundColor White
    Write-Host "  npm install -g supabase" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Opção 2 - Via Scoop (Recomendado):" -ForegroundColor White
    Write-Host "  # Instalar Scoop (se não tiver)" -ForegroundColor Gray
    Write-Host "  Set-ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Gray
    Write-Host "  irm get.scoop.sh | iex" -ForegroundColor Gray
    Write-Host "  # Instalar Supabase" -ForegroundColor Gray
    Write-Host "  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git" -ForegroundColor Gray
    Write-Host "  scoop install supabase" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Opção 3 - Via Chocolatey:" -ForegroundColor White
    Write-Host "  choco install supabase" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Opção 4 - Deploy Manual:" -ForegroundColor White
    Write-Host "  Consulte: DEPLOY_MANUAL.md" -ForegroundColor Gray
    Write-Host ""
    
    $install = Read-Host "Deseja tentar instalar via NPM agora? (s/n)"
    if ($install -eq "s" -or $install -eq "S") {
        Write-Host "Instalando via NPM..." -ForegroundColor Yellow
        npm install -g supabase
        
        # Verificar novamente
        $supabaseCLI = Get-Command supabase -ErrorAction SilentlyContinue
        if ($null -eq $supabaseCLI) {
            Write-Host "❌ Instalação falhou. Use o DEPLOY_MANUAL.md" -ForegroundColor Red
            exit 1
        }
        Write-Host "✅ Instalado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "📋 Por favor, instale o Supabase CLI e execute este script novamente." -ForegroundColor Yellow
        Write-Host "Ou siga o guia em: DEPLOY_MANUAL.md" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✅ Supabase CLI encontrado: $($supabaseCLI.Version)" -ForegroundColor Green
}

Write-Host ""

# Verificar se está logado
Write-Host "2️⃣ Verificando autenticação..." -ForegroundColor Yellow
$loginStatus = supabase projects list 2>&1

if ($loginStatus -like "*not logged in*" -or $loginStatus -like "*error*") {
    Write-Host "❌ Não está logado no Supabase" -ForegroundColor Red
    Write-Host "Por favor, faça login:" -ForegroundColor Yellow
    supabase login
} else {
    Write-Host "✅ Autenticado no Supabase" -ForegroundColor Green
}

Write-Host ""

# Linkar projeto
Write-Host "3️⃣ Linkando projeto..." -ForegroundColor Yellow
$linkResult = supabase link --project-ref $PROJECT_ID 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Projeto linkado com sucesso" -ForegroundColor Green
} else {
    Write-Host "⚠️ Projeto já pode estar linkado" -ForegroundColor Yellow
}

Write-Host ""

# Verificar estrutura da Edge Function
Write-Host "4️⃣ Verificando estrutura da Edge Function..." -ForegroundColor Yellow
if (Test-Path "supabase\functions\make-server-a1f709fc\index.ts") {
    Write-Host "✅ Edge Function preparada" -ForegroundColor Green
} else {
    Write-Host "❌ Arquivo da Edge Function não encontrado!" -ForegroundColor Red
    Write-Host "Execute primeiro: .\prepare-function.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Deploy da Edge Function
Write-Host "5️⃣ Fazendo deploy da Edge Function..." -ForegroundColor Yellow
supabase functions deploy make-server-a1f709fc

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Edge Function deployada com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao fazer deploy da Edge Function" -ForegroundColor Red
    Write-Host "Consulte DEPLOY_MANUAL.md para deploy manual" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Configurar secrets
Write-Host "6️⃣ Configurando variáveis de ambiente..." -ForegroundColor Yellow
Write-Host "Configurando SUPABASE_URL..." -ForegroundColor Gray
supabase secrets set SUPABASE_URL=$PROJECT_URL

Write-Host "Configurando SUPABASE_ANON_KEY..." -ForegroundColor Gray
supabase secrets set SUPABASE_ANON_KEY=$ANON_KEY

Write-Host ""
Write-Host "⚠️ IMPORTANTE: Configurar SERVICE_ROLE_KEY manualmente!" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Acesse: https://supabase.com/dashboard/project/$PROJECT_ID/settings/api" -ForegroundColor Cyan
Write-Host "2. Copie o valor de 'service_role' (⚠️ SECRETO!)" -ForegroundColor Cyan
Write-Host "3. Execute:" -ForegroundColor Cyan
Write-Host "   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<sua-chave>" -ForegroundColor Gray
Write-Host ""

$serviceRole = Read-Host "Cole o SERVICE_ROLE_KEY aqui (ou deixe vazio para configurar depois)"
if ($serviceRole -ne "") {
    supabase secrets set SUPABASE_SERVICE_ROLE_KEY=$serviceRole
    Write-Host "✅ Todas variáveis configuradas!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Lembre-se de configurar o SERVICE_ROLE_KEY depois!" -ForegroundColor Yellow
}

Write-Host ""

# Resumo
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📊 RESUMO DO DEPLOY" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Edge Function deployada" -ForegroundColor Green
Write-Host "✅ Variáveis de ambiente configuradas" -ForegroundColor Green
Write-Host ""
Write-Host "📝 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Execute o script do banco de dados:" -ForegroundColor White
Write-Host "   - Acesse: https://supabase.com/dashboard/project/$PROJECT_ID/sql" -ForegroundColor Gray
Write-Host "   - Execute o arquivo: SETUP_DATABASE.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Verifique a instalação:" -ForegroundColor White
Write-Host "   - Execute o arquivo: VERIFICACAO.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Rode a aplicação:" -ForegroundColor White
Write-Host "   npm install" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🎉 Deploy da Edge Function concluído!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para mais informacoes, consulte:" -ForegroundColor Cyan
Write-Host "   - DEPLOY_MANUAL.md" -ForegroundColor Gray
Write-Host "   - GUIA_DE_INSTALACAO.md" -ForegroundColor Gray
Write-Host ""

