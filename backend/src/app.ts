import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimiter.middleware';

// Routes
import authRoutes from './modules/auth/auth.routes';
import profileRoutes from './modules/profile/profile.routes';
import interviewRoutes from './modules/interviews/interview.routes';
import codingRoutes from './modules/coding/coding.routes';
import resumeRoutes from './modules/resumes/resume.routes';
import jobRoutes from './modules/jobs/job.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import learningRoutes from './modules/learning/learning.routes';
import accountRoutes from './modules/account/account.routes';
import questionBankRoutes from './modules/questions/questionBank.routes';

export function createApp(): Express {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(env.COOKIE_SECRET));

  // Request logging
  app.use((req: Request, _res: Response, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });

  // Health check endpoint
  app.get('/api/v1/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'InterviewPilot AI API',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  // Apply general API rate limiting
  app.use('/api/v1', apiLimiter);

  // Mount modules
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/profile', profileRoutes);
  app.use('/api/v1/interviews', interviewRoutes);
  app.use('/api/v1/code', codingRoutes);
  app.use('/api/v1/resumes', resumeRoutes);
  app.use('/api/v1/job-descriptions', jobRoutes);
  app.use('/api/v1/analytics', analyticsRoutes);
  app.use('/api/v1/learning-plan', learningRoutes);
  app.use('/api/v1/account', accountRoutes);
  app.use('/api/v1/question-bank', questionBankRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} not found`,
      },
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
