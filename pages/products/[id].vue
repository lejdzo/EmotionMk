<template>
  <main class="h-full place-content-center bg-gradient-to-b from-slate-900 via-[var(--color-logoblue)] to-slate-900">
    <!-- Loading -->
    <div v-if="pending" class="section-card">
      <p class="text-white/70">{{ t.loading }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="errorMsg" class="section-card">
      <p class="text-red-400">{{ errorMsg }}</p>
    </div>

    <!-- Product -->
    <div v-else-if="product" class="pt-5">
      <div class="rounded-2xl">
        <div class="flex w-full align-center gap-15 md:flex-row flex-col justify-center">
          <!-- LEFT: Carousel -->
          <div class="col-span-1">
            <UCarousel
              v-if="productImages.length"
              v-slot="{ item }"
              :items="productImages"
              dots
              class="md:w-[40em] md:h-[40em] h-full w-full md:ml-5 p-5 md:p-0"
            >
              <img
                :src="item"
                :alt="pick(product.displayName, product.id)"
                class="w-full h-full md:h-[40em] md:w-[40em] object-cover rounded-xl"
              />
            </UCarousel>

            <div
              v-else
              class="w-full h-[280px] md:h-[420px] rounded-xl bg-white/5 grid place-items-center text-white/60"
            >
              No image
            </div>
          </div>

          <!-- RIGHT: Info -->
          <div class="space-y-4 p-5">
            <div>
              <h1 class="font-poppins font-extrabold text-2xl md:text-4xl text-white leading-tight">
                {{ pick(product.displayName, product.id) }}
              </h1>

              <p class="mt-3 text-white/80 text-base leading-relaxed">
                {{ pick(product.shortDescription, '') }}
              </p>
            </div>

            <!-- Specs Card -->
            <UCard class="rounded-2xl">
              <template #header>
                <h2 class="font-poppins font-bold text-white text-lg">
                  {{ t.specs }}
                </h2>
              </template>

              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="bg-black/20 rounded-xl p-3">
                  <p class="text-white/60">{{ t.motor }}</p>
                  <p class="font-semibold text-white">
                    {{ product.specs?.motorW ? `${product.specs.motorW}W` : '-' }}
                  </p>
                </div>

                <div class="bg-black/20 rounded-xl p-3">
                  <p class="text-white/60">{{ t.battery }}</p>
                  <p class="font-semibold text-white">
                    {{ product.specs?.batteryV ? `${product.specs.batteryV}V` : '-' }}
                  </p>
                </div>

                <div class="bg-black/20 rounded-xl p-3">
                  <p class="text-white/60">{{ t.tires }}</p>
                  <p class="font-semibold text-white">
                    {{ product.specs?.tireInch ? `${product.specs.tireInch}"` : '-' }}
                  </p>
                </div>

                <div class="bg-black/20 rounded-xl p-3">
                  <p class="text-white/60">{{ t.mirrors }}</p>
                  <p class="font-semibold text-white">
                    {{ product.specs?.mirrors ? t.yes : t.no }}
                  </p>
                </div>
              </div>
            </UCard>

            <!-- Price Card -->
            <UCard class="rounded-2xl">
              <div class="flex flex-wrap items-center gap-3">
                <span class="font-poppins font-extrabold text-3xl text-[var(--color-logoblue)]">
                  {{ finalPrice(product) }}€
                </span>

                <span
                  v-if="promoPercent(product.id)"
                  class="text-white/60 line-through"
                >
                  {{ product.pricing?.regularPrice }}€
                </span>

                <span
                  v-if="promoPercent(product.id)"
                  class="px-2 py-1 rounded-full text-xs bg-[var(--color-logoblue)]/20 border border-[var(--color-logoblue)]/30 text-white"
                >
                  -{{ promoPercent(product.id) }}%
                </span>
              </div>
            </UCard>

            <!-- Actions -->
            <div class="flex flex-wrap gap-3 pt-1">
              <NuxtLink
                to="/booking"
                class="px-5 py-3 rounded-xl bg-[var(--color-logoblue)] text-white font-poppins font-bold hover:opacity-90 transition"
              >
                {{ t.bookRide }}
              </NuxtLink>

              <NuxtLink
                to="/contact"
                class="px-5 py-3 rounded-xl border border-white/20 bg-white/5 text-white font-poppins font-bold hover:bg-white/10 transition"
              >
                {{ t.contactUs }}
              </NuxtLink>
            </div>
          </div>
        </div>
    </div>
    </div>

    <!-- Not found -->
    <div v-else class="section-card">
      <p class="text-white/70">{{ t.notFound }}</p>
    </div>
  </main>
</template>

<script setup lang="ts">
type Lang = 'mk' | 'en' | 'sq'
type Multi = string | Record<string, string> | null | undefined

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const lang = useState<Lang>('lang', () => 'mk')

const productId = computed(() => String(route.params.id || ''))

/**
 * APIs (adjust these if your route names differ)
 * - GET /api/products/:id
 * - GET /api/promotions   (array: [{ id, percent, appliedTo }])
 */
const { data: productRes, pending, error } = await useFetch(
  () => `/api/products/${productId.value}`,
  { key: () => `product-${productId.value}` }
)

const { data: promotionsRes } = await useFetch('/api/promotions', {
  key: 'promotions-all',
  default: () => []
})

const product = computed<any | null>(() => {
  // supports either direct object OR { ok, data }
  if (!productRes.value) return null
  if ((productRes.value as any).data) return (productRes.value as any).data
  return productRes.value as any
})

const promotions = computed<any[]>(() => {
  if (!promotionsRes.value) return []
  if (Array.isArray(promotionsRes.value)) return promotionsRes.value as any[]
  if (Array.isArray((promotionsRes.value as any).data)) return (promotionsRes.value as any).data
  return []
})

const errorMsg = computed(() => {
  if (!error.value) return ''
  return 'Failed to load product.'
})

const pick = (value: Multi, fallback = ''): string => {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return (
    value[lang.value] ??
    value.mk ??
    value.en ??
    value.sq ??
    Object.values(value)[0] ??
    fallback
  )
}

const promoPercent = (id: string): number => {
  const promo = promotions.value.find((p) => {
    const applied = p?.appliedTo
    if (Array.isArray(applied)) return applied.includes(id)
    return applied === id
  })
  return Number(promo?.percent || 0)
}

const finalPrice = (p: any): number => {
  const regular = Number(p?.pricing?.regularPrice || 0)
  const percent = promoPercent(p?.id)
  if (!regular || !percent) return regular
  return Math.round(regular * (1 - percent / 100))
}

const productImages = computed<string[]>(() => {
  const cover = product.value?.images?.cover
  const gallery = Array.isArray(product.value?.images?.gallery) ? product.value.images.gallery : []
  const merged = [cover, ...gallery].filter(Boolean)

  // remove duplicates
  return [...new Set(merged)]
})

const labels = {
  mk: {
    loading: 'Се вчитува...',
    notFound: 'Производот не е пронајден.',
    specs: 'Спецификации',
    motor: 'Мотор',
    battery: 'Батерија',
    tires: 'Гуми',
    mirrors: 'Ретровизори',
    yes: 'Да',
    no: 'Не',
    bookRide: 'Закажи тест возење',
    contactUs: 'Контакт'
  },
  en: {
    loading: 'Loading...',
    notFound: 'Product not found.',
    specs: 'Specifications',
    motor: 'Motor',
    battery: 'Battery',
    tires: 'Tires',
    mirrors: 'Mirrors',
    yes: 'Yes',
    no: 'No',
    bookRide: 'Book a test ride',
    contactUs: 'Contact us'
  },
  sq: {
    loading: 'Duke u ngarkuar...',
    notFound: 'Produkti nuk u gjet.',
    specs: 'Specifikimet',
    motor: 'Motori',
    battery: 'Bateria',
    tires: 'Gomat',
    mirrors: 'Pasqyrat',
    yes: 'Po',
    no: 'Jo',
    bookRide: 'Rezervo test-vozitje',
    contactUs: 'Kontakt'
  }
} as const

const t = computed(() => labels[lang.value])

useSeoMeta({
  title: () => product.value ? `${pick(product.value.displayName, product.value.id)} | E-MOTION` : 'Product | E-MOTION',
  description: () => product.value ? pick(product.value.shortDescription, 'E-MOTION product') : 'E-MOTION product'
})
</script>