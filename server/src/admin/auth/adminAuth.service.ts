import { Role } from '@prisma/client'
import { prisma } from '../../config/prisma.js'
import { env } from '../../config/env.js'
import redisClient, { isRedisReady } from '../../config/redis.js'
import { hashPassword, comparePassword } from '../../utils/hashPassword.js'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/generateToken.js'
import { ApiError } from '../../utils/ApiError.js'
import {
  AdminLoginInput,
  AdminRefreshTokenInput,
  BootstrapSuperAdminInput,
  CreateAdminInput,
} from './adminAuth.schema.js'

const REDIS_OPERATION_TIMEOUT_MS = 750

const runOptionalRedisOperation = async (operation: () => Promise<unknown>, label: string) => {
  if (!isRedisReady()) return

  let timeout: ReturnType<typeof setTimeout> | undefined

  try {
    await Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error(`${label} timed out after ${REDIS_OPERATION_TIMEOUT_MS}ms`)),
          REDIS_OPERATION_TIMEOUT_MS
        )
      }),
    ])
  } catch (error) {
    console.error(`${label}:`, error)
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}
export class AdminAuthService {
  static async getBootstrapStatus() {
    const activeAdminCount = await prisma.admin.count({
      where: { isActive: true },
    })

    return {
      requiresBootstrap: activeAdminCount === 0,
      hasActiveAdmin: activeAdminCount > 0,
    }
  }

  static async bootstrapSuperAdmin(data: BootstrapSuperAdminInput) {
    if (data.setupSecret !== env.ADMIN_BOOTSTRAP_SECRET) {
      throw ApiError.forbidden('Invalid setup secret')
    }

    const activeAdminCount = await prisma.admin.count({
      where: { isActive: true },
    })

    if (activeAdminCount > 0) {
      throw ApiError.conflict('Admin bootstrap is already completed')
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { email: data.email.toLowerCase() },
    })

    if (existingAdmin) {
      throw ApiError.conflict('Admin with this email already exists')
    }

    const hashedPassword = await hashPassword(data.password)

    const admin = await prisma.admin.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: Role.SUPER_ADMIN,
        isActive: true,
      },
    })

    await this.logActivity({
      adminId: admin.id,
      action: 'BOOTSTRAP_SUPER_ADMIN',
      entity: 'Admin',
      entityId: admin.id,
      meta: { email: admin.email },
    })

    return this.issueAdminSession(admin)
  }

  static async login(data: AdminLoginInput) {
    const admin = await prisma.admin.findUnique({
      where: { email: data.email.toLowerCase() },
    })

    if (!admin) {
      throw ApiError.unauthorized('Invalid email or password')
    }

    const isPasswordValid = await comparePassword(data.password, admin.password)

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password')
    }

    if (!admin.isActive) {
      throw ApiError.forbidden('Your admin account has been deactivated')
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
      },
    })

    await this.logActivity({
      adminId: admin.id,
      action: 'LOGIN',
      entity: 'Auth',
      entityId: admin.id,
    })

    await runOptionalRedisOperation(
      () => redisClient.setEx(
        `admin:session:${admin.id}`,
        60 * 60 * 24,
        JSON.stringify({ id: admin.id, email: admin.email, role: admin.role })
      ),
      'Redis admin session cache'
    )

    return this.issueAdminSession(admin)
  }

  static async refreshAccessToken(data: AdminRefreshTokenInput) {
    if (!data.refreshToken) {
      throw ApiError.unauthorized('Refresh token is required')
    }

    try {
      verifyRefreshToken(data.refreshToken)
    } catch {
      throw ApiError.unauthorized('Invalid refresh token')
    }

    const tokenRecord = await prisma.adminRefreshToken.findUnique({
      where: { token: data.refreshToken },
      include: { admin: true },
    })

    if (!tokenRecord) {
      throw ApiError.unauthorized('Refresh token not found')
    }

    if (tokenRecord.expiresAt < new Date()) {
      await prisma.adminRefreshToken.delete({ where: { id: tokenRecord.id } })
      throw ApiError.unauthorized('Refresh token expired')
    }

    if (!tokenRecord.admin.isActive) {
      throw ApiError.forbidden('Admin account is not active')
    }

    const accessToken = generateAccessToken({
      id: tokenRecord.admin.id,
      email: tokenRecord.admin.email,
      role: tokenRecord.admin.role,
      type: 'admin',
    })

    return { accessToken }
  }

  static async logout(adminId: string, refreshToken?: string) {
    if (refreshToken) {
      await prisma.adminRefreshToken.deleteMany({
        where: { adminId, token: refreshToken },
      })
    } else {
      await prisma.adminRefreshToken.deleteMany({
        where: { adminId },
      })
    }

    await this.logActivity({
      adminId,
      action: 'LOGOUT',
      entity: 'Auth',
      entityId: adminId,
    })

    await runOptionalRedisOperation(
      () => redisClient.del(`admin:session:${adminId}`),
      'Redis admin session delete'
    )

    return { message: 'Logged out successfully' }
  }

  static async getCurrentAdmin(adminId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        loginCount: true,
        createdAt: true,
      },
    })

    if (!admin) {
      throw ApiError.notFound('Admin not found')
    }

    return {
      ...admin,
      isSuperAdmin: admin.role === Role.SUPER_ADMIN,
    }
  }

  static async createAdmin(data: CreateAdminInput, createdBy: string) {
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: data.email.toLowerCase() },
    })

    if (existingAdmin) {
      throw ApiError.conflict('Admin with this email already exists')
    }

    const hashedPassword = await hashPassword(data.password)

    const admin = await prisma.admin.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || Role.ADMIN,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    await this.logActivity({
      adminId: createdBy,
      action: 'CREATE_ADMIN',
      entity: 'Admin',
      entityId: admin.id,
      meta: { email: admin.email, role: admin.role },
    })

    return admin
  }

  private static async issueAdminSession(admin: {
    id: string
    email: string
    role: Role
    firstName: string
    lastName: string
    isActive: boolean
  }) {
    const accessToken = generateAccessToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    })

    const refreshToken = generateRefreshToken({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    })

    await prisma.adminRefreshToken.create({
      data: {
        token: refreshToken,
        adminId: admin.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    return {
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
        isActive: admin.isActive,
        isSuperAdmin: admin.role === Role.SUPER_ADMIN,
      },
      accessToken,
      refreshToken,
    }
  }

  static async logActivity(data: {
    adminId: string
    action: string
    entity: string
    entityId: string
    meta?: any
  }) {
    try {
      await prisma.auditLog.create({
        data: {
          adminId: data.adminId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          meta: data.meta,
        },
      })
    } catch (error) {
      console.error('Failed to log admin activity:', error)
    }
  }
}