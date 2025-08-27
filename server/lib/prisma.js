const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Manejar desconexión graceful
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
