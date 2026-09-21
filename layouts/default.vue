<script setup lang="ts">
import FooterBar from '~/components/layout/FooterBar.vue'
import Navigation from '~/components/Navigation.vue'


const logger = useLoggerScreen()

onMounted(() => {
  logger.value = true

  setTimeout(() => {
    logger.value = false
  }, 1400)
})
</script>

<template>
  <div class="min-h-screen h-screen flex flex-col">
    <Transition name="loader-fade">
      <LoadingScreen v-if="logger" />
    </Transition>

    <div v-show="!logger" class="h-full flex flex-col p-0 m-0">
      <header class="shrink-0 overflow-hidden basis-fit">
        <Navigation />
      </header>

      <main class="basis-[75%] p-0 m-0">
        <slot />
      </main>

     <div class="bg-slate-900 p-0 m-0">
      <footer class="invisible mt-5 w-full shrink-0 overflow-hidden pl-5 pr-5 pt-5">
        <FooterBar />
      </footer>
      </div>

      <footer class="basis-[15%] mt-5 w-full shrink-0 overflow-hidden fixed bottom-0 pl-5 pr-5 pt-5 z-50">
        <FooterBar />
      </footer>
    </div>
  </div>
</template>
