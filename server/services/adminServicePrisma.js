const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AdminServicePrisma {
  // Autenticar usuario admin
  static async authenticateUser(username, password) {
    try {
      const user = await prisma.adminUser.findUnique({
        where: { username }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Contraseña incorrecta');
      }

      // Generar token JWT
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return {
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt
        },
        token
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  // Crear usuario admin
  static async createAdminUser(userData) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await prisma.adminUser.findUnique({
        where: { username: userData.username }
      });

      if (existingUser) {
        throw new Error('El nombre de usuario ya existe');
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await prisma.adminUser.create({
        data: {
          username: userData.username,
          password: hashedPassword
        }
      });

      return {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  }

  // Obtener usuario admin por ID
  static async getAdminUserById(id) {
    try {
      const user = await prisma.adminUser.findUnique({
        where: { id: parseInt(id) }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error('Error fetching admin user by id:', error);
      throw error;
    }
  }

  // Actualizar contraseña de usuario admin
  static async updateAdminPassword(id, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const user = await prisma.adminUser.update({
        where: { id: parseInt(id) },
        data: { password: hashedPassword }
      });

      return { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Usuario no encontrado');
      }
      console.error('Error updating admin password:', error);
      throw error;
    }
  }

  // Eliminar usuario admin
  static async deleteAdminUser(id) {
    try {
      await prisma.adminUser.delete({
        where: { id: parseInt(id) }
      });

      return { message: 'Usuario eliminado exitosamente' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Usuario no encontrado');
      }
      console.error('Error deleting admin user:', error);
      throw error;
    }
  }

  // Obtener todos los usuarios admin
  static async getAllAdminUsers() {
    try {
      const users = await prisma.adminUser.findMany({
        orderBy: { createdAt: 'desc' }
      });

      return users.map(user => ({
        id: user.id,
        username: user.username,
        createdAt: user.createdAt
      }));
    } catch (error) {
      console.error('Error fetching admin users:', error);
      throw error;
    }
  }

  // Verificar token JWT
  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

      const user = await prisma.adminUser.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error('Error verifying token:', error);
      throw error;
    }
  }

  // ===================== Métodos compatibles con AdminController =====================
  // Login: devolver solo el usuario; el token lo genera el controller
  static async authenticateAdmin(username, password) {
    const result = await AdminServicePrisma.authenticateUser(username, password);
    return result.user;
  }

  // Crear admin (map a createAdminUser)
  static async createAdmin(data) {
    return AdminServicePrisma.createAdminUser(data);
  }

  // Obtener admin por ID (map)
  static async getAdminById(id) {
    try {
      return await AdminServicePrisma.getAdminUserById(id);
    } catch (error) {
      if (error.message && error.message.includes('no encontrado')) {
        throw new Error('Usuario admin no encontrado');
      }
      throw error;
    }
  }

  // Listar admins (map)
  static async getAllAdmins() {
    return AdminServicePrisma.getAllAdminUsers();
  }

  // Eliminar admin (map)
  static async deleteAdmin(id) {
    try {
      return await AdminServicePrisma.deleteAdminUser(id);
    } catch (error) {
      if (error.code === 'P2025' || (error.message && error.message.includes('no encontrado'))) {
        throw new Error('Usuario admin no encontrado');
      }
      throw error;
    }
  }

  // Actualizar admin: permite actualizar username y/o password
  static async updateAdmin(id, data) {
    try {
      const updateData = {};
      if (typeof data.username === 'string' && data.username.trim() !== '') {
        updateData.username = data.username.trim();
      }
      if (typeof data.password === 'string' && data.password.length >= 6) {
        const hashed = await bcrypt.hash(data.password, 10);
        updateData.password = hashed;
      }

      if (Object.keys(updateData).length === 0) {
        return { message: 'Sin cambios para actualizar' };
      }

      await prisma.adminUser.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      return { message: 'Usuario actualizado exitosamente' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Usuario admin no encontrado');
      }
      if (error.code === 'P2002') {
        throw new Error('El nombre de usuario ya existe');
      }
      throw error;
    }
  }

  // Cambiar contraseña validando la actual
  static async changePassword(id, currentPassword, newPassword) {
    try {
      const user = await prisma.adminUser.findUnique({
        where: { id: parseInt(id) }
      });

      if (!user) {
        throw new Error('Usuario admin no encontrado');
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        throw new Error('Contraseña incorrecta');
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.adminUser.update({
        where: { id: user.id },
        data: { password: hashed }
      });

      return { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Usuario admin no encontrado');
      }
      throw error;
    }
  }
}

module.exports = AdminServicePrisma;
