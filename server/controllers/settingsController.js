const SettingsService = require('../services/settingsServicePrisma');

class SettingsController {
  // Obtener todas las configuraciones
  static async getAllSettings(req, res) {
    try {
      const settings = await SettingsService.getAllSettings();
      res.json(settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Error al obtener las configuraciones' });
    }
  }

  // Obtener configuración por clave
  static async getSetting(req, res) {
    try {
      const { key } = req.params;
      const value = await SettingsService.getSetting(key);
      res.json({ key, value });
    } catch (error) {
      console.error('Error fetching setting:', error);
      if (error.message === 'Configuración no encontrada') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al obtener la configuración' });
      }
    }
  }

  // Actualizar configuración
  static async updateSetting(req, res) {
    try {
      const { key } = req.params;
      const { value } = req.body;

      if (value === undefined) {
        return res.status(400).json({ error: 'El valor es requerido' });
      }

      const result = await SettingsService.updateSetting(key, value);
      res.json(result);
    } catch (error) {
      console.error('Error updating setting:', error);
      res.status(500).json({ error: 'Error al actualizar la configuración' });
    }
  }

  // Actualizar múltiples configuraciones
  static async updateMultipleSettings(req, res) {
    try {
      const { settings } = req.body;

      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ error: 'Se requiere un objeto de configuraciones' });
      }

      const result = await SettingsService.updateMultipleSettings(settings);
      res.json(result);
    } catch (error) {
      console.error('Error updating multiple settings:', error);
      res.status(500).json({ error: 'Error al actualizar las configuraciones' });
    }
  }

  // Eliminar configuración
  static async deleteSetting(req, res) {
    try {
      const { key } = req.params;
      const result = await SettingsService.deleteSetting(key);
      res.json(result);
    } catch (error) {
      console.error('Error deleting setting:', error);
      if (error.message === 'Configuración no encontrada') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error al eliminar la configuración' });
      }
    }
  }

  // Obtener tasa de cambio
  static async getExchangeRate(req, res) {
    try {
      const rate = await SettingsService.getExchangeRate();
      res.json({ exchange_rate: rate });
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      res.status(500).json({ error: 'Error al obtener la tasa de cambio' });
    }
  }

  // Actualizar tasa de cambio
  static async updateExchangeRate(req, res) {
    try {
      const { rate, exchange_rate } = req.body;
      const rateValue = rate || exchange_rate;

      if (!rateValue || isNaN(parseFloat(rateValue))) {
        return res.status(400).json({ error: 'Se requiere una tasa de cambio válida' });
      }

      const result = await SettingsService.updateExchangeRate(parseFloat(rateValue));
      res.json(result);
    } catch (error) {
      console.error('Error updating exchange rate:', error);
      res.status(500).json({ error: 'Error al actualizar la tasa de cambio' });
    }
  }

  // Obtener configuración de la tienda
  static async getStoreSettings(req, res) {
    try {
      const settings = await SettingsService.getStoreSettings();
      res.json(settings);
    } catch (error) {
      console.error('Error fetching store settings:', error);
      res.status(500).json({ error: 'Error al obtener la configuración de la tienda' });
    }
  }

  // Actualizar configuración de la tienda
  static async updateStoreSettings(req, res) {
    try {
      const {
        store_name,
        store_description,
        store_address,
        store_phone,
        store_email,
        exchange_rate,
        currency,
        tax_rate,
        shipping_cost
      } = req.body;

      const settings = {};

      if (store_name !== undefined) settings.store_name = store_name;
      if (store_description !== undefined) settings.store_description = store_description;
      if (store_address !== undefined) settings.store_address = store_address;
      if (store_phone !== undefined) settings.store_phone = store_phone;
      if (store_email !== undefined) settings.store_email = store_email;
      if (exchange_rate !== undefined) settings.exchange_rate = exchange_rate.toString();
      if (currency !== undefined) settings.currency = currency;
      if (tax_rate !== undefined) settings.tax_rate = tax_rate.toString();
      if (shipping_cost !== undefined) settings.shipping_cost = shipping_cost.toString();

      const result = await SettingsService.updateMultipleSettings(settings);
      res.json(result);
    } catch (error) {
      console.error('Error updating store settings:', error);
      res.status(500).json({ error: 'Error al actualizar la configuración de la tienda' });
    }
  }
}

module.exports = SettingsController;
