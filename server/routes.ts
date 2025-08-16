import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ 
        message: "Error al cargar los productos. Por favor intenta nuevamente." 
      });
    }
  });

  // Refresh products from Google Sheets
  app.post("/api/products/refresh", async (req, res) => {
    try {
      const products = await storage.refreshProducts();
      res.json(products);
    } catch (error) {
      console.error('Error refreshing products:', error);
      res.status(500).json({ 
        message: "Error al actualizar los productos. Por favor intenta nuevamente." 
      });
    }
  });

  // Create order
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.status(201).json({ 
        success: true, 
        orderId: order.id,
        message: "Pedido creado exitosamente" 
      });
    } catch (error) {
      console.error('Error creating order:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Datos del pedido inválidos", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          message: "Error al procesar el pedido. Por favor intenta nuevamente." 
        });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
