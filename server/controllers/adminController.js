const AdminService = require('../services/adminServicePrisma');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

class AdminController {
  // Obtener todos los usuarios admin
  static async getAllAdmins(req, res) {
    try {
      const admins = await AdminService.getAllAdmins();
      res.json(admins);
    } catch (error) {
      console.error('Error fetching admins:', error);
      res.status(500).json({ error: 'Error al obtener los usuarios admin' });
    }
  }

  // Obtener usuario admin por ID
  static async getAdminById(req, res) {
    try {
      const { id } = req.params;
      const admin = await AdminService.getAdminById(id);
      res.json(admin);
    } catch (error) {
      console.error('Error fetching admin:', error);
      if (error.message === 'Usuario admin no encontrado') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al obtener el usuario admin' });
      }
    }
  }

  // Crear usuario admin
  static async createAdmin(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username y password son requeridos' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }

      const result = await AdminService.createAdmin(req.body);
      res.json(result);
    } catch (error) {
      console.error('Error creating admin:', error);
      if (error.message.includes('ya existe')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al crear el usuario admin' });
      }
    }
  }

  // Actualizar usuario admin
  static async updateAdmin(req, res) {
    try {
      const { id } = req.params;
      const result = await AdminService.updateAdmin(id, req.body);
      res.json(result);
    } catch (error) {
      console.error('Error updating admin:', error);
      if (error.message === 'Usuario admin no encontrado') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('ya existe')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al actualizar el usuario admin' });
      }
    }
  }

  // Eliminar usuario admin
  static async deleteAdmin(req, res) {
    try {
      const { id } = req.params;
      const result = await AdminService.deleteAdmin(id);
      res.json(result);
    } catch (error) {
      console.error('Error deleting admin:', error);
      if (error.message === 'Usuario admin no encontrado') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al eliminar el usuario admin' });
      }
    }
  }

  // Cambiar contraseña
  static async changePassword(req, res) {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Contraseña actual y nueva contraseña son requeridas' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
      }

      const result = await AdminService.changePassword(id, currentPassword, newPassword);
      res.json(result);
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.message.includes('incorrecta') || error.message.includes('no encontrado')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al cambiar la contraseña' });
      }
    }
  }

  // Login de admin
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username y password son requeridos' });
      }

      const admin = await AdminService.authenticateAdmin(username, password);

      // Generar token JWT
      const token = jwt.sign(
        {
          id: admin.id,
          username: admin.username
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login exitoso',
        token: token,
        user: admin
      });
    } catch (error) {
      console.error('Error during login:', error);
      if (error.message.includes('no encontrado') || error.message.includes('incorrecta')) {
        res.status(401).json({ error: 'Credenciales inválidas' });
      } else {
        res.status(500).json({ error: 'Error durante el login' });
      }
    }
  }

  // Verificar token
  static async verifyToken(req, res) {
    try {
      // El middleware authenticateToken ya verificó el token
      // Solo necesitamos devolver la información del usuario
      res.json({
        valid: true,
        user: req.user
      });
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(401).json({ error: 'Token inválido' });
    }
  }
}

module.exports = AdminController;
