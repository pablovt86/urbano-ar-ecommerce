#!/bin/sh
echo "🚀 Verificando e inicializando base de datos (Seed)..."
node seeders/seed.js

echo "🚀 Iniciando el servidor de desarrollo..."
npm run dev
