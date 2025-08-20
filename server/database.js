const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Crear conexión a la base de datos
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Inicializar la base de datos
function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabla de categorías
      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabla de productos
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          category_id INTEGER,
          description TEXT,
          brand TEXT,
          original_price DECIMAL(10,2),
          margin DECIMAL(10,2),
          price DECIMAL(10,2) NOT NULL,
          size TEXT,
          stock INTEGER DEFAULT 0,
          active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories (id)
        )
      `);

      // Tabla de imágenes de productos
      db.run(`
        CREATE TABLE IF NOT EXISTS product_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          image_path TEXT NOT NULL,
          is_primary BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `);

      // Tabla de órdenes
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_name TEXT NOT NULL,
          customer_email TEXT NOT NULL,
          customer_lastname TEXT NOT NULL,
          total DECIMAL(10,2) NOT NULL,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabla de items de orden
      db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `);

      // Tabla de usuarios admin
      db.run(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insertar categorías por defecto
      db.run(`
        INSERT OR IGNORE INTO categories (name) VALUES 
        ('Ropa'),
        ('Calzado'),
        ('Accesorios'),
        ('Deportes')
      `);

      // Insertar usuario admin por defecto (admin/admin123)
      const defaultPassword = bcrypt.hashSync('admin123', 10);
      db.run(`
        INSERT OR IGNORE INTO admin_users (username, password) VALUES 
        ('admin', ?)
      `, [defaultPassword]);

      db.run('PRAGMA foreign_keys = ON');
    });

    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Función para obtener conexión a la base de datos
function getDatabase() {
  return new sqlite3.Database(dbPath);
}

module.exports = {
  initDatabase,
  getDatabase
};
