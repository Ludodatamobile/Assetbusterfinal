import { prisma } from '../../config/prisma.js'
import { ApiError } from '../../utils/ApiError.js'
import {
  getPaginationParams,
  createPaginationResult,
} from '../../utils/pagination.js'
import { AdminAuthService } from '../auth/adminAuth.service.js'
import type { Role } from '@prisma/client'

export class AdminUsersService {

  static async getAllUsers(query: {
    page?:     string
    limit?:    string
    role?:     string
    search?:   string
    status?:   string
    isActive?: string
  }) {
    const { skip, page, limit } = getPaginationParams({
      page:  Number(query.page),
      limit: Number(query.limit),
    })

    const where: any = {}

    if (query.role)   where.role = query.role as Role
    // Support both ?status=ACTIVE and legacy ?isActive=true
    if (query.status) {
      where.status = query.status
    } else if (query.isActive) {
      where.status = query.isActive === 'true' ? 'ACTIVE' : 'SUSPENDED'
    }

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName:  { contains: query.search, mode: 'insensitive' } },
        { email:     { contains: query.search, mode: 'insensitive' } },
        { country:   { contains: query.search, mode: 'insensitive' } },
      ]
    }

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id:              true,
          firstName:       true,
          lastName:        true,
          email:           true,
          role:            true,
          phone:           true,
          country:         true,
          status:          true,
          isEmailVerified: true,
          profileScore:    true,
          lastLoginAt:     true,
          memberSince:     true,
          createdAt:       true,
          _count: {
            select: {
              dealsAsInitiator: true,
              dealsAsReceiver:  true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return createPaginationResult(users, total, page, limit)
  }

  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        businessProfiles: true,
        investorProfiles: true,
        advisorProfiles:  true,
        _count: {
          select: {
            dealsAsInitiator: true,
            dealsAsReceiver:  true,
            notifications:    true,
            documents:        true,
          },
        },
      },
    })
    if (!user) throw ApiError.notFound('User not found')

    const { password, emailVerificationToken, passwordResetToken, ...safe } = user as any
    return safe
  }

  static async suspendUser(userId: string, adminId: string, reason?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw ApiError.notFound('User not found')

    await prisma.user.update({
      where: { id: userId },
      data:  { status: 'SUSPENDED' },
    })

    await AdminAuthService.logActivity({
      adminId,
      action:   'SUSPEND_USER',
      entity:   'User',
      entityId: userId,
      meta:     { reason, email: user.email },
    })
  }

  static async reactivateUser(userId: string, adminId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw ApiError.notFound('User not found')

    await prisma.user.update({
      where: { id: userId },
      data:  { status: 'ACTIVE' },
    })

    await AdminAuthService.logActivity({
      adminId,
      action:   'REACTIVATE_USER',
      entity:   'User',
      entityId: userId,
      meta:     { email: user.email },
    })
  }

  static async verifyUser(userId: string, adminId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw ApiError.notFound('User not found')

    await prisma.user.update({
      where: { id: userId },
      data:  { isEmailVerified: true, verified: true, verificationStatus: 'VERIFIED' },
    })

    await AdminAuthService.logActivity({
      adminId,
      action:   'VERIFY_USER',
      entity:   'User',
      entityId: userId,
      meta:     { email: user.email },
    })
  }

  static async deleteUser(userId: string, adminId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw ApiError.notFound('User not found')

    await prisma.user.delete({ where: { id: userId } })

    await AdminAuthService.logActivity({
      adminId,
      action:   'DELETE_USER',
      entity:   'User',
      entityId: userId,
      meta:     { email: user.email },
    })
  }

  static async getUserStats() {
    const [total, active, pending, suspended, verified, byRole] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { status: 'SUSPENDED' } }),
      prisma.user.count({ where: { isEmailVerified: true } }),
      prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
    ])

    return {
      total,
      active,
      pending,
      suspended,
      verified,
      byRole: byRole.reduce((acc: any, r) => {
        acc[r.role] = r._count.id
        return acc
      }, {}),
    }
  }
}