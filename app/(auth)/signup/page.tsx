'use client'
// Signup Page — DISABLED: Signup is currently disabled. Redirect to login.
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/login')
  }, [router])
  return null
}
