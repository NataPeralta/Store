const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initDatabase, getDatabase } = require('./database');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
});

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Inicializar base de datos
initDatabase().then(() => {
  console.log('Base de datos inicializada');
}).catch(err => {
  console.error('Error inicializando base de datos:', err);
});

// Rutas públicas (Frontend)

// Obtener todos los productos activos
app.get('/api/products', (req, res) => {
  const db = getDatabase();
  const query = `
    SELECT p.*, c.name as category_name, 
           GROUP_CONCAT(pi.image_path) as images
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_images pi ON p.id = pi.product_id
    WHERE p.active = 1
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      db.close();
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Procesar imágenes
    const products = rows.map(product => ({
      ...product,
      images: product.images ? product.images.split(',') : []
    }));
    
    db.close();
    res.json(products);
  });
});

// Obtener categorías
app.get('/api/categories', (req, res) => {
  const db = getDatabase();
  db.all('SELECT * FROM categories ORDER BY name', [], (err, rows) => {
    if (err) {
      db.close();
      res.status(500).json({ error: err.message });
      return;
    }
    db.close();
    res.json(rows);
  });
});

// Crear orden de compra
app.post('/api/orders', (req, res) => {
  const { customer_name, customer_lastname, customer_email, items } = req.body;
  
  if (!customer_name || !customer_lastname || !customer_email || !items || items.length === 0) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  const db = getDatabase();
  
  // Validar stock antes de procesar la orden
  const validateStock = () => {
    return new Promise((resolve, reject) => {
      let validatedItems = 0;
      const stockErrors = [];
      
      for (const item of items) {
        db.get('SELECT name, stock, active FROM products WHERE id = ?', [item.id], (err, product) => {
          if (err) {
            db.close();
            reject(err);
            return;
          }
          
          if (!product) {
            stockErrors.push(`Producto con ID ${item.id} no existe`);
          } else if (product.active !== 1) {
            stockErrors.push(`Producto "${product.name}" no está disponible`);
          } else if (product.stock < item.quantity) {
            stockErrors.push(`Producto "${product.name}" - Stock insuficiente. Disponible: ${product.stock}, Solicitado: ${item.quantity}`);
          }
          
          validatedItems++;
          if (validatedItems === items.length) {
            if (stockErrors.length > 0) {
              reject(new Error(`Productos no disponibles: ${stockErrors.join(', ')}`));
            } else {
              resolve();
            }
          }
        });
      }
    });
  };

  // Calcular total
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }

  // Validar stock y luego procesar la orden
  validateStock()
    .then(() => {
      db.serialize(() => {
        // Crear orden
        db.run(`
          INSERT INTO orders (customer_name, customer_lastname, customer_email, total)
          VALUES (?, ?, ?, ?)
        `, [customer_name, customer_lastname, customer_email, total], function(err) {
          if (err) {
            db.close();
            res.status(500).json({ error: err.message });
            return;
          }
          
          const orderId = this.lastID;
          
          // Crear items de orden y actualizar stock
          let completed = 0;
          for (const item of items) {
            db.run(`
              INSERT INTO order_items (order_id, product_id, quantity, price)
              VALUES (?, ?, ?, ?)
            `, [orderId, item.id, item.quantity, item.price], function(err) {
              if (err) {
                db.close();
                res.status(500).json({ error: err.message });
                return;
              }
              
              // Actualizar stock
              db.run(`
                UPDATE products 
                SET stock = stock - ? 
                WHERE id = ?
              `, [item.quantity, item.id], function(err) {
                if (err) {
                  db.close();
                  res.status(500).json({ error: err.message });
                  return;
                }
                
                completed++;
                if (completed === items.length) {
                  db.close();
                  res.json({ 
                    message: 'Orden creada exitosamente', 
                    orderId: orderId 
                  });
                }
              });
            });
          }
        });
      });
    })
    .catch((error) => {
      db.close();
      res.status(400).json({ error: error.message });
    });
});

// Rutas protegidas (Backoffice)

// Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  }

  const db = getDatabase();
  db.get('SELECT * FROM admin_users WHERE username = ?', [username], (err, user) => {
    if (err) {
      db.close();
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!user) {
      db.close();
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }
    
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      db.close();
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }
    
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    db.close();
    res.json({ token, user: { id: user.id, username: user.username } });
  });
});

// Obtener todas las órdenes
app.get('/api/admin/orders', authenticateToken, (req, res) => {
  const db = getDatabase();
  const query = `
    SELECT o.*, 
           GROUP_CONCAT(p.name || ' (x' || oi.quantity || ')') as products
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      db.close();
      res.status(500).json({ error: err.message });
      return;
    }
    db.close();
    res.json(rows);
  });
});

// Estadísticas básicas para admin
app.get('/api/admin/stats', authenticateToken, (req, res) => {
  const db = getDatabase();
  const stats = {
    productCount: 0,
    orderCount: 0,
    valueInStock: 0,
    totalSold: 0,
    valueInvested: 0
  };

  db.get('SELECT COUNT(*) AS count FROM products WHERE active = 1', [], (err, row) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: err.message });
    }
    stats.productCount = row?.count || 0;

    db.get('SELECT SUM(price * stock) AS valueInStock FROM products WHERE active = 1', [], (err2, row2) => {
      if (err2) {
        db.close();
        return res.status(500).json({ error: err2.message });
      }
      stats.valueInStock = row2?.valueInStock || 0;

      db.get('SELECT SUM(original_price * stock) AS valueInvested FROM products WHERE active = 1 AND original_price IS NOT NULL', [], (err3, row3) => {
        if (err3) {
          db.close();
          return res.status(500).json({ error: err3.message });
        }
        stats.valueInvested = row3?.valueInvested || 0;

        db.get('SELECT COUNT(*) AS count, SUM(total) AS totalSold FROM orders', [], (err4, row4) => {
          if (err4) {
            db.close();
            return res.status(500).json({ error: err4.message });
          }
          stats.orderCount = row4?.count || 0;
          stats.totalSold = row4?.totalSold || 0;
          db.close();
          res.json(stats);
        });
      });
    });
  });
});

// Listado de clientes agregados desde órdenes
app.get('/api/admin/customers', authenticateToken, (req, res) => {
  const db = getDatabase();
  const query = `
    SELECT 
      LOWER(customer_email) AS email,
      MAX(customer_name) AS customer_name,
      MAX(customer_lastname) AS customer_lastname,
      COUNT(*) AS orders,
      SUM(total) AS total_spent,
      MIN(created_at) AS first_order,
      MAX(created_at) AS last_order
    FROM orders
    WHERE customer_email IS NOT NULL AND customer_email <> ''
    GROUP BY LOWER(customer_email)
    ORDER BY total_spent DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: err.message });
    }
    db.close();
    res.json(rows);
  });
});

// Actualizar estado de orden
app.put('/api/admin/orders/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Estado requerido' });
  }

  const db = getDatabase();
  db.run(`
    UPDATE orders 
    SET status = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `, [status, id], function(err) {
    if (err) {
      db.close();
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      db.close();
      res.status(404).json({ error: 'Orden no encontrada' });
      return;
    }
    
    db.close();
    res.json({ message: 'Estado actualizado' });
  });
});

// Eliminar orden
app.delete('/api/admin/orders/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const db = getDatabase();
  db.serialize(() => {
    // Restaurar stock
    db.run(`
      UPDATE products 
      SET stock = stock + (
        SELECT oi.quantity 
        FROM order_items oi 
        WHERE oi.order_id = ? AND oi.product_id = products.id
      )
      WHERE id IN (
        SELECT product_id 
        FROM order_items 
        WHERE order_id = ?
      )
    `, [id, id], function(err) {
      if (err) {
        db.close();
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Eliminar items de orden
      db.run('DELETE FROM order_items WHERE order_id = ?', [id], function(err) {
        if (err) {
          db.close();
          res.status(500).json({ error: err.message });
          return;
        }
        
        // Eliminar orden
        db.run('DELETE FROM orders WHERE id = ?', [id], function(err) {
          if (err) {
            db.close();
            res.status(500).json({ error: err.message });
            return;
          }
          
          db.close();
          res.json({ message: 'Orden eliminada' });
        });
      });
    });
  });
});

// Gestión de productos

// Obtener todos los productos (admin)
app.get('/api/admin/products', authenticateToken, (req, res) => {
  const db = getDatabase();
  const query = `
    SELECT p.*, c.name as category_name,
           GROUP_CONCAT(pi.image_path) as images
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_images pi ON p.id = pi.product_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      db.close();
      res.status(500).json({ error: err.message });
      return;
    }
    
    const products = rows.map(product => ({
      ...product,
      images: product.images ? product.images.split(',') : []
    }));
    
    db.close();
    res.json(products);
  });
});

// Crear producto
app.post('/api/admin/products', authenticateToken, upload.array('images', 5), (req, res) => {
  const { name, category_id, description, brand, original_price, margin, price, size, stock } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ error: 'Nombre y precio requeridos' });
  }

  const db = getDatabase();
  
  db.serialize(() => {
    // Crear producto
    db.run(`
      INSERT INTO products (name, category_id, description, brand, original_price, margin, price, size, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, category_id, description, brand, original_price, margin, price, size, stock], function(err) {
      if (err) {
        db.close();
        res.status(500).json({ error: err.message });
        return;
      }
      
      const productId = this.lastID;
      
      // Guardar imágenes
      if (req.files && req.files.length > 0) {
        let completed = 0;
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const isPrimary = i === 0; // Primera imagen es la principal
          
          db.run(`
            INSERT INTO product_images (product_id, image_path, is_primary)
            VALUES (?, ?, ?)
          `, [productId, `/uploads/${file.filename}`, isPrimary], function(err) {
            if (err) {
              db.close();
              res.status(500).json({ error: err.message });
              return;
            }
            
            completed++;
            if (completed === req.files.length) {
              db.close();
              res.json({ 
                message: 'Producto creado exitosamente', 
                productId: productId 
              });
            }
          });
        }
      } else {
        db.close();
        res.json({ 
          message: 'Producto creado exitosamente', 
          productId: productId 
        });
      }
    });
  });
});

// Actualizar producto
app.put('/api/admin/products/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, category_id, description, brand, original_price, margin, price, size, stock, active } = req.body;
  
  const db = getDatabase();
  db.run(`
    UPDATE products 
    SET name = ?, category_id = ?, description = ?, brand = ?, 
        original_price = ?, margin = ?, price = ?, size = ?, 
        stock = ?, active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [name, category_id, description, brand, original_price, margin, price, size, stock, active, id], function(err) {
    if (err) {
      db.close();
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      db.close();
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }
    
    db.close();
    res.json({ message: 'Producto actualizado' });
  });
});

// Eliminar producto
app.delete('/api/admin/products/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const db = getDatabase();
  db.serialize(() => {
    // Eliminar imágenes
    db.run('DELETE FROM product_images WHERE product_id = ?', [id], function(err) {
      if (err) {
        db.close();
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Eliminar producto
      db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
        if (err) {
          db.close();
          res.status(500).json({ error: err.message });
          return;
        }
        
        db.close();
        res.json({ message: 'Producto eliminado' });
      });
    });
  });
});

// Listar imágenes disponibles en uploads
app.get('/api/admin/uploads', authenticateToken, (req, res) => {
  const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'No se pudieron leer las imágenes' });
    }
    const images = files
      .filter((file) => imageExtensions.has(path.extname(file).toLowerCase()))
      .map((file) => `/uploads/${file}`);
    res.json(images);
  });
});

// Actualizar imágenes de un producto (reemplaza todas las asociadas)
app.put('/api/admin/products/:id/images', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { images, primary } = req.body;

  if (!Array.isArray(images)) {
    return res.status(400).json({ error: 'El campo images debe ser un array' });
  }
  if (images.length > 5) {
    return res.status(400).json({ error: 'Máximo 5 imágenes permitidas' });
  }

  const db = getDatabase();
  db.serialize(() => {
    db.run('DELETE FROM product_images WHERE product_id = ?', [id], function(err) {
      if (err) {
        db.close();
        return res.status(500).json({ error: err.message });
      }

      if (images.length === 0) {
        db.close();
        return res.json({ message: 'Imágenes actualizadas' });
      }

      let completed = 0;
      images.forEach((imgPath) => {
        const isPrimary = primary ? imgPath === primary : images[0] === imgPath;
        db.run(
          'INSERT INTO product_images (product_id, image_path, is_primary) VALUES (?, ?, ?)',
          [id, imgPath, isPrimary ? 1 : 0],
          function(err) {
            if (err) {
              db.close();
              return res.status(500).json({ error: err.message });
            }
            completed++;
            if (completed === images.length) {
              db.close();
              return res.json({ message: 'Imágenes actualizadas' });
            }
          }
        );
      });
    });
  });
});

// Subir nuevas imágenes a un producto existente
app.post('/api/admin/products/:id/images/upload', authenticateToken, upload.array('images', 5), (req, res) => {
  const { id } = req.params;
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No se recibieron imágenes' });
  }

  const db = getDatabase();
  let completed = 0;
  const inserted = [];
  req.files.forEach((file) => {
    const imagePath = `/uploads/${file.filename}`;
    db.run(
      'INSERT INTO product_images (product_id, image_path, is_primary) VALUES (?, ?, 0)',
      [id, imagePath],
      function(err) {
        if (err) {
          db.close();
          return res.status(500).json({ error: err.message });
        }
        inserted.push(imagePath);
        completed++;
        if (completed === req.files.length) {
          db.close();
          return res.json({ message: 'Imágenes subidas', images: inserted });
        }
      }
    );
  });
});

// Importar productos en lote con creación automática de categorías
app.post('/api/admin/products/bulk-import', authenticateToken, (req, res) => {
  const { products } = req.body;
  
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de productos válido' });
  }

  const db = getDatabase();
  const results = {
    created: 0,
    errors: [],
    categoriesCreated: 0
  };

  // Función para procesar un producto
  const processProduct = (product, index) => {
    return new Promise((resolve) => {
      const {
        ID,
        Nombre,
        Categorias,
        Descripción,
        Marca,
        'Precio original': PrecioOriginal,
        Margen,
        Precio,
        Talle,
        Stock,
        Activo
      } = product;

      // Validaciones básicas
      if (!Nombre || !Precio) {
        results.errors.push(`Producto ${index + 1}: Nombre y precio son requeridos`);
        resolve();
        return;
      }

      // Procesar margen (convertir "250%" a 250)
      let marginValue = null;
      if (Margen) {
        marginValue = parseFloat(Margen.replace('%', ''));
      }

      // Procesar categoría
      let categoryId = null;
      if (Categorias && Categorias.trim()) {
        // Buscar si la categoría existe
        db.get('SELECT id FROM categories WHERE name = ?', [Categorias.trim()], (err, category) => {
          if (err) {
            results.errors.push(`Producto ${index + 1}: Error buscando categoría - ${err.message}`);
            resolve();
            return;
          }

          if (category) {
            categoryId = category.id;
            insertProduct();
          } else {
            // Crear nueva categoría
            db.run('INSERT INTO categories (name) VALUES (?)', [Categorias.trim()], function(err) {
              if (err) {
                results.errors.push(`Producto ${index + 1}: Error creando categoría - ${err.message}`);
                resolve();
                return;
              }
              results.categoriesCreated++;
              categoryId = this.lastID;
              insertProduct();
            });
          }
        });
      } else {
        insertProduct();
      }

      function insertProduct() {
        const active = Activo === '1' || Activo === 1 || Activo === true;
        
        db.run(`
          INSERT INTO products (
            name, category_id, description, brand, 
            original_price, margin, price, size, stock, active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          Nombre,
          categoryId,
          Descripción || '',
          Marca || '',
          PrecioOriginal || null,
          marginValue,
          Precio,
          Talle || '',
          Stock || 0,
          active
        ], function(err) {
          if (err) {
            results.errors.push(`Producto ${index + 1}: Error insertando producto - ${err.message}`);
          } else {
            results.created++;
          }
          resolve();
        });
      }
    });
  };

  // Procesar todos los productos secuencialmente
  const processAllProducts = async () => {
    for (let i = 0; i < products.length; i++) {
      await processProduct(products[i], i);
    }
    
    db.close();
    res.json({
      message: 'Importación completada',
      results: {
        total: products.length,
        created: results.created,
        categoriesCreated: results.categoriesCreated,
        errors: results.errors
      }
    });
  };

  processAllProducts().catch(err => {
    db.close();
    res.status(500).json({ error: 'Error en la importación: ' + err.message });
  });
});

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ruta para servir el frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
