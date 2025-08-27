const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AdminServicePrisma {
  // Autenticar usuario admin
  static async authenticateAdmin(username, password) {
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
}

module.exports = AdminServicePrisma;
