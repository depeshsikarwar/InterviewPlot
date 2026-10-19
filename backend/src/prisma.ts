import { PrismaClient } from '@prisma/client';
import { logger } from './config/logger';

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
});

prisma.$on('error', (e) => {
  logger.error(`Prisma Error: ${e.message}`);
});

if (process.env.NODE_ENV === 'development') {
  prisma.$on('warn', (e) => {
    logger.warn(`Prisma Warn: ${e.message}`);
  });
}
