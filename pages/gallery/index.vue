<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

type GalleryItem = {
  _id: string
  src: string
  category: string
  sortOrder: number
  active: boolean
}

type GalleryResponse = {
  ok: boolean
  count: number
  items: GalleryItem[]
}

const carousel = useTemplateRef('carousel')
const activeIndex = ref(0)
const previewOpen = ref(false)

const { data, pending, error, refresh } = await useFetch<GalleryResponse>('/api/gallery', {
  query: { category: 'showroom' },
  default: () => ({
    ok: true,
    count: 0,
    items: []
  })
})

const items = computed(() => data.value?.items ?? [])
const activeItem = computed(() => items.value[activeIndex.value] || null)

function onClickPrev() {
  if (!items.value.length) return
  activeIndex.value = Math.max(0, activeIndex.value - 1)
}

function onClickNext() {
  if (!items.value.length) return
  activeIndex.value = Math.min(items.value.length - 1, activeIndex.value + 1)
}

function onSelect(index: number) {
  activeIndex.value = index
}

function select(index: number) {
  activeIndex.value = index
  carousel.value?.emblaApi?.scrollTo(index)
}

function openPreview() {
  previewOpen.value = true
}

function closePreview() {
  previewOpen.value = false
}

function previewPrev() {
  if (!items.value.length) return
  const nextIndex = activeIndex.value > 0 ? activeIndex.value - 1 : items.value.length - 1
  activeIndex.value = nextIndex
  carousel.value?.emblaApi?.scrollTo(nextIndex)
}

function previewNext() {
  if (!items.value.length) return
  const nextIndex = activeIndex.value < items.value.length - 1 ? activeIndex.value + 1 : 0
  activeIndex.value = nextIndex
  carousel.value?.emblaApi?.scrollTo(nextIndex)
}

function onImageError(e: Event, src: string) {
  console.error('Failed to load image:', src)
  const img = e.target as HTMLImageElement
  img.style.opacity = '0.25'
}

const handleKeydown = (e: KeyboardEvent) => {
  if (!previewOpen.value) return

  if (e.key === 'Escape') closePreview()
  if (e.key === 'ArrowLeft') previewPrev()
  if (e.key === 'ArrowRight') previewNext()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <main class="h-full place-content-center bg-gradient-to-b from-slate-900 via-[var(--color-logoblue)] to-slate-900">
    <div class="mx-auto">
      <div v-if="pending" class="grid place-items-center py-16">
        <div class="text-white/80 text-lg">Loading gallery...</div>
      </div>

      <UCard v-else-if="error" class="border border-red-400/30">
        <div class="space-y-3">
          <p class="text-red-400 font-semibold">Failed to load gallery images.</p>
          <p class="text-white/70 text-sm">
            Check /api/gallery and verify your MongoDB connection + image paths.
          </p>
          <UButton @click="refresh()" class="bg-[var(--color-logoblue)]">
            Retry
          </UButton>
        </div>
      </UCard>

      <UCard v-else-if="!items.length">
        <div class="space-y-2">
          <p class="text-white font-semibold">No gallery images found.</p>
          <p class="text-white/70 text-sm">
            Make sure documents in <code class="text-white">gallery</code> have
            <span class="text-white">category: "showroom"</span>
            and are active.
          </p>
        </div>
      </UCard>

      <div
        v-else
        class="grid lg:grid-cols-2 grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 h-fit place-items-center justify-center md:p-5"
      >
        <UCarousel
          ref="carousel"
          v-slot="{ item }"
          arrows
          :items="items"
          :prev="{ onClick: onClickPrev }"
          :next="{ onClick: onClickNext }"
          class="h-fit md:mx-10"
          @select="onSelect"
        >
          <div class="flex justify-center">
            <img
              :src="item.src"
              :alt="`Showroom image ${item.sortOrder}`"
              class="object-cover h-[40em] rounded-xl border border-white/10 md:p-5 cursor-zoom-in"
              @click="openPreview"
              @error="(e) => onImageError(e, item.src)"
            >
          </div>
        </UCarousel>

        <UCard class="h-fit">
          <div class="flex flex-wrap justify-center gap-2 gap-3">
            <button
              v-for="(item, index) in items"
              :key="item._id"
              type="button"
              class="relative rounded-lg overflow-hidden border border-white/10 opacity-40 hover:opacity-100 transition-all"
              :class="{
                'opacity-100 ring-2 ring-[var(--color-logoblue)] scale-105': activeIndex === index
              }"
              @click="select(index)"
            >
              <img
                :src="item.src"
                :alt="`Thumbnail ${index + 1}`"
                class="w-[4.5rem] h-[4.5rem] md:w-[5.5rem] md:h-[5.5rem] object-cover"
                @error="(e) => onImageError(e, item.src)"
              >
            </button>
          </div>
        </UCard>
      </div>

      <UModal v-model:open="previewOpen" fullscreen>
        <template #content>
          <div class="relative flex items-center justify-center w-full h-screen bg-black/95">
            <button
              type="button"
              class="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center"
              @click="closePreview"
            >
              ×
            </button>

            <button
              type="button"
              class="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-3xl flex items-center justify-center"
              @click="previewPrev"
            >
              ‹
            </button>

            <img
              v-if="activeItem"
              :src="activeItem.src"
              :alt="`Preview ${activeItem.sortOrder}`"
              class="max-w-[92vw] max-h-[90vh] object-contain rounded-xl"
              @error="(e) => onImageError(e, activeItem!.src)"
            >

            <button
              type="button"
              class="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-3xl flex items-center justify-center"
              @click="previewNext"
            >
              ›
            </button>

            <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-white/10 text-white text-sm">
              {{ activeIndex + 1 }} / {{ items.length }}
            </div>
          </div>
        </template>
      </UModal>
    </div>
  </main>
</template>