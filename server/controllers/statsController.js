const StatsService = require('../services/statsServicePrisma');

class StatsController {
  // Obtener estadísticas generales
  static async getGeneralStats(req, res) {
    try {
      const stats = await StatsService.getGeneralStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching general stats:', error);
      res.status(500).json({ error: 'Error al obtener las estadísticas' });
    }
  }
}

module.exports = StatsController;
