import { type Product, type Order, type InsertOrder, products, orders } from "@shared/schema";
import { googleSheetsService, type GoogleSheetsProduct } from "./services/google-sheets";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  refreshProducts(): Promise<Product[]>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private orders: Map<string, Order>;

  constructor() {
    this.products = new Map();
    this.orders = new Map();
  }

  async getProducts(): Promise<Product[]> {
    try {
      // Try to fetch from Google Sheets if configured
      if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_SHEETS_ID) {
        const sheetsProducts = await googleSheetsService.getProducts();
        
        // Convert to our Product type and store in memory
        const products = sheetsProducts.map((product: GoogleSheetsProduct) => ({
          ...product,
          price: product.price.toString(),
        }));

        // Update memory storage
        this.products.clear();
        products.forEach(product => {
          this.products.set(product.id, product);
        });

        return products;
      }
    } catch (error) {
      console.error('Error fetching products from Google Sheets:', error);
    }
    
    // Use demo products if Google Sheets not configured or failed
    if (this.products.size === 0) {
      this.loadDemoProducts();
    }
    
    return Array.from(this.products.values());
  }

  private loadDemoProducts(): void {
    const demoProducts: Product[] = [
      {
        id: 'p1',
        name: 'Smartphone Premium',
        description: 'Teléfono inteligente de última generación con cámara de 108MP y batería de larga duración.',
        price: '599.99',
        stock: 15,
        active: true,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        category: 'Electrónicos'
      },
      {
        id: 'p2',
        name: 'Laptop Gaming',
        description: 'Laptop para juegos con procesador Intel i7 y tarjeta gráfica RTX 4060.',
        price: '1299.99',
        stock: 8,
        active: true,
        image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400',
        category: 'Computadoras'
      },
      {
        id: 'p3',
        name: 'Audífonos Inalámbricos',
        description: 'Audífonos Bluetooth con cancelación de ruido y hasta 30 horas de batería.',
        price: '199.99',
        stock: 25,
        active: true,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        category: 'Audio'
      },
      {
        id: 'p4',
        name: 'Smartwatch Deportivo',
        description: 'Reloj inteligente resistente al agua con monitoreo de salud y GPS.',
        price: '299.99',
        stock: 12,
        active: true,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
        category: 'Wearables'
      },
      {
        id: 'p5',
        name: 'Cámara DSLR',
        description: 'Cámara profesional de 24MP con lente intercambiable y grabación 4K.',
        price: '899.99',
        stock: 6,
        active: true,
        image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400',
        category: 'Fotografía'
      },
      {
        id: 'p6',
        name: 'Tablet 10 pulgadas',
        description: 'Tablet con pantalla de alta resolución, perfecta para trabajo y entretenimiento.',
        price: '399.99',
        stock: 0,
        active: false,
        image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400',
        category: 'Tablets'
      }
    ];

    this.products.clear();
    demoProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  async refreshProducts(): Promise<Product[]> {
    // Clear cache and force refresh
    this.products.clear();
    return this.getProducts();
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const now = new Date();
    
    const order: Order = {
      ...insertOrder,
      id,
      createdAt: now,
    };

    // Store in memory first
    this.orders.set(id, order);
    
    // Try to save to Google Sheets if configured
    try {
      if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_SHEETS_ID) {
        await googleSheetsService.saveOrder({
          date: now.toISOString(),
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          deliveryAddress: order.deliveryAddress,
          products: order.items,
          total: parseFloat(order.total),
        });
        console.log('Order saved to Google Sheets successfully');
      } else {
        console.log('Order saved locally (Google Sheets not configured)');
      }
    } catch (error) {
      console.error('Error saving to Google Sheets (order saved locally):', error);
    }
    
    return order;
  }
}

// Database Storage implementation
export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    try {
      // Try to fetch from Google Sheets if configured
      if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_SHEETS_ID) {
        const sheetsProducts = await googleSheetsService.getProducts();
        
        // Clear existing products and insert from sheets
        await db.delete(products);
        
        const productsToInsert = sheetsProducts.map((product: GoogleSheetsProduct) => ({
          ...product,
          price: product.price.toString(),
        }));
        
        if (productsToInsert.length > 0) {
          await db.insert(products).values(productsToInsert);
        }
        
        return productsToInsert;
      }
    } catch (error) {
      console.error('Error fetching products from Google Sheets:', error);
    }
    
    // Get products from database
    const dbProducts = await db.select().from(products).where(eq(products.active, true));
    
    // If no products in DB, load demo products
    if (dbProducts.length === 0) {
      await this.loadDemoProducts();
      return await db.select().from(products).where(eq(products.active, true));
    }
    
    return dbProducts;
  }

  async refreshProducts(): Promise<Product[]> {
    // Clear database products and reload
    await db.delete(products);
    return this.getProducts();
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    
    // Try to save to Google Sheets if configured
    try {
      if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_SHEETS_ID) {
        await googleSheetsService.saveOrder({
          date: order.createdAt.toISOString(),
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          deliveryAddress: order.deliveryAddress,
          products: order.items,
          total: parseFloat(order.total),
        });
        console.log('Order saved to Google Sheets successfully');
      } else {
        console.log('Order saved to database (Google Sheets not configured)');
      }
    } catch (error) {
      console.error('Error saving to Google Sheets (order saved to database):', error);
    }
    
    return order;
  }

  private async loadDemoProducts(): Promise<void> {
    const demoProducts = [
      {
        id: 'p1',
        name: 'Smartphone Premium',
        description: 'Teléfono inteligente de última generación con cámara de 108MP y batería de larga duración.',
        price: '599.99',
        stock: 15,
        active: true,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        category: 'Electrónicos'
      },
      {
        id: 'p2',
        name: 'Laptop Gaming',
        description: 'Laptop para juegos con procesador Intel i7 y tarjeta gráfica RTX 4060.',
        price: '1299.99',
        stock: 8,
        active: true,
        image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400',
        category: 'Computadoras'
      },
      {
        id: 'p3',
        name: 'Audífonos Inalámbricos',
        description: 'Audífonos Bluetooth con cancelación de ruido y hasta 30 horas de batería.',
        price: '199.99',
        stock: 25,
        active: true,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        category: 'Audio'
      },
      {
        id: 'p4',
        name: 'Smartwatch Deportivo',
        description: 'Reloj inteligente resistente al agua con monitoreo de salud y GPS.',
        price: '299.99',
        stock: 12,
        active: true,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
        category: 'Wearables'
      },
      {
        id: 'p5',
        name: 'Cámara DSLR',
        description: 'Cámara profesional de 24MP con lente intercambiable y grabación 4K.',
        price: '899.99',
        stock: 6,
        active: true,
        image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400',
        category: 'Fotografía'
      },
      {
        id: 'p6',
        name: 'Tablet 10 pulgadas',
        description: 'Tablet con pantalla de alta resolución, perfecta para trabajo y entretenimiento.',
        price: '399.99',
        stock: 0,
        active: false,
        image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400',
        category: 'Tablets'
      }
    ];

    await db.insert(products).values(demoProducts);
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
