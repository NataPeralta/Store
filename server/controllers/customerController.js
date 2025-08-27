const CustomerService = require('../services/customerServicePrisma');

class CustomerController {
  // Obtener todos los clientes
  static async getAllCustomers(req, res) {
    try {
      const customers = await CustomerService.getAllCustomers();
      res.json(customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ error: 'Error al obtener los clientes' });
    }
  }

  // Obtener cliente por ID
  static async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      const customer = await CustomerService.getCustomerById(id);
      res.json(customer);
    } catch (error) {
      console.error('Error fetching customer:', error);
      if (error.message === 'Cliente no encontrado') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al obtener el cliente' });
      }
    }
  }

  // Crear cliente
  static async createCustomer(req, res) {
    try {
      const { name, email, customerName, customerLastname, lastname } = req.body;

      // Validar que tengamos al menos un nombre y email
      const finalName = name || customerName;
      const finalLastname = lastname || customerLastname;

      if (!finalName || !email) {
        return res.status(400).json({ error: 'Nombre y email son requeridos' });
      }

      const customerData = {
        email,
        name: finalName,
        lastname: finalLastname
      };

      const result = await CustomerService.createCustomer(customerData);
      res.json(result);
    } catch (error) {
      console.error('Error creating customer:', error);
      if (error.code === 'P2002') {
        res.status(400).json({ error: 'Ya existe un cliente con este email' });
      } else {
        res.status(500).json({ error: 'Error al crear el cliente' });
      }
    }
  }

  // Registrar o obtener cliente (para frontend)
  static async registerOrGet(req, res) {
    try {
      const { email, customerName, customerLastname } = req.body;

      if (!email || !customerName || !customerLastname) {
        return res.status(400).json({ error: 'Email, nombre y apellido son requeridos' });
      }

      // Buscar si ya existe un cliente con ese email
      let customer = await CustomerService.getCustomerByEmail(email);

      if (customer) {
        // Si existe, actualizar los datos si son diferentes
        if (customer.customerName !== customerName || customer.customerLastname !== customerLastname) {
          customer = await CustomerService.updateCustomer(customer.id, {
            name: customerName,
            lastname: customerLastname
          });
        }
      } else {
        // Si no existe, crear nuevo cliente
        customer = await CustomerService.createCustomer({
          email,
          name: customerName,
          lastname: customerLastname
        });
      }

      res.json(customer);
    } catch (error) {
      console.error('Error in registerOrGet:', error);
      if (error.code === 'P2002') {
        res.status(400).json({ error: 'Ya existe un cliente con este email' });
      } else {
        res.status(500).json({ error: 'Error al procesar el registro' });
      }
    }
  }

  // Actualizar cliente
  static async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const result = await CustomerService.updateCustomer(id, req.body);
      res.json(result);
    } catch (error) {
      console.error('Error updating customer:', error);
      if (error.message === 'Cliente no encontrado') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al actualizar el cliente' });
      }
    }
  }

  // Eliminar cliente
  static async deleteCustomer(req, res) {
    try {
      const { id } = req.params;
      const result = await CustomerService.deleteCustomer(id);
      res.json(result);
    } catch (error) {
      console.error('Error deleting customer:', error);
      if (error.message === 'Cliente no encontrado') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('No se puede eliminar')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al eliminar el cliente' });
      }
    }
  }

  // Buscar clientes
  static async searchCustomers(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({ error: 'Se requiere un término de búsqueda de al menos 2 caracteres' });
      }

      const customers = await CustomerService.searchCustomers(q.trim());
      res.json(customers);
    } catch (error) {
      console.error('Error searching customers:', error);
      res.status(500).json({ error: 'Error al buscar clientes' });
    }
  }

  // Obtener estadísticas de clientes
  static async getCustomerStats(req, res) {
    try {
      const stats = await CustomerService.getCustomerStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching customer stats:', error);
      res.status(500).json({ error: 'Error al obtener las estadísticas de clientes' });
    }
  }

  // Actualizar conexión de cliente
  static async updateConnection(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email es requerido' });
      }

      const customer = await CustomerService.getCustomerByEmail(email);

      if (!customer) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      // Actualizar última conexión
      await CustomerService.updateConnection(customer.id);

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating connection:', error);
      res.status(500).json({ error: 'Error actualizando conexión' });
    }
  }
}

module.exports = CustomerController;
