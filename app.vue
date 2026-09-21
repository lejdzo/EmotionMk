<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'E-MOTION MK',
  description: 'Електрични скутери E-MOTION MK во ГТЦ Скопје. Тест возење, повеќе модели и бои. Контакт: 073/857-811'
})

useHead({
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/logo1.svg' }
  ]
})
</script>