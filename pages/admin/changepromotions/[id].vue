<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

type Lang = 'mk' | 'en'
type Multi = string | Record<string, string> | null | undefined

const lang = useState<Lang>('lang', () => 'mk')

const route = useRoute()
const promoId = computed(() => String(route.params.id || ''))

const texts = {
  mk: {
    title: 'Ажурирај промоција',
    back: 'Назад',
    loadingPromo: 'Се вчитува промоцијата...',
    failedLoad: 'Неуспешно вчитување на промоцијата.',
    unknownError: 'Непозната грешка',
    retry: 'Обиди се повторно',
    editing: 'Уредување:',
    promoIdLabel: 'ID на промоција',
    discountLabel: 'Попуст (%)',
    activeLabel: 'Активна',
    activeText: 'Промоцијата е активна',
    inactiveText: 'Промоцијата е неактивна',
    appliedToLabel: 'Додели на производи',
    updateBtn: 'Ажурирај промоција',
    deleteBtn: 'Избриши промоција',
    cancelBtn: 'Откажи',
    requiredId: 'ID на промоција е задолжително.',
    percentRange: 'Процентот мора да биде помеѓу 0 и 100.',
    updatedOk: 'Промоцијата е успешно ажурирана.',
    failedUpdate: 'Неуспешно ажурирање на промоцијата.',
    deleteConfirm: 'Дали да се избрише промоцијата',
    failedDelete: 'Неуспешно бришење на промоцијата.',
    loadingProducts: 'Се вчитуваат производите...'
  },
  en: {
    title: 'Update Promotion',
    back: 'Back',
    loadingPromo: 'Loading promotion...',
    failedLoad: 'Failed to load promotion.',
    unknownError: 'Unknown error',
    retry: 'Retry',
    editing: 'Editing:',
    promoIdLabel: 'Promotion ID',
    discountLabel: 'Discount (%)',
    activeLabel: 'Active',
    activeText: 'Promotion is active',
    inactiveText: 'Promotion is inactive',
    appliedToLabel: 'Apply to products',
    updateBtn: 'Update Promotion',
    deleteBtn: 'Delete Promotion',
    cancelBtn: 'Cancel',
    requiredId: 'Promotion ID is required.',
    percentRange: 'Percent must be between 0 and 100.',
    updatedOk: 'Promotion updated successfully.',
    failedUpdate: 'Failed to update promotion.',
    deleteConfirm: 'Delete promotion',
    failedDelete: 'Failed to delete promotion.',
    loadingProducts: 'Loading products...'
  }
} as const

const t = computed(() => texts[lang.value] ?? texts.mk)

const pick = (value: Multi, fallback = ''): string => {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return value[lang.value] ?? value.mk ?? value.en ?? Object.values(value)[0] ?? fallback
}

const loading = ref(false)
const deleteLoading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const form = reactive({
  id: '',
  percent: 0,
  active: true,
  appliedTo: [] as string[]
})

type PromoResponse = {
  ok: boolean
  data: {
    id: string
    percent: number
    active: boolean
    appliedTo: string[]
    createdAt?: string
    updatedAt?: string
  }
}

const { data, pending, error, refresh } = await useFetch<PromoResponse>(
  `/api/admin/promotions/${encodeURIComponent(promoId.value)}`,
  { key: `promo-${promoId.value}` }
)

watchEffect(() => {
  const promo = data.value?.data
  if (!promo) return

  form.id = promo.id || ''
  form.percent = Number(promo.percent ?? 0)
  form.active = Boolean(promo.active)
  form.appliedTo = Array.isArray(promo.appliedTo) ? [...promo.appliedTo] : []
})

const { data: productsRes, pending: productsPending } = await useFetch('/api/products', {
  key: 'admin-products-for-promotions'
})

const products = computed<any[]>(() => ((productsRes.value as any)?.data || []) as any[])

const isSelected = (pid: string) => form.appliedTo.includes(pid)

const toggleProduct = (pid: string) => {
  const i = form.appliedTo.indexOf(pid)
  if (i >= 0) form.appliedTo.splice(i, 1)
  else form.appliedTo.push(pid)
}

const updatePromotion = async () => {
  errorMsg.value = ''
  successMsg.value = ''

  if (!form.id.trim()) {
    errorMsg.value = t.value.requiredId
    return
  }

  if (form.percent < 0 || form.percent > 100) {
    errorMsg.value = t.value.percentRange
    return
  }

  loading.value = true

  try {
    await $fetch(`/api/admin/promotions/${encodeURIComponent(promoId.value)}`, {
      method: 'PATCH',
      body: {
        id: form.id.trim(),
        percent: Number(form.percent),
        active: form.active,
        appliedTo: [...new Set(form.appliedTo)]
      }
    })

    successMsg.value = t.value.updatedOk

    if (form.id.trim() !== promoId.value) {
      await navigateTo(`/admin/changepromotions/${encodeURIComponent(form.id.trim())}`)
      return
    }

    await refresh()
  } catch (e: any) {
    errorMsg.value = e?.data?.statusMessage || t.value.failedUpdate
  } finally {
    loading.value = false
  }
}

const deletePromotion = async () => {
  errorMsg.value = ''
  successMsg.value = ''

  if (!confirm(`${t.value.deleteConfirm} "${promoId.value}"?`)) return

  deleteLoading.value = true
  try {
    await $fetch(`/api/admin/promotions/${encodeURIComponent(promoId.value)}`, {
      method: 'DELETE'
    })

    await navigateTo('/admin')
  } catch (e: any) {
    errorMsg.value = e?.data?.statusMessage || t.value.failedDelete
  } finally {
    deleteLoading.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-gradient-to-b from-slate-900 via-[var(--color-logoblue)] to-slate-900 p-5">
    <div class="max-w-4xl mx-auto space-y-5">
      <div class="flex items-center justify-between">
        <h1 class="font-poppins font-extrabold text-2xl md:text-3xl text-white">
          {{ t.title }}
        </h1>

        <NuxtLink to="/admin">
          <UButton variant="outline">← {{ t.back }}</UButton>
        </NuxtLink>
      </div>

      <UCard v-if="pending">
        <p class="text-white/80">{{ t.loadingPromo }}</p>
      </UCard>

      <UCard v-else-if="error">
        <p class="text-red-400 font-semibold">{{ t.failedLoad }}</p>
        <p class="text-white/70 text-sm mt-2">
          {{ (error as any)?.data?.statusMessage || t.unknownError }}
        </p>
        <UButton class="mt-3 bg-[var(--color-logoblue)]" @click="refresh()">
          {{ t.retry }}
        </UButton>
      </UCard>

      <UCard v-else>
        <template #header>
          <p class="font-poppins font-bold text-white text-lg">
            {{ t.editing }} {{ promoId }}
          </p>
        </template>

        <UForm :state="form" @submit="updatePromotion" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField :label="t.promoIdLabel" name="id">
              <UInput
                v-model="form.id"
                placeholder="promo-main"
                size="xl"
                class="text-base"
              />
            </UFormField>

            <UFormField :label="t.discountLabel" name="percent">
              <UInput
                v-model.number="form.percent"
                type="number"
                min="0"
                max="100"
                size="xl"
                class="text-base"
              />
            </UFormField>

            <UFormField :label="t.activeLabel" name="active" class="md:col-span-2">
              <div class="flex items-center gap-3 py-2">
                <USwitch v-model="form.active" />
                <span class="text-white/80">
                  {{ form.active ? t.activeText : t.inactiveText }}
                </span>
              </div>
            </UFormField>
          </div>

<div class="space-y-2">
            <p class="font-poppins font-bold text-white">{{ t.appliedToLabel }}</p>

            <div v-if="productsPending" class="text-white/70 text-sm">
              {{ t.loadingProducts }}
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                v-for="p in products"
                :key="p.id"
                type="button"
                @click="toggleProduct(p.id)"
                class="text-left rounded-2xl border p-3 transition select-none"
                :class="isSelected(p.id)
                  ? 'border-[var(--color-logoblue)] bg-[var(--color-logoblue)]/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-poppins font-bold text-white truncate">
                      {{ pick(p.displayName, p.id) }}
                    </p>
                    <p class="text-white/60 text-sm truncate">{{ p.id }}</p>
                  </div>

                  <span
                    class="shrink-0 w-6 h-6 rounded-lg grid place-items-center border"
                    :class="isSelected(p.id)
                      ? 'border-[var(--color-logoblue)] text-[var(--color-logoblue)]'
                      : 'border-white/20 text-white/40'"
                  >
                    <UIcon v-if="isSelected(p.id)" name="i-lucide-check" />
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div v-if="errorMsg" class="text-red-400 text-sm">
            {{ errorMsg }}
          </div>

          <div v-if="successMsg" class="text-emerald-400 text-sm">
            {{ successMsg }}
          </div>

          <div class="flex flex-wrap gap-3 pt-2">
            <UButton
              type="submit"
              :loading="loading"
              class="bg-[var(--color-logoblue)]"
            >
              {{ t.updateBtn }}
            </UButton>

            <UButton
              type="button"
              color="error"
              variant="solid"
              :loading="deleteLoading"
              @click="deletePromotion"
            >
              {{ t.deleteBtn }}
            </UButton>

            <NuxtLink to="/admin">
              <UButton type="button" variant="outline">
                {{ t.cancelBtn }}
              </UButton>
            </NuxtLink>
          </div>
        </UForm>
      </UCard>
    </div>
  </main>
</template>
