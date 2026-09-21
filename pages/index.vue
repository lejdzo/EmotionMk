<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

type Lang = 'mk' | 'en' | 'sq'
type Multi = string | Record<string, string> | null | undefined

type HomeItem = {
  img: string
  header: Multi
  description: Multi
}

const lang = useState<Lang>('lang', () => 'mk')

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

const { data, pending, error } = await useFetch<{ ok: boolean; items: HomeItem[] }>('/api/home')

const items = computed(() => data.value?.items ?? [])
</script>

<template>
  <div class="h-full p-5 bg-gradient-to-b from-slate-900 via-[var(--color-logoblue)] to-slate-900">
    <div v-if="pending" class="text-white">Loading...</div>
    <div v-else-if="error" class="text-red-400">Failed to load items.</div>

    <div
      v-else
      v-for="(item, index) in items"
      :key="index"
      class="rounded-2xl p-5"
      :class="index % 2 === 0
        ? 'bg-gradient-to-l from-slate-900/0 via-slate-900/0 to-[var(--color-logoblue)]'
        : 'bg-gradient-to-r from-slate-900/0 via-slate-900/0 to-slate-900'"
    >
      <div class="grid md:grid-cols-2 grid-cols-1 gap-10 items-center">
        <div :class="index % 2 === 0 ? 'order-1' : 'order-2'">
          <img :src="item.img" class="rounded-lg w-full h-[30em] object-cover" loading="lazy" />
        </div>

        <div class="p-5" :class="index % 2 === 0 ? 'order-2' : 'order-1'">
          <p class="font-poppins text-3xl font-semibold text-center text-white">
            {{ pick(item.header) }}
          </p>
          <hr class="my-4 border-white/20" />
          <p class="font-poppins text-xl p-5 text-white">
            {{ pick(item.description) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
