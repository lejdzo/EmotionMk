<template>
  <nav class="navbar">
    <div class="flex items-center gap-3 border-b-4 rounded">
      <div>
        <div class="animate-bounce">
          <img
            :src="logoSrc"
            @mouseenter="onLogoEnter"
            @mouseleave="onLogoLeave"
            class="logo transition-all ease-in"
            :class="logoNav ? 'opacity-100 scale-110' : 'opacity-95 scale-100'"
            :alt="brand.logoAlt"
          />
        </div>
      </div>

      <div>
        <h1>{{ brand.text }}</h1>
      </div>
    </div>

    <div class="flex items-center gap-3 md:gap-5 relative">
      <!-- Desktop links -->
      <div class="hidden lg:flex items-center gap-5">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.key"
          :to="link.path"
          class="font-poppins font-extrabold text-white text-base xl:text-lg hover:text-[var(--color-logoblue)] transition-colors"
        >
          {{ link.label }}
        </NuxtLink>
      </div>

      <!-- Desktop language switcher -->
      <div class="hidden md:flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-2 py-1">
        <button
          v-for="lng in languageOptions"
          :key="lng.key"
          @click="setLang(lng.key)"
          class="lang-btn"
          :title="pick(lng.label, lng.short || lng.key)"
          :aria-label="pick(lng.label, lng.short || lng.key)"
          type="button"
        >
          <span :class="lng.flagClass"></span>
        </button>
      </div>

      <!-- Mobile dropdown -->
      <UDropdownMenu
        :items="mobileMenuItems"
        :content="{
          align: 'end',
          side: 'bottom',
          sideOffset: 10
        }"
        :ui="{
          content: 'w-[290px] md:w-[340px] rounded-2xl border border-white/10 bg-black/85 backdrop-blur-md p-2 shadow-2xl'
        }"
        class="lg:hidden"
      >
        <button type="button" class="lg:hidden">
          <img
            :src="icons.hamburgerDefault"
            class="hamMenu place-items-center cursor-pointer"
            alt="Menu"
          />
        </button>
      </UDropdownMenu>
    </div>
  </nav>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

type Lang = 'mk' | 'en'
type NavKey = 'home' | 'products' | 'booking' | 'gallery' | 'contact'

const logoNav = ref(false)
const lang = useState<Lang>('lang', () => 'mk')
let logoLeaveTimeout: ReturnType<typeof setTimeout> | null = null

const brand = {
  text: 'E-MOTION',
  logoAlt: 'E-MOTION logo',
  logoDefault: '/logo1.svg',
  logoHover: '/logo1.svg'
}

const icons = {
  hamburgerDefault: '/hamburger-menu-white.svg',
  hamburgerOpen: '/hamburger-menu-blue.svg'
}

const labels = {
  mk: {
    menu: 'Мени',
    language: 'Јазик',
    nav: {
      home: 'Почетна',
      products: 'Производи',
      booking: 'Тест возење',
      gallery: 'Галерија',
      contact: 'Контакт'
    }
  },
  en: {
    menu: 'Menu',
    language: 'Language',
    nav: {
      home: 'Home',
      products: 'Products',
      booking: 'Test ride',
      gallery: 'Gallery',
      contact: 'Contact'
    }
  }
} as const

const baseNavLinks = [
  { key: 'home' as NavKey, path: '/' },
  { key: 'products' as NavKey, path: '/products' },
  { key: 'booking' as NavKey, path: '/booking' },
  { key: 'gallery' as NavKey, path: '/gallery' },
  { key: 'contact' as NavKey, path: '/contact' }
]

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

const pick = (value: any, fallback = ''): string => {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return value[lang.value] ?? value.mk ?? value.en ?? Object.values(value)[0] ?? fallback
}

const uiLabels = computed(() => labels[lang.value])

const navLinks = computed(() =>
  baseNavLinks.map((link) => ({
    ...link,
    label: uiLabels.value.nav[link.key]
  }))
)

const logoSrc = computed(() => (logoNav.value ? brand.logoHover : brand.logoDefault))

const onLogoEnter = () => {
  if (logoLeaveTimeout) {
    clearTimeout(logoLeaveTimeout)
    logoLeaveTimeout = null
  }
  logoNav.value = true
}

const onLogoLeave = () => {
  if (logoLeaveTimeout) clearTimeout(logoLeaveTimeout)

  logoLeaveTimeout = setTimeout(() => {
    logoNav.value = false
    logoLeaveTimeout = null
  }, 1200)
}

onBeforeUnmount(() => {
  if (logoLeaveTimeout) clearTimeout(logoLeaveTimeout)
})

const setLang = (value: Lang) => {
  lang.value = value
}

const mobileMenuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: pick(uiLabels.value.menu, 'Menu'),
      type: 'label'
    }
  ],
  navLinks.value.map((link) => ({
    label: link.label,
    to: link.path,
    icon: 'i-lucide-chevron-right'
  })),
  [
    {
      label: pick(uiLabels.value.language, 'Language'),
      type: 'label'
    },
    ...languageOptions.map((lng) => ({
      label: `${pick(lng.label, lng.short)}${lang.value === lng.key ? ' ✓' : ''}`,
      icon: lang.value === lng.key ? 'i-lucide-check' : undefined,
      onSelect: () => setLang(lng.key)
    }))
  ]
])
</script>
