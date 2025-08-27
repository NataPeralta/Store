#!/bin/bash

# Script para convertir imágenes a WebP usando ImageMagick
# Uso: ./convertToWebp.sh

IMAGES_DIR="../imagenes"

echo "🔍 Escaneando carpeta de imágenes..."

# Verificar que existe el directorio
if [ ! -d "$IMAGES_DIR" ]; then
    echo "❌ Error: El directorio $IMAGES_DIR no existe"
    exit 1
fi

# Cambiar al directorio de imágenes
cd "$IMAGES_DIR" || exit 1

# Contar archivos de imagen
TOTAL_FILES=$(find . -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.heic" -o -iname "*.heif" -o -iname "*.bmp" -o -iname "*.tiff" -o -iname "*.tif" \) | wc -l)

echo "📁 Encontrados $TOTAL_FILES archivos de imagen"

# Crear archivo temporal con la lista de archivos
find . -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.heic" -o -iname "*.heif" -o -iname "*.bmp" -o -iname "*.tiff" -o -iname "*.tif" \) > /tmp/image_files.txt

CONVERTED=0
ERRORS=0
SKIPPED=0

# Procesar cada archivo
while IFS= read -r file; do
    # Obtener solo el nombre del archivo sin el ./
    filename=$(basename "$file")
    name_without_ext="${filename%.*}"
    webp_file="${name_without_ext}.webp"
    
    # Verificar si ya existe el archivo WebP
    if [ -f "$webp_file" ]; then
        echo "⏭️  $filename -> Ya existe $webp_file"
        ((SKIPPED++))
        continue
    fi
    
    echo "🔄 Convirtiendo: $filename -> $webp_file"
    
    # Intentar conversión con ImageMagick
    if convert "$filename" -quality 80 "$webp_file" 2>/dev/null; then
        echo "✅ Convertido: $webp_file"
        ((CONVERTED++))
    else
        echo "❌ Error convirtiendo $filename"
        ((ERRORS++))
        
        # Intentar con diferentes opciones para archivos problemáticos
        echo "🔄 Intentando conversión alternativa para $filename..."
        if convert "$filename" -strip -quality 75 "$webp_file" 2>/dev/null; then
            echo "✅ Convertido con opciones alternativas: $webp_file"
            ((CONVERTED++))
            ((ERRORS--))
        else
            echo "❌ No se pudo convertir $filename"
        fi
    fi
done < /tmp/image_files.txt

# Limpiar archivo temporal
rm -f /tmp/image_files.txt

echo ""
echo "📊 Resumen de conversión:"
echo "✅ Archivos convertidos: $CONVERTED"
echo "⏭️  Archivos omitidos: $SKIPPED"
echo "❌ Errores: $ERRORS"
echo "📁 Total procesados: $TOTAL_FILES"

if [ $ERRORS -gt 0 ]; then
    echo ""
    echo "💡 Sugerencias para archivos problemáticos:"
    echo "• Algunos archivos HEIC pueden estar corruptos"
    echo "• Intenta abrir y guardar los archivos problemáticos en otro formato"
    echo "• Verifica que los archivos no estén dañados"
fi
