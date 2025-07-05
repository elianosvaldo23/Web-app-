#!/bin/bash

# TaskGram Setup Script
echo "🚀 Configurando TaskGram..."

# Crear directorios si no existen
mkdir -p logs

# Instalar dependencias
echo "📦 Instalando dependencias..."
pip install --user -r requirements.txt

# Configurar permisos
chmod +x setup.sh

echo "✅ Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Editar config/config.py con tu bot token y configuración"
echo "2. Ejecutar el backend: python3 backend/app.py"
echo "3. Ejecutar el bot: python3 bot/bot.py"
echo ""
echo "🔗 URLs importantes:"
echo "- Mini App: http://localhost:5000"
echo "- Documentación: README.md"
echo ""
echo "🎉 ¡TaskGram está listo para usar!"
