'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function AddProfileRedirectPage() {
  const router = useRouter()
  const { initialized, isAuthenticated, fetchCurrentUser } = useAuth()

  useEffect(() => {
    if (!initialized) void fetchCurrentUser()
  }, [initialized, fetchCurrentUser])

  useEffect(() => {
    if (!initialized) return

    if (isAuthenticated) {
      router.replace('/dashboard?tab=add-profile')
    } else {
      router.replace('/login?redirect=/add-profile')
    }
  }, [initialized, isAuthenticated, router])

  return (
    <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <p>Opening profile setup...</p>
    </main>
  )
}