<template>
    <div class="">
    <slot />
  </div>
</template>

<script setup lang="ts">
const { adminUser, fetchMe, logout } = useAdminAuth()

onMounted(() => {
  fetchMe()
})

const handleLogout = async () => {
  await logout()
  await navigateTo('/admin/login')
}
</script>