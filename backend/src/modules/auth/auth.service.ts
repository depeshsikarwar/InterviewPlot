import crypto from 'crypto';
import { prisma } from '../../prisma';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt';
import { AppError } from '../../middleware/error.middleware';
import { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from './auth.schema';
import { logger } from '../../config/logger';

export class AuthService {
  async register(input: RegisterInput, userAgent?: string, ipAddress?: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS');
    }

    const passwordHash = await hashPassword(input.password);

    // Create user and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          isVerified: true, // Auto-verified for seamless onboarding in MVP
        },
      });

      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          fullName: input.fullName,
          targetRole: input.targetRole || 'Software Engineer',
          experienceLevel: input.experienceLevel || 'Fresher',
          technicalSkills: ['JavaScript', 'Python', 'DSA', 'SQL'],
          programmingLanguages: ['JavaScript', 'Python'],
        },
      });

      // Default user consent
      await tx.userConsent.create({
        data: {
          userId: user.id,
          audioConsent: true,
          termsAccepted: true,
          privacyAccepted: true,
        },
      });

      return { user, profile };
    });

    const tokenPayload = {
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh session
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshSession.create({
      data: {
        userId: result.user.id,
        tokenHash: refreshTokenHash,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    logger.info(`User registered successfully: ${result.user.email} (${result.user.id})`);

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        fullName: result.profile.fullName,
        targetRole: result.profile.targetRole,
        experienceLevel: result.profile.experienceLevel,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async login(input: LoginInput, userAgent?: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { profile: true },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Hash and store refresh session
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshSession.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    logger.info(`User logged in successfully: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.profile?.fullName || 'User',
        targetRole: user.profile?.targetRole || 'Software Engineer',
        experienceLevel: user.profile?.experienceLevel || 'Fresher',
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await prisma.refreshSession.updateMany({
        where: {
          userId,
          tokenHash: refreshTokenHash,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    } else {
      // Revoke all active sessions for this user
      await prisma.refreshSession.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }
  }

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    // Don't leak whether user exists for security
    if (!user) {
      return { message: 'If an account exists with this email, a reset token has been generated.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: expires,
      },
    });

    logger.info(`Password reset requested for ${user.email}. Development token: ${resetToken}`);

    return {
      message: 'If an account exists with this email, a reset token has been generated.',
      // Provide token in development response for easy manual testing without requiring an SMTP server
      ...(process.env.NODE_ENV === 'development' ? { resetToken } : {}),
    };
  }

  async resetPassword(input: ResetPasswordInput) {
    const resetTokenHash = crypto.createHash('sha256').update(input.token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError('Password reset token is invalid or has expired', 400, 'INVALID_RESET_TOKEN');
    }

    const passwordHash = await hashPassword(input.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    // Invalidate existing sessions
    await prisma.refreshSession.updateMany({
      where: { userId: user.id },
      data: { revokedAt: new Date() },
    });

    logger.info(`Password reset successfully for user: ${user.email}`);

    return { message: 'Password has been successfully reset. You may now log in.' };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        skills: {
          include: { skill: true },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      profile: user.profile,
      skills: user.skills.map((us) => ({
        skillId: us.skillId,
        name: us.skill.name,
        category: us.skill.category,
        proficiencyScore: us.proficiencyScore,
        confidenceLevel: us.confidenceLevel,
        totalAttempts: us.totalAttempts,
        lastAssessedAt: us.lastAssessedAt,
      })),
    };
  }
}

export const authService = new AuthService();
