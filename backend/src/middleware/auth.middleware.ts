import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { logger } from '../config/logger';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.jwt) {
      // Or check cookie
      token = req.cookies.jwt;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token required.',
        },
      });
      return;
    }

    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error: any) {
    logger.warn(`Auth token verification failed: ${error.message}`);
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired session token. Please sign in again.',
      },
    });
  }
}

/**
 * Optional authentication: attaches user if present, but doesn't block if absent
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (token) {
      req.user = verifyAccessToken(token);
    }
  } catch {
    // Ignore invalid tokens for optional endpoints
  }
  next();
}
