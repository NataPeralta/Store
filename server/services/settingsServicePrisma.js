const prisma = require('../lib/prisma');

class SettingsServicePrisma {
  // Obtener configuración por clave
  static async getSetting(key) {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key }
      });

      return setting ? setting.value : null;
    } catch (error) {
      console.error('Error fetching setting:', error);
      throw error;
    }
  }

  // Obtener todas las configuraciones
  static async getAllSettings() {
    try {
      const settings = await prisma.setting.findMany();

      // Convertir a objeto clave-valor
      const settingsObject = {};
      settings.forEach(setting => {
        settingsObject[setting.key] = setting.value;
      });

      return settingsObject;
    } catch (error) {
      console.error('Error fetching all settings:', error);
      throw error;
    }
  }

  // Crear o actualizar configuración
  static async upsertSetting(key, value) {
    try {
      const setting = await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });

      return setting;
    } catch (error) {
      console.error('Error upserting setting:', error);
      throw error;
    }
  }

  // Eliminar configuración
  static async deleteSetting(key) {
    try {
      await prisma.setting.delete({
        where: { key }
      });

      return { message: 'Configuración eliminada exitosamente' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Configuración no encontrada');
      }
      console.error('Error deleting setting:', error);
      throw error;
    }
  }

  // Obtener tipo de cambio
  static async getExchangeRate() {
    try {
      const exchangeRate = await this.getSetting('exchange_rate');
      return parseFloat(exchangeRate) || 1335;
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      return 1335; // Valor por defecto
    }
  }

  // Actualizar tipo de cambio
  static async updateExchangeRate(rate) {
    try {
      await this.upsertSetting('exchange_rate', rate.toString());
      return { message: 'Tipo de cambio actualizado exitosamente' };
    } catch (error) {
      console.error('Error updating exchange rate:', error);
      throw error;
    }
  }

  // Inicializar configuraciones por defecto
  static async initializeDefaultSettings() {
    try {
      const defaultSettings = [
        { key: 'exchange_rate', value: '1335' },
        { key: 'site_name', value: 'SheetCart' },
        { key: 'site_description', value: 'Tu tienda online' }
      ];

      for (const setting of defaultSettings) {
        await this.upsertSetting(setting.key, setting.value);
      }

      return { message: 'Configuraciones por defecto inicializadas' };
    } catch (error) {
      console.error('Error initializing default settings:', error);
      throw error;
    }
  }
}

module.exports = SettingsServicePrisma;
