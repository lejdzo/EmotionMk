export const useAdminAuth = () => {
  const adminUser = useState<any | null>('adminUser', () => null)
  const loading = useState<boolean>('adminAuthLoading', () => false)

  const fetchMe = async () => {
    loading.value = true
    try {
      const res = await $fetch('/api/auth/me')
      adminUser.value = (res as any)?.data?.user || null
      return res
    } finally {
      loading.value = false
    }
  }

  const login = async (login: string, password: string) => {
    loading.value = true
    try {
      const res = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { login, password }
      })
      adminUser.value = (res as any)?.data?.user || null
      return res
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    adminUser.value = null
  }

  return { adminUser, loading, fetchMe, login, logout }
}