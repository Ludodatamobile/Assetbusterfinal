'use client'

import { useAuthStore } from '@/store/auth.store'

export const useAuth = () => {
  const store = useAuthStore()

  return {
    user: store.user,
    accessToken: store.accessToken,
    loading: store.loading,
    initialized: store.initialized,
    isAuthenticated: store.isAuthenticated,

    login: store.login,
    register: store.register,
    verifyEmail: store.verifyEmail,
    resendVerificationEmail: store.resendVerificationEmail,
    refreshAccessToken: store.refreshAccessToken,
    fetchCurrentUser: store.fetchCurrentUser,
    logout: store.logout,
  }
}
