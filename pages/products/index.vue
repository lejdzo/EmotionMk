<template>
  <main class="bg-gradient-to-b text-white from-slate-900 via-[var(--color-logoblue)] to-slate-900">
    <div class="md:h-96 h-64">
          <UPageHero
          class="font-poppins font-semibold text-white"
    :title="t.title"
    :description="t.subtitle"
  />


      
    </div>

    <div v-if="pending" class="section-card">
      <p class="text-white/70">{{ t.loading }}</p>
    </div>

    <div v-else-if="errorMsg" class="section-card">
      <p class="text-red-400">{{ errorMsg }}</p>
    </div>

    <div v-else class="grid grid-cols-1 mx-10 mt-3 gap-10">
      <NuxtLink
        v-for="product in products"
        :key="product.id"
        :to="`/products/${product.id}`"
        class="product-menu-card group block"
      >
        <UCard
          class="w-full"
          :ui="{
            root: 'bg-white/5 border border-white/10 ring-0 rounded-2xl transition-all duration-200',
            body: 'p-4'
          }"
        >
          <div class="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 items-center">
            <!-- Image -->
            <div class="overflow-hidden rounded-xl p-1  bg-gradient-to-r from-slate-900/50 via-[var(--color-logoblue)]/0 to-slate-900/10">
              <img
                :src="product.images?.cover || product.images?.gallery?.[0] || '/logo2.svg'"
                :alt="pick(product.displayName, product.id)"
                class="w-full h-72 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <!-- Content -->
            <div>
              <h2 class="font-poppins font-extrabold text-2xl">
                {{ pick(product.displayName, product.id) }}
              </h2>

              <p class="mt-2 text-white/80">
                {{ pick(product.shortDescription, '') }}
              </p>

              <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div class="bg-black/20 rounded-lg p-2">
                  <span class="text-white/60">Motor:</span>
                  <span class="font-semibold ml-1">{{ product.specs?.motorW || '-' }}W</span>
                </div>

                <div class="bg-black/20 rounded-lg p-2">
                  <span class="text-white/60">Battery:</span>
                  <span class="font-semibold ml-1">{{ product.specs?.batteryV || '-' }}V</span>
                </div>

                <div class="bg-black/20 rounded-lg p-2">
                  <span class="text-white/60">Tires:</span>
                  <span class="font-semibold ml-1">{{ product.specs?.tireInch || '-' }}"</span>
                </div>

                <div class="bg-black/20 rounded-lg p-2">
                  <span class="text-white/60">Mirrors:</span>
                  <span class="font-semibold ml-1">{{ product.specs?.mirrors ? 'Yes' : 'No' }}</span>
                </div>
              </div>

              <div class="mt-4 flex flex-wrap items-center gap-3">
                <span class="text-2xl font-poppins font-extrabold text-red">
                  {{ finalPrice(product) }}€
                </span>

                <span
                  v-if="promoPercent(product.id)"
                  class="text-sm text-white/60 line-through"
                >
                  {{ product.pricing?.regularPrice }}€
                </span>

                <span
                  v-if="promoPercent(product.id)"
                  class="px-2 py-1 rounded-full text-xs bg-slate-900/80 border border-[var(--color-logoblue)]/30"
                >
                  -{{ promoPercent(product.id) }}%
                </span>

                <span class="ml-auto text-sm text-white/70 group-hover:text-white/0 transition-colors">
                  {{ t.open }} →
                </span>
              </div>
            </div>
          </div>
        </UCard>
      </NuxtLink>

      <UCard v-if="!products.length" class="w-full" :ui="{ root: 'bg-white/5 border border-white/10', body: 'p-4' }">
        <p class="text-white/70">{{ t.empty }}</p>
      </UCard>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

type Lang = 'mk' | 'en' | 'sq'

const lang = useState<Lang>('lang', () => 'mk')

const {
  data: productsRes,
  pending: productsPending,
  error: productsError
} = await useFetch('/api/products', {
  key: 'products-list'
})

const {
  data: promosRes,
  pending: promosPending,
  error: promosError
} = await useFetch('/api/promotions', {
  key: 'promotions-list'
})

const products = computed<any[]>(() => (productsRes.value as any)?.data || [])
const promotions = computed<any[]>(() => (promosRes.value as any)?.data || [])

const pending = computed(() => productsPending.value || promosPending.value)

const errorMsg = computed(() => {
  const e1 = (productsError.value as any)?.data?.statusMessage || (productsError.value as any)?.message
  const e2 = (promosError.value as any)?.data?.statusMessage || (promosError.value as any)?.message
  return e1 || e2 || ''
})

const pick = (value: any, fallback = ''): string => {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return value[lang.value] ?? value.mk ?? value.en ?? value.sq ?? Object.values(value)[0] ?? fallback
}

const promoPercent = (productId: string) => {
  const promo = promotions.value.find(
    (p: any) => Array.isArray(p.appliedTo) && p.appliedTo.includes(productId)
  )
  return Number(promo?.percent || 0)
}

const finalPrice = (product: any) => {
  const regular = Number(product?.pricing?.regularPrice || 0)
  const percent = promoPercent(product.id)
  const discounted = regular * (1 - percent / 100)
  return Math.round(discounted)
}

const texts = {
  mk: {
    title: 'Производи',
    subtitle: 'Изберете модел за повеќе детали и закажување тест возење.',
    loading: 'Се вчитуваат производите...',
    empty: 'Нема достапни производи.',
    open: 'Отвори'
  },
  en: {
    title: 'Products',
    subtitle: 'Choose a model for more details and test ride booking.',
    loading: 'Loading products...',
    empty: 'No products available.',
    open: 'Open'
  },
  sq: {
    title: 'Produktet',
    subtitle: 'Zgjidhni modelin për më shumë detaje dhe rezervim test drive.',
    loading: 'Duke ngarkuar produktet...',
    empty: 'Nuk ka produkte.',
    open: 'Hap'
  }
} as const

const t = computed(() => texts[lang.value])

//ARROWS MENU

const selectedIndex = ref(0)

watch(products, (list) => {
  if (!list?.length) {
    selectedIndex.value = 0
    return
  }
  if (selectedIndex.value > list.length - 1) {
    selectedIndex.value = list.length - 1
  }
}, { immediate: true })

const goToSelected = async () => {
  const product = products.value[selectedIndex.value]
  if (!product?.id) return
  await navigateTo(`/products/${product.id}`)
}

const onProductsKeydown = async (e: KeyboardEvent) => {
  if (!products.value.length) return

  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    e.preventDefault()
    selectedIndex.value = (selectedIndex.value + 1) % products.value.length
    return
  }

  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault()
    selectedIndex.value =
      (selectedIndex.value - 1 + products.value.length) % products.value.length
    return
  }

  if (e.key === 'Enter') {
    e.preventDefault()
    await goToSelected()
  }
}

</script>
