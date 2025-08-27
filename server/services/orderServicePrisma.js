const prisma = require('../lib/prisma');

class OrderServicePrisma {
  // Obtener todas las órdenes
  static async getAllOrders() {
    try {
      const orders = await prisma.order.findMany({
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  images: {
                    include: {
                      gallery: true
                    },
                    where: {
                      isPrimary: true
                    },
                    take: 1
                  }
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return orders.map(order => ({
        ...order,
        products: order.orderItems.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          image: item.product.images[0]?.gallery?.previewPath || null
        }))
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  // Obtener orden por ID
  static async getOrderById(id) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: parseInt(id) },
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  images: {
                    include: {
                      gallery: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!order) {
        throw new Error('Orden no encontrada');
      }

      return {
        ...order,
        products: order.items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.price,
          quantity: item.quantity,
          image: item.product.images[0]?.gallery?.previewPath || null
        }))
      };
    } catch (error) {
      console.error('Error fetching order by id:', error);
      throw error;
    }
  }

  // Crear orden
  static async createOrder(orderData) {
    try {
      const { customerName, customerEmail, customerLastname, total, status, items } = orderData;

      const order = await prisma.order.create({
        data: {
          customerName: customerName,
          customerEmail: customerEmail,
          customerLastname: customerLastname,
          total: parseFloat(total),
          status: status || 'pending',
          orderItems: {
            create: items.map(item => ({
              productId: parseInt(item.productId),
              quantity: parseInt(item.quantity),
              price: parseFloat(item.price)
            }))
          }
        },
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        }
      });

      // Actualizar stock de productos
      for (const item of items) {
        await prisma.product.update({
          where: { id: parseInt(item.productId) },
          data: {
            stock: {
              decrement: parseInt(item.quantity)
            }
          }
        });
      }

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Actualizar estado de orden
  static async updateOrderStatus(id, status) {
    try {
      // Usar transacción para manejar cambios de stock
      const result = await prisma.$transaction(async (tx) => {
        // 1. Obtener la orden actual
        const order = await tx.order.findUnique({
          where: { id: parseInt(id) },
          include: {
            orderItems: true
          }
        });

        if (!order) {
          throw new Error('Orden no encontrada');
        }

        const previousStatus = order.status;

        // 2. Si se cancela, restaurar stock
        if (status === 'cancelled' && previousStatus !== 'cancelled') {
          for (const item of order.orderItems) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity
                }
              }
            });
          }
        }

        // 3. Si se des-cancela, reducir stock nuevamente
        if (previousStatus === 'cancelled' && status !== 'cancelled') {
          for (const item of order.orderItems) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity
                }
              }
            });
          }
        }

        // 4. Actualizar el estado de la orden
        return await tx.order.update({
          where: { id: parseInt(id) },
          data: { status },
          include: {
            orderItems: {
              include: {
                product: true
              }
            }
          }
        });
      });

      return result;
    } catch (error) {
      console.error('Error updating order status:', error);
      if (error.code === 'P2025') {
        throw new Error('Orden no encontrada');
      }
      throw error;
    }
  }

  // Eliminar orden
  static async deleteOrder(id) {
    try {
      // Usar transacción para eliminar de forma segura
      await prisma.$transaction(async (tx) => {
        // 1. Primero obtener la orden para restaurar el stock
        const order = await tx.order.findUnique({
          where: { id: parseInt(id) },
          include: {
            orderItems: true
          }
        });

        if (!order) {
          throw new Error('Orden no encontrada');
        }

        // 2. Restaurar stock de productos
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          });
        }

        // 3. Eliminar los orderItems primero
        await tx.orderItem.deleteMany({
          where: { orderId: parseInt(id) }
        });

        // 4. Finalmente eliminar la orden
        await tx.order.delete({
          where: { id: parseInt(id) }
        });
      });

      return { message: 'Orden eliminada correctamente' };
    } catch (error) {
      console.error('Error deleting order:', error);
      if (error.code === 'P2025') {
        throw new Error('Orden no encontrada');
      }
      throw error;
    }
  }

  // Obtener estadísticas de órdenes
  static async getOrderStats() {
    try {
      const totalOrders = await prisma.order.count();
      const pendingOrders = await prisma.order.count({
        where: { status: 'pending' }
      });
      const processingOrders = await prisma.order.count({
        where: { status: 'processing' }
      });
      const shippedOrders = await prisma.order.count({
        where: { status: 'shipped' }
      });
      const deliveredOrders = await prisma.order.count({
        where: { status: 'delivered' }
      });
      const cancelledOrders = await prisma.order.count({
        where: { status: 'cancelled' }
      });

      const totalRevenue = await prisma.order.aggregate({
        where: { status: 'delivered' },
        _sum: { total: true }
      });

      return {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: totalRevenue._sum.total || 0
      };
    } catch (error) {
      console.error('Error fetching order stats:', error);
      throw error;
    }
  }
}

module.exports = OrderServicePrisma;
