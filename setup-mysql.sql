-- SQL para crear las tablas en MySQL/Hostinger
CREATE DATABASE IF NOT EXISTS u691951636_storedb;
USE u691951636_storedb;

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  image TEXT,
  category TEXT
);

-- Tabla de ordenes
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  delivery_address TEXT NOT NULL,
  items TEXT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar productos de demostración
INSERT INTO products (id, name, description, price, stock, active, image, category) VALUES 
('p1', 'Smartphone Premium', 'Teléfono inteligente de última generación con cámara de 108MP y batería de larga duración.', '599.99', 15, TRUE, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 'Electrónicos'),
('p2', 'Laptop Gaming', 'Laptop para juegos con procesador Intel i7 y tarjeta gráfica RTX 4060.', '1299.99', 8, TRUE, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400', 'Computadoras'),
('p3', 'Audífonos Inalámbricos', 'Audífonos Bluetooth con cancelación de ruido y hasta 30 horas de batería.', '199.99', 25, TRUE, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 'Audio'),
('p4', 'Smartwatch Deportivo', 'Reloj inteligente resistente al agua con monitoreo de salud y GPS.', '299.99', 12, TRUE, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 'Wearables'),
('p5', 'Cámara DSLR', 'Cámara profesional de 24MP con lente intercambiable y grabación 4K.', '899.99', 6, TRUE, 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400', 'Fotografía')
ON DUPLICATE KEY UPDATE stock=VALUES(stock), active=VALUES(active);