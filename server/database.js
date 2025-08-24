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
          active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Migración: asegurar columna active en categories
      db.all(`PRAGMA table_info('categories')`, [], (err, columns) => {
        if (!err && Array.isArray(columns)) {
          const hasActive = columns.some((c) => c.name === 'active');
          if (!hasActive) {
            db.run(`ALTER TABLE categories ADD COLUMN active BOOLEAN DEFAULT 1`, [], () => {
              db.run(`UPDATE categories SET active = 1 WHERE active IS NULL`);
            });
          }
        }
      });

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

      // Tabla de relación producto-categoría (múltiples)
      db.run(`
        CREATE TABLE IF NOT EXISTS product_categories (
          product_id INTEGER NOT NULL,
          category_id INTEGER NOT NULL,
          PRIMARY KEY (product_id, category_id),
          FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
        )
      `);

      // Backfill: poblar product_categories desde products.category_id si no existe
      db.run(`
        INSERT OR IGNORE INTO product_categories (product_id, category_id)
        SELECT id, category_id FROM products WHERE category_id IS NOT NULL
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

      // Tabla de clientes
      db.run(`
        CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE,
          customer_name TEXT,
          customer_lastname TEXT,
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

      // Tabla de settings clave-valor
      db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `);

      // Valor por defecto del dólar
      db.run(
        `INSERT OR IGNORE INTO settings (key, value) VALUES ('exchange_rate', '1335')`
      );

      // Insertar usuario admin por defecto (admin/admin123)
      const defaultPassword = bcrypt.hashSync('admin123', 10);
      db.run(`
        INSERT OR IGNORE INTO admin_users (username, password) VALUES 
        ('admin', ?)
      `, [defaultPassword]);

      db.run('PRAGMA foreign_keys = ON');
    });

    // No cerrar aquí: otros callbacks pueden seguir ejecutándose.
    resolve();
  });
}

// Función para obtener conexión a la base de datos
function getDatabase() {
  const connection = new sqlite3.Database(dbPath);
  // Asegurar claves foráneas por conexión
  connection.run('PRAGMA foreign_keys = ON');
  return connection;
}

module.exports = {
  initDatabase,
  getDatabase
};
