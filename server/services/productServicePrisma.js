const prisma = require('../lib/prisma');

class ProductServicePrisma {
  // Obtener todos los productos (público)
  static async getAllProducts() {
    try {
      // Obtener tipo de cambio
      const exchangeRateSetting = await prisma.setting.findUnique({
        where: { key: 'exchange_rate' }
      });
      const exchangeRate = parseFloat(exchangeRateSetting?.value || 1335);

      const products = await prisma.product.findMany({
        where: { active: true },
        include: {
          categories: {
            include: {
              category: true
            }
          },
          images: {
            include: {
              gallery: true
            },
            orderBy: [
              { isPrimary: 'desc' },
              { id: 'asc' }
            ]
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return products.map(product => ({
        ...product,
        price_ars: product.price ? Number(product.price) * exchangeRate : null,
        original_price_ars: product.originalPrice ? Number(product.originalPrice) * exchangeRate : null
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Obtener productos para admin
  static async getAdminProducts() {
    try {
      // Obtener tipo de cambio
      const exchangeRateSetting = await prisma.setting.findUnique({
        where: { key: 'exchange_rate' }
      });
      const exchangeRate = parseFloat(exchangeRateSetting?.value || 1335);

      const products = await prisma.product.findMany({
        include: {
          categories: {
            include: {
              category: true
            }
          },
          images: {
            include: {
              gallery: true
            },
            orderBy: [
              { isPrimary: 'desc' },
              { id: 'asc' }
            ]
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return products.map(product => ({
        ...product,
        price_ars: product.price ? Number(product.price) * exchangeRate : null,
        original_price_ars: product.originalPrice ? Number(product.originalPrice) * exchangeRate : null
      }));
    } catch (error) {
      console.error('Error fetching admin products:', error);
      throw error;
    }
  }

  // Crear producto
  static async createProduct(productData, files = []) {
    try {
      const product = await prisma.product.create({
        data: {
          name: productData.name,
          description: productData.description,
          brand: productData.brand,
          originalPrice: productData.original_price ? parseFloat(productData.original_price) : null,
          margin: productData.margin ? parseFloat(productData.margin) : null,
          price: parseFloat(productData.price),
          size: productData.size,
          stock: parseInt(productData.stock) || 0,
          categories: productData.category_ids && productData.category_ids.length > 0 ? {
            create: productData.category_ids.map(categoryId => ({
              categoryId: parseInt(categoryId)
            }))
          } : undefined
        }
      });

      // Procesar imágenes si se proporcionaron archivos
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const isPrimary = i === 0;

          // Buscar la imagen en la galería
          const galleryImage = await prisma.gallery.findFirst({
            where: { imagePath: file.filename }
          });

          if (galleryImage) {
            await prisma.image.create({
              data: {
                productId: product.id,
                galleryId: galleryImage.id,
                isPrimary
              }
            });
          }
        }
      }

      return { message: 'Producto creado exitosamente', productId: product.id };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Obtener producto por ID
  static async getProductById(id) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: {
          categories: {
            include: {
              category: true
            }
          },
          images: {
            include: {
              gallery: true
            },
            orderBy: [
              { isPrimary: 'desc' },
              { id: 'asc' }
            ]
          }
        }
      });

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      return {
        ...product
      };
    } catch (error) {
      console.error('Error fetching product by id:', error);
      throw error;
    }
  }

  // Actualizar producto
  static async updateProduct(id, productData, files = []) {
    try {
      // Construir objeto de datos solo con los campos proporcionados
      const updateData = {};

      if (productData.name !== undefined) updateData.name = productData.name;
      if (productData.description !== undefined) updateData.description = productData.description;
      if (productData.brand !== undefined) updateData.brand = productData.brand;
      if (productData.original_price !== undefined) {
        const originalPriceValue = productData.original_price === '' ? null : parseFloat(productData.original_price);
        if (originalPriceValue === null || !isNaN(originalPriceValue)) {
          updateData.originalPrice = originalPriceValue;
        }
      }
      if (productData.margin !== undefined) {
        const marginValue = productData.margin === '' ? null : parseFloat(productData.margin);
        if (marginValue === null || !isNaN(marginValue)) {
          updateData.margin = marginValue;
        }
      }
      if (productData.price !== undefined) {
        const priceValue = parseFloat(productData.price);
        if (!isNaN(priceValue)) {
          updateData.price = priceValue;
        }
      }
      if (productData.size !== undefined) updateData.size = productData.size;
      if (productData.stock !== undefined) {
        const stockValue = productData.stock === '' ? 0 : parseInt(productData.stock);
        if (!isNaN(stockValue)) {
          updateData.stock = stockValue;
        }
      }
      if (productData.active !== undefined) {
        updateData.active = Boolean(productData.active);
      }

      await prisma.product.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      // Actualizar categorías si se proporcionaron
      if (productData.category_ids !== undefined) {
        try {
          // Eliminar categorías existentes
          await prisma.productCategory.deleteMany({
            where: { productId: parseInt(id) }
          });

          // Normalizar category_ids - puede ser un array o un string
          let categoryIds = productData.category_ids;
          if (!Array.isArray(categoryIds)) {
            // Si es un string vacío, no hay categorías
            if (categoryIds === '') {
              categoryIds = [];
            } else {
              categoryIds = [categoryIds];
            }
          }

          // Filtrar IDs válidos (no NaN)
          const validCategoryIds = categoryIds
            .map(id => parseInt(id))
            .filter(id => !isNaN(id));

          // Agregar nuevas categorías solo si hay IDs válidos
          if (validCategoryIds.length > 0) {
            await prisma.productCategory.createMany({
              data: validCategoryIds.map(categoryId => ({
                productId: parseInt(id),
                categoryId: categoryId
              }))
            });
          }
        } catch (error) {
          console.error('Error updating product categories:', error);
          throw new Error(`Error al actualizar las categorías del producto: ${error.message}`);
        }
      }

      // Actualizar imágenes si se proporcionaron
      if (productData.image_ids !== undefined) {
        try {
          // Eliminar imágenes existentes
          await prisma.image.deleteMany({
            where: { productId: parseInt(id) }
          });

          // Normalizar image_ids - puede ser un array o un string
          let imageIds = productData.image_ids;
          if (!Array.isArray(imageIds)) {
            // Si es un string vacío, no hay imágenes
            if (imageIds === '') {
              imageIds = [];
            } else {
              imageIds = [imageIds];
            }
          }

          // Filtrar IDs válidos (no NaN)
          const validImageIds = imageIds
            .map(id => parseInt(id))
            .filter(id => !isNaN(id));

          // Agregar nuevas imágenes solo si hay IDs válidos
          if (validImageIds.length > 0) {
            for (let i = 0; i < validImageIds.length; i++) {
              const imageId = validImageIds[i];
              const isPrimary = productData.primary_image ?
                imageId === parseInt(productData.primary_image) :
                i === 0;

              // Verificar que la imagen existe en la galería
              const galleryImage = await prisma.gallery.findUnique({
                where: { id: imageId }
              });

              if (galleryImage) {
                await prisma.image.create({
                  data: {
                    productId: parseInt(id),
                    galleryId: imageId,
                    isPrimary
                  }
                });
              }
            }
          }
        } catch (error) {
          console.error('Error updating product images:', error);
          throw new Error(`Error al actualizar las imágenes del producto: ${error.message}`);
        }
      }

      // Procesar imágenes nuevas si se proporcionaron archivos
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const isPrimary = i === 0;

          // Buscar la imagen en la galería
          const galleryImage = await prisma.gallery.findFirst({
            where: { imagePath: file.filename }
          });

          if (galleryImage) {
            await prisma.image.create({
              data: {
                productId: parseInt(id),
                galleryId: galleryImage.id,
                isPrimary
              }
            });
          }
        }
      }

      return { message: 'Producto actualizado exitosamente' };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Eliminar producto
  static async deleteProduct(id) {
    try {
      // Usar transacción para eliminar todas las referencias
      await prisma.$transaction(async (tx) => {
        // 1. Eliminar items de órdenes que referencian este producto
        await tx.orderItem.deleteMany({
          where: { productId: parseInt(id) }
        });

        // 2. Eliminar imágenes del producto
        await tx.image.deleteMany({
          where: { productId: parseInt(id) }
        });

        // 3. Eliminar categorías del producto
        await tx.productCategory.deleteMany({
          where: { productId: parseInt(id) }
        });

        // 4. Finalmente eliminar el producto
        await tx.product.delete({
          where: { id: parseInt(id) }
        });
      });

      return { message: 'Producto eliminado exitosamente' };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Importación masiva de productos
  static async bulkImport(products) {
    try {
      const results = {
        created: 0,
        errors: [],
        categoriesCreated: 0
      };

      console.log('Starting bulk import with', products.length, 'products');

      // Usar transacción para asegurar consistencia
      await prisma.$transaction(async (tx) => {
        for (const productData of products) {
          try {
            // Validar datos requeridos
            if (!productData.Nombre && !productData.name) {
              throw new Error('Nombre del producto es requerido');
            }

            // Procesar categorías - crear si no existen
            const categoryIds = [];
            if (productData.Categorias || productData.categories) {
              const categoryData = productData.Categorias || productData.categories;
              const categoryNames = Array.isArray(categoryData)
                ? categoryData
                : [categoryData];

              console.log('Processing categories for product:', productData.Nombre || productData.name, 'Categories field:', productData.Categorias || productData.categories, 'Parsed:', categoryNames);

              for (const categoryName of categoryNames) {
                if (categoryName && categoryName.trim()) {
                  // Buscar si la categoría ya existe
                  let category = await tx.category.findFirst({
                    where: { name: categoryName.trim() }
                  });

                  // Si no existe, crearla
                  if (!category) {
                    console.log('Creating new category:', categoryName.trim());
                    category = await tx.category.create({
                      data: {
                        name: categoryName.trim(),
                        active: true
                      }
                    });
                    results.categoriesCreated++;
                    console.log('Category created:', category.name, 'ID:', category.id);
                  } else {
                    console.log('Category found:', category.name, 'ID:', category.id);
                  }

                  categoryIds.push(category.id);
                }
              }
            }

            console.log('Category IDs to associate:', categoryIds);

            // Crear el producto
            const product = await tx.product.create({
              data: {
                name: productData.Nombre || productData.name || '',
                description: productData.Descripción || productData.description || '',
                brand: productData.Marca || productData.brand || '',
                originalPrice: productData['Precio original'] || productData.originalPrice ?
                  parseFloat(productData['Precio original'] || productData.originalPrice) : null,
                margin: productData.Margen || productData.margin ?
                  parseFloat(productData.Margen || productData.margin) : null,
                price: parseFloat(productData.Precio || productData.price || 0),
                size: productData.Talle || productData.size || '',
                stock: parseInt(productData.Stock || productData.stock || 0),
                active: productData.Activo === '1' || productData.active === true || productData.active === 1
              }
            });

            console.log('Product created with ID:', product.id, 'Name:', product.name);

            // Asociar categorías al producto usando el modelo correcto
            if (categoryIds.length > 0) {
              for (const categoryId of categoryIds) {
                console.log('Creating product-category association:', product.id, '->', categoryId);
                await tx.productCategory.create({
                  data: {
                    productId: product.id,
                    categoryId: categoryId
                  }
                });
              }
              console.log('All category associations created for product:', product.id);
            }

            results.created++;
          } catch (error) {
            console.error(`Error importing product ${productData.Nombre || productData.name}:`, error);
            results.errors.push({
              product: productData.Nombre || productData.name || 'Unknown',
              error: error.message
            });
          }
        }
      });

      console.log('Bulk import completed. Results:', results);

      return {
        message: `Importación completada. ${results.created} productos creados, ${results.categoriesCreated} categorías creadas.`,
        results
      };
    } catch (error) {
      console.error('Error in bulk import:', error);
      throw new Error(`Error en la importación masiva: ${error.message}`);
    }
  }
}

module.exports = ProductServicePrisma;
