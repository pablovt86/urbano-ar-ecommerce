#!/bin/bash

# ============================================================================
# URBANO AR - VERIFICACIÓN Y SETUP AUTOMÁTICO (Linux/Mac)
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  URBANO AR - VERIFICACIÓN Y SETUP AUTOMÁTICO               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

problemas=()
advertencias=()

# ============================================================================
# 1. VERIFICAR DOCKER
# ============================================================================
echo "🐳 Verificando Docker..."
if command -v docker &> /dev/null; then
    docker_version=$(docker --version)
    echo "   ✅ Docker instalado: $docker_version"
else
    problemas+=("❌ Docker NO está instalado. Descárgalo desde: https://www.docker.com/products/docker-desktop")
fi

# ============================================================================
# 2. VERIFICAR PYTHON
# ============================================================================
echo "🐍 Verificando Python..."
if command -v python3 &> /dev/null; then
    python_version=$(python3 --version)
    echo "   ✅ Python instalado: $python_version"
elif command -v python &> /dev/null; then
    python_version=$(python --version)
    echo "   ✅ Python instalado: $python_version"
else
    problemas+=("❌ Python NO está instalado. Instálalo desde: https://www.python.org")
fi

# ============================================================================
# 3. VERIFICAR VENV
# ============================================================================
echo "📦 Verificando entorno virtual..."
if [ -d ".venv" ]; then
    echo "   ✅ Entorno virtual existe"
else
    advertencias+=("⚠️  No existe .venv. Se creará al instalar dependencias")
fi

# ============================================================================
# 4. BUSCAR PUERTOS DISPONIBLES
# ============================================================================
echo "🔌 Buscando puertos disponibles..."

get_available_port() {
    local port=$1
    local max_attempts=10
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if ! nc -z localhost $port 2>/dev/null; then
            echo $port
            return 0
        fi
        port=$((port + 1))
        attempt=$((attempt + 1))
    done
    echo ""
}

puerto_mysql=$(get_available_port 3307)
puerto_backend=$(get_available_port 3000)
puerto_frontend=$(get_available_port 5173)
puerto_probador=$(get_available_port 5000)

if [ -z "$puerto_mysql" ] || [ -z "$puerto_backend" ] || [ -z "$puerto_frontend" ] || [ -z "$puerto_probador" ]; then
    problemas+=("❌ No se pueden encontrar puertos disponibles. Cierra otras aplicaciones e intenta de nuevo.")
else
    echo "   ✅ MySQL       → 3307 (interno) → $puerto_mysql (host)"
    echo "   ✅ Backend     → $puerto_backend"
    echo "   ✅ Frontend    → $puerto_frontend"
    echo "   ✅ Probador    → $puerto_probador"
fi

# ============================================================================
# 5. CREAR ARCHIVO .env PARA PUERTOS DINÁMICOS
# ============================================================================
echo "⚙️  Configurando puertos dinámicos..."

cat > .env << EOF
# Puerto MySQL (mapeado al 3306 interno)
MYSQL_PORT=$puerto_mysql

# Puertos de servicios
BACKEND_PORT=$puerto_backend
FRONTEND_PORT=$puerto_frontend
PROBADOR_PORT=$puerto_probador
EOF

echo "   ✅ Archivo .env creado con configuración de puertos"

# ============================================================================
# 6. MOSTRAR RESUMEN
# ============================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  RESUMEN DE VERIFICACIÓN                                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ ${#problemas[@]} -gt 0 ]; then
    echo "❌ PROBLEMAS ENCONTRADOS:"
    for problema in "${problemas[@]}"; do
        echo "   $problema"
    done
    echo ""
    exit 1
fi

if [ ${#advertencias[@]} -gt 0 ]; then
    echo "⚠️  ADVERTENCIAS:"
    for advertencia in "${advertencias[@]}"; do
        echo "   $advertencia"
    done
    echo ""
fi

echo "✅ VERIFICACIÓN COMPLETADA - LISTO PARA INICIAR"
echo ""

# ============================================================================
# 7. MOSTRAR INSTRUCCIONES
# ============================================================================
echo "📋 PRÓXIMOS PASOS:"
echo ""
echo "Terminal 1 - Docker (Backend + Frontend + Base de datos):"
echo "  docker compose up --build"
echo ""
echo "Terminal 2 - Probador (Python local):"
echo "  cd probador"
echo "  source ../.venv/bin/activate"
echo "  python probador_urbano.py"
echo ""
echo "🌐 URLs de acceso:"
echo "  Frontend    → http://localhost:$puerto_frontend"
echo "  Backend     → http://localhost:$puerto_backend"
echo "  Probador    → http://localhost:$puerto_probador"
echo ""

# ============================================================================
# 8. VERIFICAR Y INSTALAR DEPENDENCIAS DE PYTHON
# ============================================================================
echo "📦 Verificando dependencias de Python..."

if [ -f ".venv/bin/activate" ]; then
    echo "   ✅ Activando entorno virtual..."
    source .venv/bin/activate
    
    echo "   📥 Instalando dependencias..."
    pip install -q -r probador/requirements.txt
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Dependencias instaladas correctamente"
    else
        advertencias+=("⚠️  Algunos paquetes Python no se instalaron correctamente. Intenta manualmente: pip install -r probador/requirements.txt")
    fi
else
    echo "   ⚠️  Crea el entorno virtual con: python3 -m venv .venv"
fi

echo ""
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
