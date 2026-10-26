import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Disconnect on process exit
process.on('exit', async () => {
  await prisma.$disconnect();
});
