// Servicio para leer Google Sheets públicos directamente (sin API keys)
export interface SheetsProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  active: boolean;
  images?: string[];
  category?: string;
}

export class PublicGoogleSheetsService {
  private readonly sheetsId = '1zRzVHt8hZClYOCWp_iWyYMb1fzEZf6jKeac57cGCaWM';
  
  async getProducts(): Promise<SheetsProduct[]> {
    try {
      // URL para acceder a Google Sheets como CSV público
      const csvUrl = `https://docs.google.com/spreadsheets/d/${this.sheetsId}/export?format=csv&gid=0`;
      
      console.log('📄 Intentando leer Google Sheets:', csvUrl);
      
      const response = await fetch(csvUrl, {
        mode: 'cors',
        headers: {
          'Accept': 'text/csv,text/plain,*/*'
        }
      });
      
      if (!response.ok) {
        console.error('❌ Error HTTP:', response.status, response.statusText);
        throw new Error(`Error ${response.status}: ${response.statusText}. Verifica que tu Google Sheets esté público`);
      }
      
      const csvData = await response.text();
      console.log('✅ CSV obtenido, longitud:', csvData.length);
      console.log('📋 Primeras 200 caracteres:', csvData.substring(0, 200));
      
      const products = this.parseCSVToProducts(csvData);
      console.log('🛍️ Productos parseados:', products.length);
      
      return products;
    } catch (error) {
      console.error('❌ Error completo:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('No se puede conectar a Google Sheets. Verifica tu conexión a internet o que la hoja esté pública.');
      }
      throw error;
    }
  }
  
  private parseCSVToProducts(csv: string): SheetsProduct[] {
    if (!csv || csv.trim().length === 0) {
      throw new Error('El archivo CSV está vacío o no se pudo leer');
    }
    
    const lines = csv.split('\n').filter(line => line.trim().length > 0);
    if (lines.length === 0) {
      throw new Error('No hay datos en el Google Sheets');
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    console.log('📊 Headers encontrados:', headers);
    
    // Mapear headers a índices
    const idIndex = headers.findIndex(h => h.toLowerCase().includes('id'));
    const nameIndex = headers.findIndex(h => h.toLowerCase().includes('nombre') || h.toLowerCase().includes('name'));
    const descIndex = headers.findIndex(h => h.toLowerCase().includes('descripcion') || h.toLowerCase().includes('description'));
    const priceIndex = headers.findIndex(h => h.toLowerCase().includes('precio') || h.toLowerCase().includes('price'));
    const stockIndex = headers.findIndex(h => h.toLowerCase().includes('stock') || h.toLowerCase().includes('cantidad'));
    const activeIndex = headers.findIndex(h => h.toLowerCase().includes('activo') || h.toLowerCase().includes('active'));
    const imageIndex = headers.findIndex(h => h.toLowerCase().includes('imagen') || h.toLowerCase().includes('image'));
    const categoryIndex = headers.findIndex(h => h.toLowerCase().includes('categoria') || h.toLowerCase().includes('category'));
    
    const products: SheetsProduct[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parsing más robusto para manejar comas dentro de comillas
      const columns = this.parseCSVLine(line);
      console.log(`🔍 Fila ${i}:`, columns);
      
      if (columns.length < 2) continue; // Mínimo ID y nombre requeridos
      
      const id = columns[idIndex] || `product-${i}`;
      const name = columns[nameIndex] || '';
      const description = descIndex >= 0 && columns[descIndex] ? columns[descIndex].trim() : undefined;
      const price = priceIndex >= 0 ? parseFloat(columns[priceIndex]) || 0 : 0;
      const stock = stockIndex >= 0 ? parseInt(columns[stockIndex]) || 0 : 0;
      const active = activeIndex >= 0 ? (columns[activeIndex] === '1' || columns[activeIndex]?.toLowerCase() === 'true') : true;
      const imageUrls = imageIndex >= 0 && columns[imageIndex] ? columns[imageIndex].trim() : '';
      const category = categoryIndex >= 0 && columns[categoryIndex] ? columns[categoryIndex].trim() : undefined;
      
      if (!name) continue;
      
      // Procesar múltiples imágenes separadas por | (solo si hay imágenes)
      const images = imageUrls
        ? imageUrls
            .split('|')
            .map(url => url.trim())
            .filter(url => url.length > 0)
        : [];
      
      // Solo incluir el array de imágenes si hay al menos una imagen
      const finalImages = images.length > 0 ? images : undefined;
      
      const product: SheetsProduct = {
        id,
        name,
        price,
        stock,
        active,
      };
      
      // Solo agregar campos opcionales si tienen valor
      if (description) product.description = description;
      if (finalImages) product.images = finalImages;
      if (category) product.category = category;
      
      products.push(product);
    }
    
    const activeProducts = products.filter(p => p.active);
    console.log(`✅ Productos activos: ${activeProducts.length} de ${products.length}`);
    return activeProducts;
  }
  
  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result.map(col => col.replace(/^"(.*)"$/, '$1')); // Remove surrounding quotes
  }
  
  async saveOrder(order: {
    date: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    deliveryAddress: string;
    products: string;
    total: number;
  }): Promise<void> {
    // Para envío de órdenes, usaremos un formulario de Google Forms
    // O un servicio como Formspree/Netlify Forms
    console.log('Order to be saved:', order);
    
    // Por ahora, lo loggeamos para desarrollo
    // En producción, aquí puedes integrar con Google Forms, email, etc.
  }
}

export const publicSheetsService = new PublicGoogleSheetsService();