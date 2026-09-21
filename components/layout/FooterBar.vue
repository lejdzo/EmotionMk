<template>
  <footer>
    <div
      class="border border-white/10 bg-gradient-to-r from-slate-900 via-[var(--color-logoblue)]/25 to-slate-900 rounded-t-2xl backdrop-blur-sm px-4 md:px-6 py-3 shadow-2xl"
    >
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <!-- Top row on mobile / full row on desktop -->
        <div class="flex items-center justify-between gap-3 md:contents">
          <!-- Left -->
          <div class="min-w-0">
            <p class="font-poppins font-bold text-white text-sm md:text-base truncate">
              E-MOTION MK
            </p>
          </div>

          <!-- Center -->
          <a
            href="tel:+38973857811"
            class="group relative flex items-center gap-2 rounded-xl border border-[var(--color-logoblue)]/50 bg-[var(--color-logoblue)]/15 px-3 md:px-4 py-2 text-white shadow-lg hover:bg-[var(--color-logoblue)]/25 hover:border-[var(--color-logoblue)]/80 transition-all duration-300 animate-pulse"
          >
            <div class="leading-tight text-right md:text-left">
              <p class="text-[10px] md:text-xs text-white/70 font-medium uppercase tracking-wide">
                {{ t.callNow }}
              </p>
              <p
                class="font-poppins font-extrabold text-sm md:text-base tracking-wide group-hover:scale-[1.02] transition-transform"
              >
                073 / 857 - 811
              </p>
            </div>

            <span class="text-base md:text-lg animate-bounce">📞</span>
          </a>
        </div>

        <!-- Bottom row on mobile / right side on desktop -->
        <div class="flex items-center justify-center gap-3 md:justify-end md:ml-auto">
          <NuxtLink
            to="/contact"
            class="text-white/70 hover:text-white text-sm font-semibold transition-colors"
          >
            {{ t.contact }}
          </NuxtLink>
          <a
            href="https://www.instagram.com/e_motionmk/"
            target="_blank"
            rel="noopener noreferrer"
            class="text-white/70 hover:text-white transition-colors"
            aria-label="Instagram"
          >
            <Icon name="mdi:instagram" class="w-5 h-5 bg-gradient-to-r from-red-500 via-red-500 to-yellow-500" />
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61580283274567"
            target="_blank"
            rel="noopener noreferrer"
            class="text-white/70 hover:text-white transition-colors"
            aria-label="Facebook"
          >
            <Icon name="mdi:facebook" class="w-5 h-5 bg-[var(--color-logoblue)]" />
          </a>

          <NuxtLink
            to="/admin/login"
            class="px-3 py-2 rounded-lg border border-[var(--color-logoblue)]/40 bg-[var(--color-logoblue)]/10 text-white text-sm font-poppins font-bold hover:bg-[var(--color-logoblue)]/20 hover:border-[var(--color-logoblue)]/70 transition"
          >
            {{ t.adminLogin }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
type Lang = 'mk' | 'en' | 'sq'
const lang = useState<Lang>('lang', () => 'mk')

const labels = {
  mk: {
    rights: 'Сите права се задржани.',
    contact: 'Контакт',
    adminLogin: 'Најава (Админ)',
    callNow: 'Јави се'
  },
  en: {
    rights: 'All rights reserved.',
    contact: 'Contact',
    adminLogin: 'Admin Login',
    callNow: 'Call now'
  },
  sq: {
    rights: 'Të gjitha të drejtat e rezervuara.',
    contact: 'Kontakt',
    adminLogin: 'Hyrje Admin',
    callNow: 'Na thirr'
  }
} as const

const t = computed(() => labels[lang.value])
</script>
