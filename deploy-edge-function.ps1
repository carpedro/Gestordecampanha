# Script de Deploy da Edge Function
# Execute este script em um PowerShell com Node.js configurado

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  DEPLOY DA EDGE FUNCTION - GESTOR DE CAMPANHAS" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Passo 1: Instalar Supabase CLI
Write-Host "[1/7] Instalando Supabase CLI..." -ForegroundColor Yellow
npm install -g supabase
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar Supabase CLI" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Supabase CLI instalado com sucesso!" -ForegroundColor Green
Write-Host ""

# Passo 2: Login
Write-Host "[2/7] Fazendo login no Supabase..." -ForegroundColor Yellow
Write-Host "⚠️  Uma janela do navegador será aberta para login" -ForegroundColor Cyan
supabase login
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao fazer login" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Login realizado com sucesso!" -ForegroundColor Green
Write-Host ""

# Passo 3: Link com projeto
Write-Host "[3/7] Linkando com projeto Supabase..." -ForegroundColor Yellow
supabase link --project-ref jkplbqingkcmjhyogoiw
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao linkar projeto" -ForegroundColor Red
    Write-Host "⚠️  Se pedir senha do banco, recupere em:" -ForegroundColor Cyan
    Write-Host "    https://supabase.com/dashboard/project/jkplbqingkcmjhyogoiw/settings/database" -ForegroundColor Cyan
    exit 1
}
Write-Host "✅ Projeto linkado com sucesso!" -ForegroundColor Green
Write-Host ""

# Passo 4: Criar estrutura de pastas
Write-Host "[4/7] Criando estrutura de pastas..." -ForegroundColor Yellow
if (-not (Test-Path "supabase\functions\make-server-a1f709fc")) {
    New-Item -ItemType Directory -Path "supabase\functions\make-server-a1f709fc" -Force | Out-Null
}
Write-Host "✅ Estrutura criada!" -ForegroundColor Green
Write-Host ""

# Passo 5: Copiar arquivos
Write-Host "[5/7] Copiando arquivos da função..." -ForegroundColor Yellow
Copy-Item "src\supabase\functions\server\index.tsx" "supabase\functions\make-server-a1f709fc\index.ts" -Force
Copy-Item "src\supabase\functions\server\deno.json" "supabase\functions\make-server-a1f709fc\deno.json" -Force
Copy-Item "src\supabase\functions\server\types.d.ts" "supabase\functions\make-server-a1f709fc\types.d.ts" -Force

if (-not (Test-Path "supabase\functions\make-server-a1f709fc\index.ts")) {
    Write-Host "❌ Erro ao copiar arquivos" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Arquivos copiados com sucesso!" -ForegroundColor Green
Write-Host ""

# Passo 6: Deploy
Write-Host "[6/7] Fazendo deploy da função..." -ForegroundColor Yellow
Write-Host "⏳ Isso pode levar alguns minutos..." -ForegroundColor Cyan
supabase functions deploy make-server-a1f709fc
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao fazer deploy" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Deploy realizado com sucesso!" -ForegroundColor Green
Write-Host ""

# Passo 7: Configurar Secrets
Write-Host "[7/7] Configurando secrets..." -ForegroundColor Yellow

Write-Host "  → Configurando SUPABASE_URL..." -ForegroundColor Cyan
supabase secrets set SUPABASE_URL=https://jkplbqingkcmjhyogoiw.supabase.co
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao configurar SUPABASE_URL" -ForegroundColor Red
    exit 1
}

Write-Host "  → Configurando SUPABASE_ANON_KEY..." -ForegroundColor Cyan
supabase secrets set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcGxicWluZ2tjbWpoeW9nb2l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDU1OTUsImV4cCI6MjA3NjIyMTU5NX0.UTs7ArhP1-znaj_SEku7KWtQ_15S6uYxbuL0rxjwzQU
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao configurar SUPABASE_ANON_KEY" -ForegroundColor Red
    exit 1
}

Write-Host "  → Configurando SUPABASE_SERVICE_ROLE_KEY..." -ForegroundColor Cyan
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprcGxicWluZ2tjbWpoeW9nb2l3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY0NTU5NSwiZXhwIjoyMDc2MjIxNTk1fQ.qDOKtXgLiJ-i8NjjhihUaopo9r1H-JK3-6mVcvr5wzY
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao configurar SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Todos os secrets configurados com sucesso!" -ForegroundColor Green
Write-Host ""

# Verificação final
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  VERIFICAÇÃO FINAL" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Listando funções deployadas:" -ForegroundColor Yellow
supabase functions list

Write-Host ""
Write-Host "Listando secrets configurados:" -ForegroundColor Yellow
supabase secrets list

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "  🎉 DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Execute: npm run dev" -ForegroundColor White
Write-Host "  2. Abra: http://localhost:5173" -ForegroundColor White
Write-Host "  3. Teste criar uma campanha" -ForegroundColor White
Write-Host ""
Write-Host "URL da Edge Function:" -ForegroundColor Cyan
Write-Host "  https://jkplbqingkcmjhyogoiw.supabase.co/functions/v1/make-server-a1f709fc" -ForegroundColor White
Write-Host ""

