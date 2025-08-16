import { sql } from "drizzle-orm";
import { mysqlTable, text, varchar, int, decimal, boolean, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = mysqlTable("products", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: int("stock").notNull().default(0),
  active: boolean("active").notNull().default(true),
  images: text("images"), // JSON array de URLs de imágenes
  image: text("image"), // Imagen principal (backward compatibility)
  category: text("category"),
});

export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 255 }).primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  deliveryAddress: text("delivery_address").notNull(),
  items: text("items").notNull(), // JSON string of order items
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(products);
export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Cart item type for frontend
export const cartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  image: z.string().optional(),
  stock: z.number(),
});

export type CartItem = z.infer<typeof cartItemSchema>;

// Order form data
export const orderFormSchema = z.object({
  customerName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  customerEmail: z.string().email("Ingresa un email válido"),
  customerPhone: z.string().optional(),
  deliveryAddress: z.string().min(10, "La dirección debe tener al menos 10 caracteres"),
});

export type OrderFormData = z.infer<typeof orderFormSchema>;
