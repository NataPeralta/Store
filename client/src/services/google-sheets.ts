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
      
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch Google Sheets data');
      }
      
      const csvData = await response.text();
      return this.parseCSVToProducts(csvData);
    } catch (error) {
      console.error('Error fetching from Google Sheets:', error);
      throw error;
    }
  }
  
  private parseCSVToProducts(csv: string): SheetsProduct[] {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
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
      
      const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
      
      if (columns.length < 2) continue; // Mínimo ID y nombre requeridos
      
      const id = columns[idIndex] || `product-${i}`;
      const name = columns[nameIndex] || '';
      const description = descIndex >= 0 && columns[descIndex] ? columns[descIndex].trim() : undefined;
      const price = priceIndex >= 0 ? parseFloat(columns[priceIndex]) || 0 : 0;
      const stock = stockIndex >= 0 ? parseInt(columns[stockIndex]) || 0 : 0;
      const active = activeIndex >= 0 ? (columns[activeIndex]?.toLowerCase() === 'true' || columns[activeIndex] === '1') : true;
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
    
    return products.filter(p => p.active);
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