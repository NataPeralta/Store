# 📊 Configuración Google Sheets

## ✅ Tu Google Sheets ya está conectado
- **ID**: `1zRzVHt8hZClYOCWp_iWyYMb1fzEZf6jKeac57cGCaWM`
- **Sistema**: Lee directamente sin necesidad de APIs

## 📋 Estructura de columnas requeridas

Tu Google Sheets debe tener estas columnas (nombres flexibles):

| Columna | Ejemplos de nombres | Descripción |
|---------|-------------------|-------------|
| ID | `id`, `codigo` | Identificador único |
| Nombre | `nombre`, `name`, `producto` | Nombre del producto |
| Descripción | `descripcion`, `description` | Descripción del producto |
| Precio | `precio`, `price` | Precio en números |
| Stock | `stock`, `cantidad` | Cantidad disponible |
| Activo | `activo`, `active` | `true`/`false` o `1`/`0` |
| Imágenes | `imagen`, `images`, `fotos` | URLs separadas por `|` |
| Categoría | `categoria`, `category` | Categoría del producto |

## 🖼️ Múltiples imágenes por producto

### Formato en Google Sheets:
```
https://ejemplo.com/imagen1.jpg|https://ejemplo.com/imagen2.jpg|https://ejemplo.com/imagen3.jpg
```

### Ejemplo de fila:
```
p1|Smartphone Premium|Teléfono de última generación|599.99|15|true|https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400|https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400|Electrónicos
```

## 📷 Opciones para manejar imágenes

### Opción 1: Hostinger (Recomendada para producción)
1. Crea una carpeta `images/productos/` en tu hosting
2. Sube las imágenes allí
3. Usa URLs como: `https://nataperalta.com.ar/images/productos/smartphone-1.jpg`

### Opción 2: Google Drive (Gratis)
1. Sube imágenes a Google Drive
2. Haz públicas las imágenes
3. Obtén el link directo: `https://drive.google.com/uc?id=ID_DE_LA_IMAGEN`

### Opción 3: Imgur (Para pruebas)
1. Sube imágenes a imgur.com
2. Usa el link directo: `https://i.imgur.com/CODIGO.jpg`

### Opción 4: Unsplash (Para desarrollo/pruebas)
1. Busca imágenes en unsplash.com
2. Usa URLs como: `https://images.unsplash.com/photo-ID?w=400`

## 🔄 Funcionalidades incluidas

### Carrusel de imágenes automático
- ✅ Navegación con flechas
- ✅ Indicadores de posición
- ✅ Contador de imágenes
- ✅ Navegación táctil

### Actualización automática
- ✅ Lee desde Google Sheets cada 5 minutos
- ✅ Botón de "Actualizar" manual
- ✅ Fallback a datos del servidor si Sheets falla

## 🚀 Para empezar rápido

1. **Configura tu Google Sheets** con las columnas mencionadas
2. **Hazlo público** (Compartir → Cualquiera con el enlace puede ver)
3. **Agrega productos de prueba** con imágenes de Unsplash
4. **Tu tienda se actualizará automáticamente**

## 📝 Ejemplo de hoja completa

```csv
id,nombre,descripcion,precio,stock,activo,imagen,categoria
p1,Smartphone Premium,Teléfono de última generación,599.99,15,true,https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400|https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400,Electrónicos
p2,Laptop Gaming,Laptop para juegos Intel i7,1299.99,8,true,https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400,Computadoras
```

¡Tu tienda ya está lista para leer de Google Sheets! 🎉