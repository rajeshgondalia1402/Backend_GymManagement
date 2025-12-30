import app from './app';
import { config, Database } from './config';
import { logger } from './common/utils';

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await Database.connect();

    // Start server
    const server = app.listen(config.env.PORT, () => {
      logger.info(`🚀 Server is running on port ${config.env.PORT}`);
      logger.info(`📚 API Documentation available at http://localhost:${config.env.PORT}/api-docs`);
      logger.info(`🌍 Environment: ${config.env.NODE_ENV}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        await Database.disconnect();
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
