import { apiRequest } from '@/lib/api'

import type {
  AuthResponse,
  CurrentUserResponse,
  LoginPayload,
  RefreshTokenResponse,
  RegisterPayload,
  RegisterResponse,
} from '@/types/auth'

export class AuthService {
  static register(payload: RegisterPayload) {
    return apiRequest<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: payload,
    })
  }

  static login(payload: LoginPayload) {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: payload,
    })
  }

  static verifyEmail(token: string) {
    return apiRequest<AuthResponse>('/auth/verify-email', {
      method: 'POST',
      body: { token },
    })
  }

  static resendVerificationEmail(email: string) {
    return apiRequest<{ success: boolean; message: string; data: null }>(
      '/auth/resend-verification',
      {
        method: 'POST',
        body: { email },
      }
    )
  }

  static getCurrentUser(accessToken: string) {
    return apiRequest<CurrentUserResponse>('/auth/me', {
      method: 'GET',
      token: accessToken,
    })
  }

  static refreshToken() {
    return apiRequest<RefreshTokenResponse>('/auth/refresh-token', {
      method: 'POST',
    })
  }

  static logout(accessToken?: string | null) {
    return apiRequest<{ success: boolean; message: string; data: null }>(
      '/auth/logout',
      {
        method: 'POST',
        token: accessToken,
      }
    )
  }
}
