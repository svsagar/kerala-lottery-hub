import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { prisma } from './config/database';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { healthRouter } from './routes/health';
import { lotteryRouter } from './routes/lotteries';
import { drawRouter } from './routes/draws';

dotenv.config();

const app: Express = express();
const PORT = process.env.API_PORT || 3001;
const HOST = process.env.API_HOST || '0.0.0.0';

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb' }));
app.use(requestLogger);

// Routes
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/lotteries', lotteryRouter);
app.use('/api/v1/draws', drawRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: 'Not Found',
    path: req.path,
  });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connected successfully');

    app.listen(PORT, HOST as any, () => {
      logger.info(`Server running at http://${HOST}:${PORT}`);
      logger.info(`API endpoint: http://${HOST}:${PORT}/api/v1`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
