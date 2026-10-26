import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';

export const healthRouter = Router();

healthRouter.get('/', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});
