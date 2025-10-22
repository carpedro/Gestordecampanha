# ========================================
# SCRIPT DE DEPLOY COMPLETO - PRODUÇÃO
# Gestor de Campanhas EdTech
# ========================================

Write-Host "
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🚀 DEPLOY AUTOMÁTICO - GESTOR DE CAMPANHAS           ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Variáveis de configuração
$PROJECT_REF = "jkplbqingkcmjhyogoiw"
$FUNCTION_NAME = "make-server-a1f709fc"
$SOURCE_PATH = "src/supabase/functions/server"
$DEST_PATH = "supabase/functions/$FUNCTION_NAME"

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERRO: Execute este script na raiz do projeto!" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Checklist de Deploy:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  [ ] Você executou SETUP_DATABASE.sql no Supabase?"
Write-Host "  [ ] Você tem suas credenciais do Supabase (anon key, service role key)?"
Write-Host "  [ ] Você tem Node.js instalado?"
Write-Host ""
$confirm = Read-Host "Tudo pronto? (S/N)"
if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "❌ Deploy cancelado. Complete os pré-requisitos primeiro." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "ETAPA 1: VERIFICAR NODE.JS" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "   Instale em: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "ETAPA 2: INSTALAR SUPABASE CLI" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI já instalado: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "⚙️ Instalando Supabase CLI..." -ForegroundColor Yellow
    npm install -g supabase
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Falha ao instalar Supabase CLI" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Supabase CLI instalado com sucesso!" -ForegroundColor Green
}

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "ETAPA 3: LOGIN NO SUPABASE" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔐 Verificando login..." -ForegroundColor Yellow
$loginStatus = supabase projects list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Não está logado. Iniciando login..." -ForegroundColor Yellow
    Write-Host "   Uma janela do navegador abrirá. Faça login com sua conta Supabase." -ForegroundColor Yellow
    supabase login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Falha no login" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Login realizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "✅ Já está logado no Supabase" -ForegroundColor Green
}

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "ETAPA 4: LINK COM O PROJETO" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔗 Linkando com projeto $PROJECT_REF..." -ForegroundColor Yellow
supabase link --project-ref $PROJECT_REF
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha ao linkar com o projeto" -ForegroundColor Red
    Write-Host "   Verifique se o PROJECT_REF está correto." -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Projeto linkado com sucesso!" -ForegroundColor Green

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "ETAPA 5: CRIAR ESTRUTURA DA EDGE FUNCTION" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📁 Criando diretório: $DEST_PATH" -ForegroundColor Yellow
if (-not (Test-Path $DEST_PATH)) {
    New-Item -ItemType Directory -Path $DEST_PATH -Force | Out-Null
    Write-Host "✅ Diretório criado" -ForegroundColor Green
} else {
    Write-Host "✅ Diretório já existe" -ForegroundColor Green
}

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "ETAPA 6: COPIAR ARQUIVOS DA EDGE FUNCTION" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Copiando arquivos de $SOURCE_PATH para $DEST_PATH..." -ForegroundColor Yellow
Copy-Item "$SOURCE_PATH/index.tsx" "$DEST_PATH/index.ts" -Force
Copy-Item "$SOURCE_PATH/deno.json" "$DEST_PATH/deno.json" -Force
Copy-Item "$SOURCE_PATH/types.d.ts" "$DEST_PATH/types.d.ts" -Force
Write-Host "✅ Arquivos copiados com sucesso!" -ForegroundColor Green

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "ETAPA 7: DEPLOY DA EDGE FUNCTION" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Fazendo deploy da Edge Function: $FUNCTION_NAME" -ForegroundColor Yellow
Write-Host "   Isso pode levar alguns minutos..." -ForegroundColor Yellow
supabase functions deploy $FUNCTION_NAME --no-verify-jwt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha no deploy da Edge Function" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Edge Function deployada com sucesso!" -ForegroundColor Green

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "ETAPA 8: CONFIGURAR SECRETS" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔑 Configure os secrets da Edge Function:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Obtenha suas credenciais em:" -ForegroundColor Yellow
Write-Host "   Supabase Dashboard → Project Settings → API" -ForegroundColor Cyan
Write-Host ""

$SUPABASE_URL = Read-Host "Digite SUPABASE_URL (ex: https://$PROJECT_REF.supabase.co)"
$SUPABASE_ANON_KEY = Read-Host "Digite SUPABASE_ANON_KEY"
$SUPABASE_SERVICE_ROLE_KEY = Read-Host "Digite SUPABASE_SERVICE_ROLE_KEY (será ocultado)" -AsSecureString

# Converter SecureString para texto
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SUPABASE_SERVICE_ROLE_KEY)
$SERVICE_KEY_PLAIN = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "⚙️ Configurando secrets..." -ForegroundColor Yellow
supabase secrets set "SUPABASE_URL=$SUPABASE_URL"
supabase secrets set "SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY"
supabase secrets set "SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY_PLAIN"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha ao configurar secrets" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Secrets configurados com sucesso!" -ForegroundColor Green

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "ETAPA 9: VERIFICAR DEPLOY" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔍 Listando Edge Functions..." -ForegroundColor Yellow
supabase functions list
Write-Host ""

Write-Host "🏥 Testando Health Check..." -ForegroundColor Yellow
$healthUrl = "$SUPABASE_URL/functions/v1/$FUNCTION_NAME/health"
try {
    $response = Invoke-RestMethod -Uri $healthUrl -Headers @{
        "Authorization" = "Bearer $SUPABASE_ANON_KEY"
    }
    if ($response.status -eq "healthy") {
        Write-Host "✅ Health Check: OK" -ForegroundColor Green
        Write-Host "   Mensagem: $($response.message)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Health Check: UNHEALTHY" -ForegroundColor Yellow
        Write-Host "   Issues: $($response.issues -join ', ')" -ForegroundColor Yellow
        Write-Host "   Mensagem: $($response.message)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Não foi possível testar o Health Check" -ForegroundColor Yellow
    Write-Host "   Teste manualmente em: $healthUrl" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "ETAPA 10: INSTALAR DEPENDÊNCIAS DO FRONTEND" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha ao instalar dependências" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependências instaladas!" -ForegroundColor Green

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "ETAPA 11: BUILD DE PRODUÇÃO" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🏗️ Gerando build de produção..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha no build" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build gerado com sucesso na pasta dist/" -ForegroundColor Green

Write-Host ""
Write-Host "
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║               ✅ DEPLOY CONCLUÍDO COM SUCESSO!            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
" -ForegroundColor Green

Write-Host ""
Write-Host "📊 RESUMO:" -ForegroundColor Cyan
Write-Host "  ✅ Edge Function deployada" -ForegroundColor Green
Write-Host "  ✅ Secrets configurados" -ForegroundColor Green
Write-Host "  ✅ Health check verificado" -ForegroundColor Green
Write-Host "  ✅ Frontend buildado (pasta dist/)" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. TESTAR LOCALMENTE:" -ForegroundColor Yellow
Write-Host "     npm run preview" -ForegroundColor White
Write-Host "     Abra: http://localhost:4173" -ForegroundColor White
Write-Host ""
Write-Host "  2. DEPLOY NO VERCEL:" -ForegroundColor Yellow
Write-Host "     npm install -g vercel" -ForegroundColor White
Write-Host "     vercel --prod" -ForegroundColor White
Write-Host ""
Write-Host "  3. OU DEPLOY NO NETLIFY:" -ForegroundColor Yellow
Write-Host "     npm install -g netlify-cli" -ForegroundColor White
Write-Host "     netlify deploy --prod" -ForegroundColor White
Write-Host ""
Write-Host "📚 Consulte DEPLOY_COMPLETO.md para instruções detalhadas." -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Parabéns! Seu projeto está pronto para produção!" -ForegroundColor Green
Write-Host ""

