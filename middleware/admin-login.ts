export default defineNuxtRouteMiddleware(async () => {
  try {
    const res = await $fetch('/api/auth/me', {
      credentials: 'include'
    }) as any

    if (res?.authenticated) {
      return navigateTo('/admin')
    }
  } catch {
    // stay on login
  }
})
