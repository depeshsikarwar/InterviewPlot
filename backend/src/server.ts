import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 InterviewPilot Backend Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  logger.info(`📡 Client URL: ${env.CLIENT_URL}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing HTTP server gracefully.');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason: any) => {
  logger.error(`Unhandled Rejection: ${reason?.message || reason}`);
});
