const prisma = require('../lib/prisma');

class StatsServicePrisma {
  // Obtener estadísticas generales del sistema
  static async getGeneralStats() {
    try {
      // Contar productos activos
      const productCount = await prisma.product.count({
        where: { active: true }
      });

      // Contar órdenes
      const orderCount = await prisma.order.count();

      // Calcular valor en stock
      const stockStats = await prisma.product.aggregate({
        where: { active: true },
        _sum: {
          price: true,
          originalPrice: true
        }
      });

      // Calcular total vendido (órdenes completadas)
      const totalSold = await prisma.order.aggregate({
        where: { status: 'delivered' },
        _sum: { total: true }
      });

      // Contar clientes
      const customerCount = await prisma.customer.count();

      // Contar categorías activas
      const categoryCount = await prisma.category.count({
        where: { active: true }
      });

      return {
        productCount,
        orderCount,
        customerCount,
        categoryCount,
        valueInStock: stockStats._sum.price || 0,
        valueInvested: stockStats._sum.originalPrice || 0,
        totalSold: totalSold._sum.total || 0
      };
    } catch (error) {
      console.error('Error fetching general stats:', error);
      throw error;
    }
  }

  // Obtener estadísticas de ventas por período
  static async getSalesStats(period = 'month') {
    try {
      const now = new Date();
      let startDate;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const salesStats = await prisma.order.aggregate({
        where: {
          createdAt: {
            gte: startDate
          },
          status: 'delivered'
        },
        _sum: { total: true },
        _count: true
      });

      return {
        period,
        totalSales: salesStats._sum.total || 0,
        orderCount: salesStats._count || 0,
        averageOrderValue: salesStats._count > 0 ? (salesStats._sum.total || 0) / salesStats._count : 0
      };
    } catch (error) {
      console.error('Error fetching sales stats:', error);
      throw error;
    }
  }

  // Obtener productos más vendidos
  static async getTopProducts(limit = 10) {
    try {
      const topProducts = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: limit
      });

      const productsWithDetails = await Promise.all(
        topProducts.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: {
              id: true,
              name: true,
              price: true,
              stock: true
            }
          });

          return {
            ...product,
            totalSold: item._sum.quantity
          };
        })
      );

      return productsWithDetails.filter(product => product !== null);
    } catch (error) {
      console.error('Error fetching top products:', error);
      throw error;
    }
  }
}

module.exports = StatsServicePrisma;
