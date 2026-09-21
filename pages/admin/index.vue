<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

type Lang = 'mk' | 'en'
type Multi = string | Record<string, string> | null | undefined

type HomeItem = {
  _id: string
  img: string
  header: Multi
  description: Multi
}

type GalleryItem = {
  _id: string
  src: string
  category: string
  sortOrder: number
  active: boolean
}

const lang = useState<Lang>('lang', () => 'mk')
const route = useRoute()

const languageOptions = [
  {
    key: 'mk' as Lang,
    short: 'MK',
    flagClass: 'fi fi-mk',
    label: { mk: 'Македонски', en: 'Macedonian' }
  },
  {
    key: 'en' as Lang,
    short: 'EN',
    flagClass: 'fi fi-gb',
    label: { mk: 'Англиски', en: 'English' }
  }
]

const ui = {
  mk: {
    adminPage: 'Админ страница',
    logout: 'Одјава',
    productsHero: 'ПРОИЗВОДИ',
    loadingProducts: 'Се вчитуваат производите...',
    failedProducts: 'Неуспешно вчитување на производите.',
    retry: 'Обиди се повторно',
    addProduct: 'Додади производ',
    promotionsHero: 'ПРОМОЦИИ',
    loadingPromotions: 'Се вчитуваат промоциите...',
    failedPromotions: 'Неуспешно вчитување на промоциите.',
    noPromotions: 'Нема пронајдени промоции.',
    discount: 'Попуст',
    appliedToProducts: 'Применето на производи',
    noProductsAssigned: 'Нема доделени производи.',
    created: 'Креирано',
    updated: 'Ажурирано',
    active: 'АКТИВНО',
    inactive: 'НЕАКТИВНО',
    addPromotion: 'Додади промоција',
    homeHero: 'ПОЧЕТНА СТРАНА',
    loadingHome: 'Се вчитуваат елементите за почетната страница...',
    failedHome: 'Неуспешно вчитување на елементите за почетната страница.',
    addHomeItem: 'Додади Home елемент',
    galleryHero: 'ГАЛЕРИЈА',
    loadingGallery: 'Се вчитуваат елементите од галеријата...',
    failedGallery: 'Неуспешно вчитување на елементите од галеријата.',
    noGallery: 'Нема пронајдени елементи во галеријата.',
    sortOrder: 'Редослед',
    gallery: 'галерија',
    addGalleryPhoto: 'Додади фотографија'
  },
  en: {
    adminPage: 'Admin Page',
    logout: 'Logout',
    productsHero: 'PRODUCTS',
    loadingProducts: 'Loading products...',
    failedProducts: 'Failed to load products.',
    retry: 'Retry',
    addProduct: 'Add Product',
    promotionsHero: 'PROMOTIONS',
    loadingPromotions: 'Loading promotions...',
    failedPromotions: 'Failed to load promotions.',
    noPromotions: 'No promotions found.',
    discount: 'Discount',
    appliedToProducts: 'Applied to products',
    noProductsAssigned: 'No products assigned.',
    created: 'Created',
    updated: 'Updated',
    active: 'ACTIVE',
    inactive: 'INACTIVE',
    addPromotion: 'Add Promotion',
    homeHero: 'HOME PAGE',
    loadingHome: 'Loading homepage items...',
    failedHome: 'Failed to load homepage items.',
    addHomeItem: 'Add Home Item',
    galleryHero: 'GALLERY',
    loadingGallery: 'Loading gallery items...',
    failedGallery: 'Failed to load gallery items.',
    noGallery: 'No gallery items found.',
    sortOrder: 'Sort order',
    gallery: 'gallery',
    addGalleryPhoto: 'Add Gallery Photo'
  }
} as const

const t = computed(() => ui[lang.value])

const pick = (value: Multi, fallback = ''): string => {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return value[lang.value] ?? value.mk ?? value.en ?? Object.values(value)[0] ?? fallback
}

const setLang = (value: Lang) => {
  lang.value = value
}

const sectionBgClass = (_index: number) => {
  return 'bg-gradient-to-b from-slate-900 via-[var(--color-logoblue)] to-slate-900'
}

/**
 * AUTH CHECK
 * Redirect immediately if user is not logged in.
 */
const { data: authRes, error: authError } = await useFetch('/api/auth/me', {
  key: 'admin-auth-me',
  credentials: 'include',
  server: true
})

const isAuthenticated = computed(() => {
  return Boolean((authRes.value as any)?.user || (authRes.value as any)?.ok)
})

if (authError.value || !isAuthenticated.value) {
  await navigateTo(`/admin/login?redirect=${encodeURIComponent(route.fullPath)}`, {
    replace: true
  })
}

/**
 * PRODUCTS
 */
const {
  data: productsRes,
  pending: productsPending,
  error: productsError,
  refresh: refreshProducts
} = await useFetch('/api/products', {
  key: 'products-list'
})

/**
 * PROMOTIONS
 */
const {
  data: promosRes,
  pending: promosPending,
  error: promosError,
  refresh: refreshPromotions
} = await useFetch('/api/promotions', {
  key: 'promotions-list'
})

const products = computed<any[]>(() => {
  return ((productsRes.value as any)?.data || []) as any[]
})

const promotions = computed<any[]>(() => {
  return ((promosRes.value as any)?.data || []) as any[]
})

const handleLogout = async () => {
  try {
    await $fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
  } catch {
    // ignore
  }

  await navigateTo('/admin/login', { replace: true })
}

/**
 * HOME
 */
const {
  data: homeRes,
  pending: homePending,
  error: homeError,
  refresh: refreshHome
} = await useFetch('/api/admin/home', {
  key: 'admin-home-list',
  credentials: 'include'
})

const homeItems = computed<HomeItem[]>(() => {
  return ((homeRes.value as any)?.items || []) as HomeItem[]
})

/**
 * GALLERY
 */
const {
  data: galleryRes,
  pending: galleryPending,
  error: galleryError,
  refresh: refreshGallery
} = await useFetch('/api/admin/gallery', {
  key: 'admin-gallery-list',
  credentials: 'include'
})

const galleryItems = computed<GalleryItem[]>(() => {
  return ((galleryRes.value as any)?.items || []) as GalleryItem[]
})

watch([homeError, galleryError], async ([homeErr, galleryErr]) => {
  const homeStatus = (homeErr as any)?.statusCode || (homeErr as any)?.status
  const galleryStatus = (galleryErr as any)?.statusCode || (galleryErr as any)?.status

  if (homeStatus === 401 || galleryStatus === 401) {
    await navigateTo(`/admin/login?redirect=${encodeURIComponent(route.fullPath)}`, {
      replace: true
    })
  }
})
</script>

<template>
  <div class="min-h-screen text-white">
    <div class="flex justify-between items-center w-full p-5 bg-gradient-to-b from-slate-900 via-[var(--color-logoblue)] to-slate-900">
      <div>
        <p class="font-poppins font-bold text-2xl text-white">{{ t.adminPage }}</p>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex gap-1 bg-white/10 rounded-xl">
          <button
            v-for="lng in languageOptions"
            :key="lng.key"
            @click="setLang(lng.key)"
            class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/10 transition"
            :title="pick(lng.label, lng.short)"
            :aria-label="pick(lng.label, lng.short)"
            type="button"
          >
            <span :class="lng.flagClass"></span>
          </button>
        </div>

        <UButton @click="handleLogout" class="bg-[var(--color-logoblue)]">
          {{ t.logout }}
        </UButton>
      </div>
    </div>

    <!-- PRODUCTS -->
    <div :class="sectionBgClass(0)">
      <UPageHero :title="t.productsHero" class="sm:h-[15em] h-[10em]" />

      <div class="p-5">
        <div v-if="productsPending" class="text-white/80 font-poppins">
          {{ t.loadingProducts }}
        </div>

        <div v-else-if="productsError" class="text-red-400 font-poppins space-y-3">
          <p>{{ t.failedProducts }}</p>
          <UButton @click="refreshProducts()" class="bg-[var(--color-logoblue)]">
            {{ t.retry }}
          </UButton>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NuxtLink
            v-for="product in products"
            :key="product.id"
            :to="`/admin/changeproduct/${product.id}`"
            class="block group"
          >
            <UCard class="overflow-hidden h-full transition hover:-translate-y-1">
              <template #header>
                <img
                  :src="product.images?.cover || product.images?.gallery?.[0] || '/logo2.svg'"
                  :alt="pick(product.displayName, product.id)"
                  class="w-full h-40 object-cover rounded-lg"
                />
              </template>

              <div class="space-y-2">
                <p class="font-poppins font-bold text-lg text-white">
                  {{ pick(product.displayName, product.id) }}
                </p>

                <p class="font-poppins text-[var(--color-logoblue)] font-extrabold text-xl">
                  {{ product.pricing?.regularPrice ?? '-' }}€
                </p>
              </div>
            </UCard>
          </NuxtLink>

          <NuxtLink to="/admin/addproduct/new" class="block group">
            <UCard
              class="h-full min-h-[260px] flex items-center justify-center border-dashed border-white/20 hover:border-[var(--color-logoblue)]/60 transition"
            >
              <div class="w-full h-full min-h-[220px] grid place-items-center">
                <div class="text-center">
                  <div
                    class="mx-auto w-16 h-16 rounded-2xl grid place-items-center text-4xl font-bold text-[var(--color-logoblue)] bg-[var(--color-logoblue)]/10 border border-[var(--color-logoblue)]/30 group-hover:scale-110 transition"
                  >
                    +
                  </div>
                  <p class="mt-3 font-poppins font-bold text-white text-lg">{{ t.addProduct }}</p>
                </div>
              </div>
            </UCard>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- PROMOTIONS -->
    <div :class="sectionBgClass(1)">
      <UPageHero :title="t.promotionsHero" class="sm:h-[15em] h-[10em]" />

      <div class="p-5">
        <div v-if="promosPending" class="text-white/80 font-poppins">
          {{ t.loadingPromotions }}
        </div>

        <div v-else-if="promosError" class="text-red-400 font-poppins space-y-3">
          <p>{{ t.failedPromotions }}</p>
          <UButton @click="refreshPromotions()" class="bg-[var(--color-logoblue)]">
            {{ t.retry }}
          </UButton>
        </div>

        <div v-else-if="!promotions.length" class="text-white/70 font-poppins">
          {{ t.noPromotions }}
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NuxtLink
            v-for="promo in promotions"
            :key="promo.id"
            :to="`/admin/changepromotions/${promo.id}`"
            class="block group"
          >
            <UCard class="h-full transition hover:-translate-y-1">
              <template #header>
                <div class="flex items-center justify-between gap-3">
                  <p class="font-poppins font-bold text-white text-lg truncate">
                    {{ promo.id }}
                  </p>

                  <span
                    class="px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap"
                    :class="promo.active
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-red-500/20 text-red-300 border border-red-400/30'"
                  >
                    {{ promo.active ? t.active : t.inactive }}
                  </span>
                </div>
              </template>

              <div class="space-y-4">
                <div>
                  <p class="text-white/60 text-sm font-poppins">{{ t.discount }}</p>
                  <p class="font-poppins text-[var(--color-logoblue)] font-extrabold text-2xl">
                    {{ promo.percent ?? 0 }}%
                  </p>
                </div>

                <div>
                  <p class="text-white/60 text-sm font-poppins mb-2">{{ t.appliedToProducts }}</p>

                  <div v-if="promo.appliedTo?.length" class="flex flex-wrap gap-2">
                    <span
                      v-for="pid in promo.appliedTo"
                      :key="pid"
                      class="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                    >
                      {{ pid }}
                    </span>
                  </div>

                  <p v-else class="text-white/50 text-sm">
                    {{ t.noProductsAssigned }}
                  </p>
                </div>

                <div class="text-xs text-white/40 space-y-1 pt-2 border-t border-white/10">
                  <p v-if="promo.createdAt">
                    {{ t.created }}: {{ new Date(promo.createdAt).toLocaleString() }}
                  </p>
                  <p v-if="promo.updatedAt">
                    {{ t.updated }}: {{ new Date(promo.updatedAt).toLocaleString() }}
                  </p>
                </div>
              </div>
            </UCard>
          </NuxtLink>

          <NuxtLink to="/admin/addpromotions" class="block group">
            <UCard
              class="h-full min-h-[260px] flex items-center justify-center border-dashed border-white/20 hover:border-[var(--color-logoblue)]/60 transition"
            >
              <div class="w-full h-full min-h-[220px] grid place-items-center">
                <div class="text-center">
                  <div
                    class="mx-auto w-16 h-16 rounded-2xl grid place-items-center text-4xl font-bold text-[var(--color-logoblue)] bg-[var(--color-logoblue)]/10 border border-[var(--color-logoblue)]/30 group-hover:scale-110 transition"
                  >
                    +
                  </div>
                  <p class="mt-3 font-poppins font-bold text-white text-lg">{{ t.addPromotion }}</p>
                </div>
              </div>
            </UCard>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- HOME -->
    <div :class="sectionBgClass(2)">
      <UPageHero :title="t.homeHero" class="sm:h-[15em] h-[10em]" />

      <div class="p-5">
        <div v-if="homePending" class="text-white/80 font-poppins">
          {{ t.loadingHome }}
        </div>

        <div v-else-if="homeError" class="text-red-400 font-poppins space-y-3">
          <p>{{ t.failedHome }}</p>
          <UButton @click="refreshHome()" class="bg-[var(--color-logoblue)]">
            {{ t.retry }}
          </UButton>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NuxtLink
            v-for="item in homeItems"
            :key="item._id"
            :to="`/admin/changehome/${item._id}`"
            class="block group"
          >
            <UCard class="overflow-hidden h-full transition hover:-translate-y-1">
              <template #header>
                <img
                  :src="item.img || '/logo2.svg'"
                  :alt="pick(item.header)"
                  class="w-full h-40 object-cover rounded-lg"
                />
              </template>

              <div class="space-y-2">
                <p class="font-poppins font-bold text-lg text-white">
                  {{ pick(item.header) }}
                </p>

                <p class="font-poppins text-white/70 line-clamp-3">
                  {{ pick(item.description) }}
                </p>
              </div>
            </UCard>
          </NuxtLink>

          <NuxtLink to="/admin/addhome/new" class="block group">
            <UCard
              class="h-full min-h-[260px] flex items-center justify-center border-dashed border-white/20 hover:border-[var(--color-logoblue)]/60 transition"
            >
              <div class="w-full h-full min-h-[220px] grid place-items-center">
                <div class="text-center">
                  <div
                    class="mx-auto w-16 h-16 rounded-2xl grid place-items-center text-4xl font-bold text-[var(--color-logoblue)] bg-[var(--color-logoblue)]/10 border border-[var(--color-logoblue)]/30 group-hover:scale-110 transition"
                  >
                    +
                  </div>
                  <p class="mt-3 font-poppins font-bold text-white text-lg">
                    {{ t.addHomeItem }}
                  </p>
                </div>
              </div>
            </UCard>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- GALLERY -->
    <div :class="sectionBgClass(3)">
      <UPageHero :title="t.galleryHero" class="sm:h-[15em] h-[10em]" />

      <div class="p-5">
        <div v-if="galleryPending" class="text-white/80 font-poppins">
          {{ t.loadingGallery }}
        </div>

        <div v-else-if="galleryError" class="text-red-400 font-poppins space-y-3">
          <p>{{ t.failedGallery }}</p>
          <UButton @click="refreshGallery()" class="bg-[var(--color-logoblue)]">
            {{ t.retry }}
          </UButton>
        </div>

        <div v-else-if="!galleryItems.length" class="text-white/70 font-poppins">
          {{ t.noGallery }}
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <NuxtLink
            v-for="item in galleryItems"
            :key="item._id"
            :to="`/admin/changegallery/${item._id}`"
            class="block group"
          >
            <UCard class="overflow-hidden h-full transition hover:-translate-y-1">
              <template #header>
                <img
                  :src="item.src || '/logo2.svg'"
                  :alt="item.category"
                  class="w-full h-44 object-cover rounded-lg"
                />
              </template>

              <div class="space-y-3">
                <div class="flex items-center justify-between gap-2">
                  <p class="font-poppins font-bold text-white text-base uppercase truncate">
                    {{ item.category || t.gallery }}
                  </p>

                  <span
                    class="px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap"
                    :class="item.active
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-red-500/20 text-red-300 border border-red-400/30'"
                  >
                    {{ item.active ? t.active : t.inactive }}
                  </span>
                </div>

                <div class="space-y-1 text-sm">
                  <p class="text-white/60">
                    {{ t.sortOrder }}:
                    <span class="text-white font-semibold">{{ item.sortOrder ?? 0 }}</span>
                  </p>

                  <p class="text-white/50 truncate">
                    {{ item.src }}
                  </p>
                </div>
              </div>
            </UCard>
          </NuxtLink>

          <NuxtLink to="/admin/addgallery/new" class="block group">
            <UCard
              class="h-full min-h-[280px] flex items-center justify-center border-dashed border-white/20 hover:border-[var(--color-logoblue)]/60 transition"
            >
              <div class="w-full h-full min-h-[240px] grid place-items-center">
                <div class="text-center">
                  <div
                    class="mx-auto w-16 h-16 rounded-2xl grid place-items-center text-4xl font-bold text-[var(--color-logoblue)] bg-[var(--color-logoblue)]/10 border border-[var(--color-logoblue)]/30 group-hover:scale-110 transition"
                  >
                    +
                  </div>
                  <p class="mt-3 font-poppins font-bold text-white text-lg">
                    {{ t.addGalleryPhoto }}
                  </p>
                </div>
              </div>
            </UCard>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
