const OrderService = require('../services/orderServicePrisma');

class OrderController {
  // Obtener todas las órdenes
  static async getAllOrders(req, res) {
    try {
      const orders = await OrderService.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Error al obtener las órdenes' });
    }
  }

  // Obtener orden por ID
  static async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrderById(id);
      res.json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      if (error.message === 'Orden no encontrada') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al obtener la orden' });
      }
    }
  }

  // Crear orden
  static async createOrder(req, res) {

    try {
      const { customerName, customerEmail, customerLastname, total, items } = req.body;

      if (!customerName || !customerEmail || !customerLastname || !total || !items || items.length === 0) {
        return res.status(400).json({ error: 'Datos de orden incompletos' });
      }

      const result = await OrderService.createOrder(req.body);
      res.json(result);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Error al crear la orden' });
    }
  }

  // Actualizar estado de orden
  static async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'El estado es requerido' });
      }

      const result = await OrderService.updateOrderStatus(id, status);
      res.json(result);
    } catch (error) {
      console.error('Error updating order status:', error);
      if (error.message === 'Orden no encontrada') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al actualizar el estado de la orden' });
      }
    }
  }

  // Eliminar orden
  static async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      const result = await OrderService.deleteOrder(id);
      res.json(result);
    } catch (error) {
      console.error('Error deleting order:', error);
      if (error.message === 'Orden no encontrada') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al eliminar la orden' });
      }
    }
  }

  // Obtener estadísticas de órdenes
  static async getOrderStats(req, res) {
    try {
      const stats = await OrderService.getOrderStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching order stats:', error);
      res.status(500).json({ error: 'Error al obtener las estadísticas de órdenes' });
    }
  }

  // Obtener órdenes por cliente
  static async getOrdersByCustomer(req, res) {
    try {
      const { customerId } = req.params;
      const orders = await OrderService.getOrdersByCustomer(customerId);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      res.status(500).json({ error: 'Error al obtener las órdenes del cliente' });
    }
  }
}

module.exports = OrderController;
