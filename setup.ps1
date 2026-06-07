# ============================================================================
# URBANO AR - VERIFICACIÓN Y SETUP AUTOMÁTICO
# ============================================================================

Write-Host "`n" -ForegroundColor Green
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  URBANO AR - VERIFICACIÓN Y SETUP AUTOMÁTICO               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

$problemas = @()
$advertencias = @()

# ============================================================================
# 1. VERIFICAR DOCKER
# ============================================================================
Write-Host "🐳 Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "   ✅ Docker instalado: $dockerVersion" -ForegroundColor Green
} catch {
    $problemas += "❌ Docker NO está instalado. Descárgalo desde: https://www.docker.com/products/docker-desktop"
}

# ============================================================================
# 2. VERIFICAR PYTHON
# ============================================================================
Write-Host "🐍 Verificando Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "   ✅ Python instalado: $pythonVersion" -ForegroundColor Green
} catch {
    $problemas += "❌ Python NO está en el PATH. Instálalo desde: https://www.python.org"
}

# ============================================================================
# 3. VERIFICAR VENV
# ============================================================================
Write-Host "📦 Verificando entorno virtual..." -ForegroundColor Yellow
if (Test-Path ".\.venv") {
    Write-Host "   ✅ Entorno virtual existe" -ForegroundColor Green
} else {
    $advertencias += "⚠️  No existe .venv. Se creará al instalar dependencias"
}

# ============================================================================
# 4. BUSCAR PUERTOS DISPONIBLES
# ============================================================================
Write-Host "🔌 Buscando puertos disponibles..." -ForegroundColor Yellow

function Get-AvailablePort {
    param([int]$preferredPort)
    
    $puerto = $preferredPort
    $maxAttempts = 10
    $intentos = 0
    
    while ($intentos -lt $maxAttempts) {
        try {
            $conexion = [System.Net.Sockets.TcpClient]::new()
            $conexion.Connect("127.0.0.1", $puerto)
            $conexion.Close()
            # Puerto está ocupado, probar el siguiente
            $puerto++
            $intentos++
        } catch {
            # Puerto disponible
            return $puerto
        }
    }
    return $null
}

$puertoMySQL = Get-AvailablePort 3307
$puertoBackend = Get-AvailablePort 3000
$puertoFrontend = Get-AvailablePort 5173
$puertoProbador = Get-AvailablePort 5000

if ($null -eq $puertoMySQL -or $null -eq $puertoBackend -or $null -eq $puertoFrontend -or $null -eq $puertoProbador) {
    $problemas += "❌ No se pueden encontrar puertos disponibles. Cierra otras aplicaciones e intenta de nuevo."
} else {
    Write-Host "   ✅ MySQL       → 3307 (interno) → $puertoMySQL (host)" -ForegroundColor Green
    Write-Host "   ✅ Backend     → $puertoBackend" -ForegroundColor Green
    Write-Host "   ✅ Frontend    → $puertoFrontend" -ForegroundColor Green
    Write-Host "   ✅ Probador    → $puertoProbador" -ForegroundColor Green
}

# ============================================================================
# 5. CREAR ARCHIVO .env PARA PUERTOS DINÁMICOS
# ============================================================================
Write-Host "⚙️  Configurando puertos dinámicos..." -ForegroundColor Yellow

$envContent = @"
# Puerto MySQL (mapeado al 3306 interno)
MYSQL_PORT=$puertoMySQL

# Puertos de servicios
BACKEND_PORT=$puertoBackend
FRONTEND_PORT=$puertoFrontend
PROBADOR_PORT=$puertoProbador
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8 -Force
Write-Host "   ✅ Archivo .env creado con configuración de puertos" -ForegroundColor Green

# ============================================================================
# 6. ACTUALIZAR docker-compose.yml
# ============================================================================
Write-Host "🐳 Actualizando docker-compose.yml..." -ForegroundColor Yellow

$dockerComposePath = "docker-compose.yml"
if (Test-Path $dockerComposePath) {
    $dockerCompose = Get-Content $dockerComposePath -Raw
    
    # Reemplazar puertos si es necesario
    $dockerCompose = $dockerCompose -replace '- "3307:3306"', "- `"$puertoMySQL`:3306`""
    $dockerCompose = $dockerCompose -replace '- "3000:3000"', "- `"$puertoBackend`:3000`""
    $dockerCompose = $dockerCompose -replace '- "5173:5173"', "- `"$puertoFrontend`:5173`""
    
    $dockerCompose | Out-File -FilePath $dockerComposePath -Encoding UTF8 -Force
    Write-Host "   ✅ docker-compose.yml actualizado" -ForegroundColor Green
} else {
    $advertencias += "⚠️  No se encontró docker-compose.yml"
}

# ============================================================================
# 7. MOSTRAR RESUMEN
# ============================================================================
Write-Host "`n" -ForegroundColor Green
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  RESUMEN DE VERIFICACIÓN                                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

if ($problemas.Count -gt 0) {
    Write-Host "❌ PROBLEMAS ENCONTRADOS:" -ForegroundColor Red
    foreach ($problema in $problemas) {
        Write-Host "   $problema" -ForegroundColor Red
    }
    Write-Host "`n"
    exit 1
}

if ($advertencias.Count -gt 0) {
    Write-Host "⚠️  ADVERTENCIAS:" -ForegroundColor Yellow
    foreach ($advertencia in $advertencias) {
        Write-Host "   $advertencia" -ForegroundColor Yellow
    }
    Write-Host "`n"
}

Write-Host "✅ VERIFICACIÓN COMPLETADA - LISTO PARA INICIAR" -ForegroundColor Green
Write-Host "`n"

# ============================================================================
# 8. MOSTRAR INSTRUCCIONES
# ============================================================================
Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "`n"
Write-Host "Terminal 1 - Docker (Backend + Frontend + Base de datos):" -ForegroundColor Yellow
Write-Host "  docker compose up --build" -ForegroundColor White
Write-Host "`n"
Write-Host "Terminal 2 - Probador (Python local):" -ForegroundColor Yellow
Write-Host "  cd probador" -ForegroundColor White
Write-Host "  .\.venv\Scripts\activate" -ForegroundColor White
Write-Host "  python probador_urbano.py" -ForegroundColor White
Write-Host "`n"
Write-Host "🌐 URLs de acceso:" -ForegroundColor Cyan
Write-Host "  Frontend    → http://localhost:$puertoFrontend" -ForegroundColor Green
Write-Host "  Backend     → http://localhost:$puertoBackend" -ForegroundColor Green
Write-Host "  Probador    → http://localhost:$puertoProbador" -ForegroundColor Green
Write-Host "`n"

# ============================================================================
# 9. VERIFICAR Y INSTALAR DEPENDENCIAS DE PYTHON
# ============================================================================
Write-Host "📦 Verificando dependencias de Python..." -ForegroundColor Yellow

if (Test-Path ".\.venv\Scripts\activate") {
    Write-Host "   ✅ Activando entorno virtual..." -ForegroundColor Green
    & ".\.venv\Scripts\activate"
    
    Write-Host "   📥 Instalando dependencias..." -ForegroundColor Green
    pip install -q -r probador/requirements.txt
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Dependencias instaladas correctamente" -ForegroundColor Green
    } else {
        $advertencias += "⚠️  Algunos paquetes Python no se instalaron correctamente. Intenta manualmente: pip install -r probador/requirements.txt"
    }
} else {
    Write-Host "   ⚠️  Crea el entorno virtual con: python -m venv .venv" -ForegroundColor Yellow
}

Write-Host "`n╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"
