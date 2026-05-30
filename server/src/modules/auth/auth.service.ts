import { prisma } from "../../config/prisma.js";
import { safeRedisDel, safeRedisSet } from "../../config/redis.js";
import { hashPassword, comparePassword } from "../../utils/hashPassword.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateVerificationToken,
  generatePasswordResetToken,
  verifyRefreshToken,
} from "../../utils/generateToken.js";
import { EmailService } from "../../services/email.service.js";
import { ApiError } from "../../utils/ApiError.js";
import type {
  RegisterInput,
  LoginInput,
  VerifyEmailInput,
  ResendVerificationEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  RefreshTokenInput,
} from "./auth.schema.js";

export class AuthService {
  static async register(data: RegisterInput) {
    const email = data.email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw ApiError.conflict("Email already registered");
    }

    const hashedPassword = await hashPassword(data.password);
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phone: data.phone,
        country: data.country,
        status: "PENDING",
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    void EmailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.firstName,
    ).catch((error) => {
      console.error("Failed to send verification email:", error);
    });

    return {
      user,
      message:
        "Registration successful. Please check your email to verify your account.",
    };
  }

  static async login(data: LoginInput) {
    const email = data.email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    if (!user.isEmailVerified) {
      throw ApiError.forbidden("Please verify your email before logging in");
    }

    if (user.status === "SUSPENDED") {
      throw ApiError.forbidden(
        "Your account has been suspended. Contact support.",
      );
    }

    if (user.status === "DEACTIVATED") {
      throw ApiError.forbidden("Your account has been deactivated.");
    }

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      type: "user",
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
      type: "user",
    });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
      },
    });

    safeRedisSet(
      `user:session:${user.id}`,
      60 * 60 * 24,
      JSON.stringify({ id: user.id, email: user.email, role: user.role }),
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        phone: user.phone,
        country: user.country,
        isEmailVerified: user.isEmailVerified,
        profileImage: user.profileImage,
        verified: user.verified,
        verificationStatus: user.verificationStatus,
        profileScore: user.profileScore,
        memberSince: user.memberSince,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  static async verifyEmail(data: VerifyEmailInput) {
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: data.token,
        emailVerificationExpires: { gte: new Date() },
      },
    });

    if (!user) {
      throw ApiError.badRequest("Invalid or expired verification token");
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        status: "ACTIVE",
        emailVerificationToken: null,
        emailVerificationExpires: null,
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
      },
    });

    const accessToken = generateAccessToken({
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      type: "user",
    });

    const refreshToken = generateRefreshToken({
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      type: "user",
    });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: updatedUser.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    safeRedisSet(
      `user:session:${updatedUser.id}`,
      60 * 60 * 24,
      JSON.stringify({
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      }),
    );

    void EmailService.sendWelcomeEmail(
      updatedUser.email,
      updatedUser.firstName,
      updatedUser.role,
    ).catch((error) => {
      console.error("Failed to send welcome email:", error);
    });

    return {
      message: "Email verified successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        status: updatedUser.status,
        phone: updatedUser.phone,
        country: updatedUser.country,
        isEmailVerified: updatedUser.isEmailVerified,
        profileImage: updatedUser.profileImage,
        verified: updatedUser.verified,
        verificationStatus: updatedUser.verificationStatus,
        profileScore: updatedUser.profileScore,
        memberSince: updatedUser.memberSince,
        lastLoginAt: updatedUser.lastLoginAt,
        createdAt: updatedUser.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  static async resendVerificationEmail(data: ResendVerificationEmailInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    const message =
      "If this account needs verification, a new verification email has been sent.";

    if (!user || user.isEmailVerified) {
      return { message };
    }

    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    void EmailService.sendVerificationEmail(
      user.email,
      verificationToken,
      user.firstName,
    ).catch((error) => {
      console.error("Failed to resend verification email:", error);
    });

    return { message };
  }

  static async forgotPassword(data: ForgotPasswordInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    const message =
      "If an account with that email exists, a password reset link has been sent.";

    if (!user) {
      return { message };
    }

    const resetToken = generatePasswordResetToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    void EmailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.firstName,
    ).catch((error) => {
      console.error("Failed to send password reset email:", error);
    });

    return { message };
  }

  static async resetPassword(data: ResetPasswordInput) {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: data.token,
        passwordResetExpires: { gte: new Date() },
      },
    });

    if (!user) {
      throw ApiError.badRequest("Invalid or expired reset token");
    }

    const hashedPassword = await hashPassword(data.password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    safeRedisDel(`user:session:${user.id}`);

    return {
      message:
        "Password reset successful. Please log in with your new password.",
    };
  }

  static async refreshAccessToken(data: RefreshTokenInput) {
    try {
      verifyRefreshToken(data.refreshToken);
    } catch {
      throw ApiError.unauthorized("Invalid refresh token");
    }

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: data.refreshToken },
      include: { user: true },
    });

    if (!tokenRecord) {
      throw ApiError.unauthorized("Refresh token not found");
    }

    if (tokenRecord.expiresAt < new Date()) {
      await prisma.refreshToken.delete({
        where: { id: tokenRecord.id },
      });

      throw ApiError.unauthorized("Refresh token expired");
    }

    if (
      tokenRecord.user.status !== "ACTIVE" ||
      !tokenRecord.user.isEmailVerified
    ) {
      throw ApiError.forbidden("User account is not active");
    }

    const accessToken = generateAccessToken({
      id: tokenRecord.user.id,
      email: tokenRecord.user.email,
      role: tokenRecord.user.role,
      type: "user",
    });

    const refreshToken = generateRefreshToken({
      id: tokenRecord.user.id,
      email: tokenRecord.user.email,
      role: tokenRecord.user.role,
      type: "user",
    });

    await prisma.$transaction([
      prisma.refreshToken.delete({
        where: { id: tokenRecord.id },
      }),
      prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: tokenRecord.user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    return { accessToken, refreshToken };
  }

  static async logout(refreshToken?: string) {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    return { message: "Logged out successfully" };
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        country: true,
        profileImage: true,
        role: true,
        status: true,
        isEmailVerified: true,
        verified: true,
        verificationStatus: true,
        profileScore: true,
        memberSince: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    return user;
  }
}