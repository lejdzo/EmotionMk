<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

type Lang = 'mk' | 'en'

const lang = useState<Lang>('lang', () => 'mk')

const texts = {
  mk: {
    editProduct: 'Измени производ',
    back: 'Назад',
    loading: 'Се вчитува...',
    failedLoad: 'Неуспешно вчитување на производот.',
    retry: 'Обиди се повторно',
    productId: 'ID на производ',
    price: 'Цена',
    currency: 'Валута',
    displayNameMk: 'Име MK',
    displayNameEn: 'Име EN',
    descriptionMk: 'Опис MK',
    descriptionEn: 'Опис EN',
    motorW: 'Мотор W',
    batteryV: 'Батерија V',
    tireInch: 'Гума Inch',
    lightsFrontRear: 'Предни/задни светла',
    turnSignals: 'Трепкачи',
    mirrors: 'Огледала',
    frontBasketOptional: 'Предна кошница (опционално)',
    coverImage: 'Главна слика',
    uploadCover: 'Прикачи главна слика',
    galleryImages: 'Слики за галерија',
    addGalleryImage: 'Додај слика во галерија',
    uploadGalleryImage: 'Прикачи слика за галерија',
    extraImages: 'Дополнителни слики',
    addExtraImage: 'Додај дополнителна слика',
    uploadExtraImage: 'Прикачи дополнителна слика',
    remove: 'Отстрани',
    update: 'Ажурирај',
    delete: 'Избриши',
    cancel: 'Откажи',
    deleteConfirm: 'Дали да се избрише овој производ?',
    uploadFailed: 'Неуспешно прикачување.',
    updateFailed: 'Неуспешно ажурирање на производот.',
    deleteFailed: 'Неуспешно бришење на производот.'
  },
  en: {
    editProduct: 'Edit Product',
    back: 'Back',
    loading: 'Loading...',
    failedLoad: 'Failed to load product.',
    retry: 'Retry',
    productId: 'Product ID',
    price: 'Price',
    currency: 'Currency',
    displayNameMk: 'Display Name MK',
    displayNameEn: 'Display Name EN',
    descriptionMk: 'Description MK',
    descriptionEn: 'Description EN',
    motorW: 'Motor W',
    batteryV: 'Battery V',
    tireInch: 'Tire Inch',
    lightsFrontRear: 'Lights Front/Rear',
    turnSignals: 'Turn Signals',
    mirrors: 'Mirrors',
    frontBasketOptional: 'Front Basket Optional',
    coverImage: 'Cover Image',
    uploadCover: 'Upload Cover',
    galleryImages: 'Gallery Images',
    addGalleryImage: 'Add Gallery Image',
    uploadGalleryImage: 'Upload Gallery Image',
    extraImages: 'Extra Images',
    addExtraImage: 'Add Extra Image',
    uploadExtraImage: 'Upload Extra Image',
    remove: 'Remove',
    update: 'Update',
    delete: 'Delete',
    cancel: 'Cancel',
    deleteConfirm: 'Delete this product?',
    uploadFailed: 'Upload failed.',
    updateFailed: 'Failed to update product.',
    deleteFailed: 'Failed to delete product.'
  }
} as const

const t = computed(() => texts[lang.value] ?? texts.mk)

const route = useRoute()
const productId = computed(() => String(route.params.id || ''))

const emptyLang = () => ({ mk: '', en: '' })

const form = reactive({
  id: '',
  displayName: emptyLang(),
  shortDescription: emptyLang(),
  specs: {
    motorW: 0,
    batteryV: 0,
    tireInch: 0,
    lightsFrontRear: false,
    turnSignals: false,
    mirrors: false,
    frontBasketOptional: false
  },
  pricing: {
    regularPrice: 0,
    currency: 'EUR'
  },
  images: {
    cover: '',
    gallery: [''],
    extra: ['']
  }
})

const saving = ref(false)
const deleting = ref(false)
const errorMsg = ref('')
const uploading = ref(false)
const uploadError = ref('')

const {
  data,
  pending,
  error,
  refresh
} = await useFetch(() => `/api/admin/products/${productId.value}`, {
  key: `admin-product-${productId.value}`,
  credentials: 'include'
})

watchEffect(() => {
  const item = (data.value as any)?.item
  if (!item) return

  form.id = item.id || ''
  form.displayName = {
    mk: item.displayName?.mk || '',
    en: item.displayName?.en || ''
  }
  form.shortDescription = {
    mk: item.shortDescription?.mk || '',
    en: item.shortDescription?.en || ''
  }
  form.specs = {
    motorW: Number(item.specs?.motorW || 0),
    batteryV: Number(item.specs?.batteryV || 0),
    tireInch: Number(item.specs?.tireInch || 0),
    lightsFrontRear: Boolean(item.specs?.lightsFrontRear),
    turnSignals: Boolean(item.specs?.turnSignals),
    mirrors: Boolean(item.specs?.mirrors),
    frontBasketOptional: Boolean(item.specs?.frontBasketOptional)
  }
  form.pricing = {
    regularPrice: Number(item.pricing?.regularPrice || 0),
    currency: item.pricing?.currency || 'EUR'
  }
  form.images = {
    cover: item.images?.cover || '',
    gallery: item.images?.gallery?.length ? [...item.images.gallery] : [''],
    extra: item.images?.extra?.length ? [...item.images.extra] : ['']
  }
})

const uploadImage = async (slot: 'cover' | 'gallery' | 'extra', index?: number, file?: File) => {
  if (!file) return
  uploadError.value = ''

  const body = new FormData()
  body.append('image', file)

  uploading.value = true
  try {
    const res = await $fetch('/api/admin/upload-product-image', {
      method: 'POST',
      body,
      credentials: 'include'
    }) as { ok: boolean; path: string }

    if (slot === 'cover') {
      form.images.cover = res.path
    } else if (slot === 'gallery' && typeof index === 'number') {
      form.images.gallery[index] = res.path
    } else if (slot === 'extra' && typeof index === 'number') {
      form.images.extra[index] = res.path
    }
  } catch (err: any) {
    uploadError.value = err?.data?.statusMessage || err?.message || t.value.uploadFailed
  } finally {
    uploading.value = false
  }
}

const onFileChange = async (e: Event, slot: 'cover' | 'gallery' | 'extra', index?: number) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  await uploadImage(slot, index, file)
}

const addGalleryRow = () => form.images.gallery.push('')
const removeGalleryRow = (i: number) => form.images.gallery.splice(i, 1)
const addExtraRow = () => form.images.extra.push('')
const removeExtraRow = (i: number) => form.images.extra.splice(i, 1)

const updateItem = async () => {
  errorMsg.value = ''
  saving.value = true

  try {
    const res = await $fetch(`/api/admin/products/${productId.value}`, {
      method: 'PATCH',
      credentials: 'include',
      body: {
        ...form,
        images: {
          cover: form.images.cover,
          gallery: form.images.gallery.filter(Boolean),
          extra: form.images.extra.filter(Boolean)
        }
      }
    }) as any

    await navigateTo(`/admin/changeproduct/${res.id}`)
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.message || t.value.updateFailed
  } finally {
    saving.value = false
  }
}

const deleteItem = async () => {
  const ok = window.confirm(t.value.deleteConfirm)
  if (!ok) return

  errorMsg.value = ''
  deleting.value = true

  try {
    await $fetch(`/api/admin/products/${productId.value}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    await navigateTo('/admin')
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || err?.message || t.value.deleteFailed
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <main class="p-5 bg-gradient-to-b from-slate-900 via-[var(--color-logoblue)] to-slate-900 min-h-screen">
    <div class="flex items-center justify-between mb-4">
      <h1 class="font-poppins font-bold text-2xl text-white">{{ t.editProduct }}</h1>
      <NuxtLink to="/admin" class="text-white/70 hover:text-white">← {{ t.back }}</NuxtLink>
    </div>

    <div v-if="pending" class="text-white/80">{{ t.loading }}</div>

    <div v-else-if="error" class="text-red-400 space-y-3">
      <p>{{ t.failedLoad }}</p>
      <UButton @click="refresh()" class="bg-[var(--color-logoblue)]">{{ t.retry }}</UButton>
    </div>

    <UCard v-else>
      <UForm :state="form" @submit="updateItem" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField :label="t.productId">
            <UInput v-model="form.id" />
          </UFormField>

          <UFormField :label="t.price">
            <UInput v-model.number="form.pricing.regularPrice" type="number" />
          </UFormField>
        </div>

        <UFormField :label="t.currency">
          <UInput v-model="form.pricing.currency" />
        </UFormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField :label="t.displayNameMk">
            <UInput v-model="form.displayName.mk" />
          </UFormField>
          <UFormField :label="t.displayNameEn">
            <UInput v-model="form.displayName.en" />
          </UFormField>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField :label="t.descriptionMk">
            <UTextarea v-model="form.shortDescription.mk" :rows="4" />
          </UFormField>
          <UFormField :label="t.descriptionEn">
            <UTextarea v-model="form.shortDescription.en" :rows="4" />
          </UFormField>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <UFormField :label="t.motorW">
            <UInput v-model.number="form.specs.motorW" type="number" />
          </UFormField>
          <UFormField :label="t.batteryV">
            <UInput v-model.number="form.specs.batteryV" type="number" />
          </UFormField>
          <UFormField :label="t.tireInch">
            <UInput v-model.number="form.specs.tireInch" type="number" />
          </UFormField>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <UCheckbox v-model="form.specs.lightsFrontRear" :label="t.lightsFrontRear" />
          <UCheckbox v-model="form.specs.turnSignals" :label="t.turnSignals" />
          <UCheckbox v-model="form.specs.mirrors" :label="t.mirrors" />
          <UCheckbox v-model="form.specs.frontBasketOptional" :label="t.frontBasketOptional" />
        </div>

        <div class="space-y-3">
          <p class="text-white font-semibold">{{ t.coverImage }}</p>
          <label class="inline-block cursor-pointer">
            <span class="px-4 py-2 rounded-lg bg-[var(--color-logoblue)] text-white font-semibold">
              {{ t.uploadCover }}
            </span>
            <input type="file" accept="image/*" class="hidden" @change="(e) => onFileChange(e, 'cover')" />
          </label>
          <UInput v-model="form.images.cover" />
          <img v-if="form.images.cover" :src="form.images.cover" class="w-full max-w-md h-48 object-cover rounded-lg border border-white/10" />
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <p class="text-white font-semibold">{{ t.galleryImages }}</p>
            <UButton type="button" @click="addGalleryRow" class="bg-[var(--color-logoblue)]">{{ t.addGalleryImage }}</UButton>
          </div>

          <div v-for="(img, i) in form.images.gallery" :key="`gallery-${i}`" class="space-y-2 border border-white/10 rounded-xl p-3">
            <label class="inline-block cursor-pointer">
              <span class="px-4 py-2 rounded-lg bg-[var(--color-logoblue)] text-white font-semibold">
                {{ t.uploadGalleryImage }}
              </span>
              <input type="file" accept="image/*" class="hidden" @change="(e) => onFileChange(e, 'gallery', i)" />
            </label>
            <UInput v-model="form.images.gallery[i]" />
            <img v-if="form.images.gallery[i]" :src="form.images.gallery[i]" class="w-full max-w-md h-40 object-cover rounded-lg border border-white/10" />
            <UButton v-if="form.images.gallery.length > 1" type="button" color="error" variant="soft" @click="removeGalleryRow(i)">
              {{ t.remove }}
            </UButton>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <p class="text-white font-semibold">{{ t.extraImages }}</p>
            <UButton type="button" @click="addExtraRow" class="bg-[var(--color-logoblue)]">{{ t.addExtraImage }}</UButton>
          </div>

          <div v-for="(img, i) in form.images.extra" :key="`extra-${i}`" class="space-y-2 border border-white/10 rounded-xl p-3">
            <label class="inline-block cursor-pointer">
              <span class="px-4 py-2 rounded-lg bg-[var(--color-logoblue)] text-white font-semibold">
                {{ t.uploadExtraImage }}
              </span>
              <input type="file" accept="image/*" class="hidden" @change="(e) => onFileChange(e, 'extra', i)" />
            </label>
            <UInput v-model="form.images.extra[i]" />
            <img v-if="form.images.extra[i]" :src="form.images.extra[i]" class="w-full max-w-md h-40 object-cover rounded-lg border border-white/10" />
            <UButton v-if="form.images.extra.length > 1" type="button" color="error" variant="soft" @click="removeExtraRow(i)">
              {{ t.remove }}
            </UButton>
          </div>
        </div>

        <p v-if="uploadError" class="text-red-400">{{ uploadError }}</p>
        <p v-if="errorMsg" class="text-red-400">{{ errorMsg }}</p>

        <div class="flex gap-3 flex-wrap">
          <UButton type="submit" :loading="saving" class="bg-[var(--color-logoblue)]">
            {{ t.update }}
          </UButton>

          <UButton color="error" variant="soft" :loading="deleting" @click="deleteItem">
            {{ t.delete }}
          </UButton>

          <UButton color="neutral" variant="outline" @click="navigateTo('/admin')">
            {{ t.cancel }}
          </UButton>
        </div>
      </UForm>
    </UCard>
  </main>
</template>
