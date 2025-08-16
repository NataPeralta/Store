import { type Product, type Order, type InsertOrder } from "@shared/schema";
import { googleSheetsService, type GoogleSheetsProduct } from "./services/google-sheets";
import { randomUUID } from "crypto";

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
      // Always fetch fresh data from Google Sheets
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
    } catch (error) {
      console.error('Error fetching products:', error);
      // Return cached products if available, otherwise empty array
      return Array.from(this.products.values());
    }
  }

  async refreshProducts(): Promise<Product[]> {
    // Force refresh from Google Sheets
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

    try {
      // Save to Google Sheets
      await googleSheetsService.saveOrder({
        date: now.toISOString(),
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        deliveryAddress: order.deliveryAddress,
        products: order.items,
        total: parseFloat(order.total),
      });

      // Store in memory
      this.orders.set(id, order);
      
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }
}

export const storage = new MemStorage();
