const prisma = require('../lib/prisma');

class CustomerServicePrisma {
  // Obtener todos los clientes
  static async getAllCustomers() {
    try {
      const customers = await prisma.customer.findMany({
        include: {
          orders: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Procesar datos para incluir estadísticas de órdenes
      return customers.map(customer => {
        const orders = customer.orders || [];
        const total_spent = orders.reduce((sum, order) => sum + order.total, 0);
        const first_order = orders.length > 0 ? orders[orders.length - 1].createdAt : null;
        const last_order = orders.length > 0 ? orders[0].createdAt : null;

        return {
          ...customer,
          orders: orders.length,
          total_spent,
          first_order,
          last_order
        };
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  // Obtener cliente por ID
  static async getCustomerById(id) {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: parseInt(id) },
        include: {
          orders: {
            include: {
              orderItems: {
                include: {
                  product: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!customer) {
        throw new Error('Cliente no encontrado');
      }

      return customer;
    } catch (error) {
      console.error('Error fetching customer by id:', error);
      throw error;
    }
  }

  // Obtener cliente por email
  static async getCustomerByEmail(email) {
    try {
      const customer = await prisma.customer.findUnique({
        where: { email },
        include: {
          orders: {
            include: {
              orderItems: {
                include: {
                  product: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      return customer;
    } catch (error) {
      console.error('Error fetching customer by email:', error);
      throw error;
    }
  }

  // Crear cliente
  static async createCustomer(customerData) {
    try {
      const customer = await prisma.customer.create({
        data: {
          email: customerData.email,
          customerName: customerData.name || customerData.customerName,
          customerLastname: customerData.lastname || customerData.customerLastname,
          firstConnection: new Date(),
          lastConnection: new Date()
        }
      });

      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Actualizar cliente
  static async updateCustomer(id, customerData) {
    try {
      const customer = await prisma.customer.update({
        where: { id: parseInt(id) },
        data: {
          email: customerData.email,
          customerName: customerData.name || customerData.customerName,
          customerLastname: customerData.lastname || customerData.customerLastname
        }
      });

      return customer;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Cliente no encontrado');
      }
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  // Eliminar cliente
  static async deleteCustomer(id) {
    try {
      await prisma.customer.delete({
        where: { id: parseInt(id) }
      });

      return { message: 'Cliente eliminado exitosamente' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Cliente no encontrado');
      }
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Buscar clientes
  static async searchCustomers(searchTerm) {
    try {
      const customers = await prisma.customer.findMany({
        where: {
          OR: [
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { customerName: { contains: searchTerm, mode: 'insensitive' } },
            { customerLastname: { contains: searchTerm, mode: 'insensitive' } }
          ]
        },
        include: {
          orders: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return customers;
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }

  // Obtener estadísticas de clientes
  static async getCustomerStats() {
    try {
      const totalCustomers = await prisma.customer.count();
      const customersWithOrders = await prisma.customer.count({
        where: {
          orders: {
            some: {}
          }
        }
      });

      return {
        total: totalCustomers,
        withOrders: customersWithOrders,
        withoutOrders: totalCustomers - customersWithOrders
      };
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      throw error;
    }
  }

  // Crear o encontrar cliente (upsert)
  static async findOrCreateCustomer(customerData) {
    try {
      const customer = await prisma.customer.upsert({
        where: { email: customerData.email },
        update: {
          customerName: customerData.customerName,
          customerLastname: customerData.customerLastname
        },
        create: {
          email: customerData.email,
          customerName: customerData.customerName,
          customerLastname: customerData.customerLastname
        }
      });

      return customer;
    } catch (error) {
      console.error('Error finding or creating customer:', error);
      throw error;
    }
  }

  // Actualizar conexión de cliente
  static async updateConnection(customerId) {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: parseInt(customerId) }
      });

      if (!customer) {
        throw new Error('Cliente no encontrado');
      }

      // Actualizar última conexión y establecer primera conexión si no existe
      await prisma.customer.update({
        where: { id: parseInt(customerId) },
        data: {
          lastConnection: new Date(),
          // Si es la primera vez, establecer firstConnection
          ...(customer.firstConnection ? {} : { firstConnection: new Date() })
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating customer connection:', error);
      throw error;
    }
  }
}

module.exports = CustomerServicePrisma;
