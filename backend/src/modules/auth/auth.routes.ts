import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { authLimiter } from '../../middleware/rateLimiter.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schema';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validate({ body: registerSchema }),
  authController.register.bind(authController)
);

router.post(
  '/login',
  authLimiter,
  validate({ body: loginSchema }),
  authController.login.bind(authController)
);

router.post('/logout', authController.logout.bind(authController));

router.post(
  '/forgot-password',
  authLimiter,
  validate({ body: forgotPasswordSchema }),
  authController.forgotPassword.bind(authController)
);

router.post(
  '/reset-password',
  authLimiter,
  validate({ body: resetPasswordSchema }),
  authController.resetPassword.bind(authController)
);

router.get('/me', requireAuth, authController.getMe.bind(authController));

export default router;
