<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

type Lang = 'mk' | 'en'
const lang = useState<Lang>('lang', () => 'mk')

const texts = {
  mk: {
    title: 'Измени слика од галерија',
    back: 'Назад',
    loading: 'Се вчитува...',
    failedLoad: 'Неуспешно вчитување на ставката од галерија.',
    retry: 'Обиди се повторно',
    image: 'Слика',
    dragDrop: 'Повлечи и пушти слика за галерија тука',
    chooseDevice: 'Или избери од телефон/компјутер',
    replaceImage: 'Замени слика',
    uploading: 'Се прикачува...',
    imagePath: 'Патека до слика',
    category: 'Категорија',
    sortOrder: 'Редослед',
    active: 'Активна',
    preview: 'Преглед',
    noImage: 'Нема избрана слика',
    update: 'Ажурирај',
    delete: 'Избриши',
    cancel: 'Откажи',
    uploadImageOnly: 'Избери слика.',
    uploadFailed: 'Неуспешно прикачување.',
    updateFailed: 'Неуспешно ажурирање на ставката.',
    deleteFailed: 'Неуспешно бришење на ставката.',
    deleteConfirm: 'Дали да се избрише оваа ставка од галерија?'
  },
  en: {
    title: 'Edit Gallery Photo',
    back: 'Back',
    loading: 'Loading...',
    failedLoad: 'Failed to load gallery item.',
    retry: 'Retry',
    image: 'Image',
    dragDrop: 'Drag and drop gallery image here',
    chooseDevice: 'Or choose from your phone/computer',
    replaceImage: 'Replace Image',
    uploading: 'Uploading...',
    imagePath: 'Image path',
    category: 'Category',
    sortOrder: 'Sort Order',
    active: 'Active',
    preview: 'Preview',
    noImage: 'No image selected',
    update: 'Update',
    delete: 'Delete',
    cancel: 'Cancel',
    uploadImageOnly: 'Please select an image file.',
    uploadFailed: 'Upload failed.',
    updateFailed: 'Failed to update gallery item.',
    deleteFailed: 'Failed to delete gallery item.',
    deleteConfirm: 'Delete this gallery item?'
  }
} as const

const t = computed(() => texts[lang.value] ?? texts.mk)

const route = useRoute()
const id = computed(() => String(route.params.id || ''))

const form = reactive({
  src: '',
  category: '',
  sortOrder: 0,
  active: true
})

const saving = ref(false)
const deleting = ref(false)
const errorMsg = ref('')

const uploading = ref(false)
const uploadError = ref('')
const dragActive = ref(false)
const localPreview = ref('')

const {
  data,
  pending,
  error,
  refresh
} = await useFetch(() => `/api/admin/gallery/${id.value}`, {
  key: `admin-gallery-${id.value}`,
  credentials: 'include'
})

watchEffect(() => {
  const item = (data.value as any)?.item
  if (!item) return

  form.src = item.src || ''
  form.category = item.category || ''
  form.sortOrder = Number(item.sortOrder || 0)
  form.active = Boolean(item.active)
})

const uploadImage = async (file: File) => {
  uploadError.value = ''

  if (!file.type.startsWith('image/')) {
    uploadError.value = t.value.uploadImageOnly
    return
  }

  localPreview.value = URL.createObjectURL(file)

  const body = new FormData()
  body.append('image', file)

  uploading.value = true

  try {
    const res = await $fetch('/api/admin/upload-gallery-image', {
      method: 'POST',
      body,
      credentials: 'include'
    }) as { ok: boolean; path: string }

    form.src = res.path
  } catch (err: any) {
    uploadError.value =
      err?.data?.statusMessage ||
      err?.message ||
      t.value.uploadFailed
  } finally {
    uploading.value = false
  }
}

const onFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  await uploadImage(file)
}

const onDrop = async (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()

  dragActive.value = false
  const file = event.dataTransfer?.files?.[0]
  if (!file) return

  await uploadImage(file)
}

onMounted(() => {
  const preventWindowDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  window.addEventListener('dragenter', preventWindowDrop)
  window.addEventListener('dragover', preventWindowDrop)
  window.addEventListener('drop', preventWindowDrop)

  onBeforeUnmount(() => {
    window.removeEventListener('dragenter', preventWindowDrop)
    window.removeEventListener('dragover', preventWindowDrop)
    window.removeEventListener('drop', preventWindowDrop)
  })
})

const updateItem = async () => {
  errorMsg.value = ''
  saving.value = true

  try {
    await $fetch(`/api/admin/gallery/${id.value}`, {
      method: 'PATCH',
      credentials: 'include',
      body: {
        src: form.src,
        category: form.category,
        sortOrder: form.sortOrder,
        active: form.active
      }
    })

    await navigateTo('/admin')
  } catch (err: any) {
    errorMsg.value =
      err?.data?.statusMessage ||
      err?.message ||
      t.value.updateFailed
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
    await $fetch(`/api/admin/gallery/${id.value}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    await navigateTo('/admin')
  } catch (err: any) {
    errorMsg.value =
      err?.data?.statusMessage ||
      err?.message ||
      t.value.deleteFailed
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <main class="p-5 bg-gradient-to-b from-slate-900 via-[var(--color-logoblue)] to-slate-900 min-h-screen">
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-poppins font-bold text-2xl text-white">{{ t.title }}</h1>
      <NuxtLink to="/admin" class="text-white/70 hover:text-white">← {{ t.back }}</NuxtLink>
    </div>

    <div v-if="pending" class="text-white/80">{{ t.loading }}</div>

    <div v-else-if="error" class="text-red-400 space-y-3">
      <p>{{ t.failedLoad }}</p>
      <UButton @click="refresh()" class="bg-[var(--color-logoblue)]">
        {{ t.retry }}
      </UButton>
    </div>

    <UCard v-else class="max-w-5xl mx-auto">
      <UForm :state="form" @submit="updateItem" class="space-y-6">
        <div class="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
          <div class="space-y-5">
            <div class="space-y-3">
              <p class="text-white font-semibold text-lg">{{ t.image }}</p>

              <div
                class="border-2 border-dashed rounded-2xl p-8 text-center transition min-h-[260px] grid place-items-center"
                :class="dragActive
                  ? 'border-[var(--color-logoblue)] bg-[var(--color-logoblue)]/10'
                  : 'border-white/20 bg-white/5'"
                @dragenter.prevent.stop="dragActive = true"
                @dragover.prevent.stop="dragActive = true"
                @dragleave.prevent.stop="dragActive = false"
                @drop.prevent.stop="onDrop"
              >
                <div>
                  <p class="text-white font-medium text-lg">
                    {{ t.dragDrop }}
                  </p>

                  <p class="text-white/60 text-sm mt-2">
                    {{ t.chooseDevice }}
                  </p>

                  <label class="inline-block mt-5 cursor-pointer">
                    <span class="px-5 py-3 rounded-xl bg-[var(--color-logoblue)] text-white font-semibold">
                      {{ t.replaceImage }}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="onFileChange"
                    >
                  </label>

                  <p v-if="uploading" class="text-white/70 mt-4">{{ t.uploading }}</p>
                  <p v-if="uploadError" class="text-red-400 mt-4">{{ uploadError }}</p>
                </div>
              </div>

              <UFormField :label="t.imagePath">
                <UInput v-model="form.src" placeholder="/uploads/gallery/filename.jpg" size="xl" />
              </UFormField>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField :label="t.category">
                <UInput v-model="form.category" size="xl" />
              </UFormField>

              <UFormField :label="t.sortOrder">
                <UInput v-model.number="form.sortOrder" type="number" size="xl" />
              </UFormField>
            </div>

            <div class="pt-1">
              <UCheckbox v-model="form.active" :label="t.active" />
            </div>
          </div>

          <div class="space-y-3">
            <p class="text-white font-semibold text-lg">{{ t.preview }}</p>

            <div class="rounded-2xl border border-white/10 bg-white/5 p-3">
              <img
                v-if="localPreview || form.src"
                :src="localPreview || form.src"
                alt="preview"
                class="w-full h-[340px] object-cover rounded-xl"
              >
              <div
                v-else
                class="w-full h-[340px] rounded-xl border border-dashed border-white/15 grid place-items-center text-white/40"
              >
                {{ t.noImage }}
              </div>
            </div>

            <div class="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
              <p class="font-poppins font-bold text-white text-lg uppercase">
                {{ form.category || 'gallery' }}
              </p>
              <p class="text-white/70 text-sm">{{ t.sortOrder }}: {{ form.sortOrder }}</p>
              <span
                class="inline-block px-2 py-1 rounded-md text-xs font-bold"
                :class="form.active
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-red-500/20 text-red-300 border border-red-400/30'"
              >
                {{ form.active ? 'ACTIVE' : 'INACTIVE' }}
              </span>
            </div>
          </div>
        </div>

        <p v-if="errorMsg" class="text-red-400">{{ errorMsg }}</p>

        <div class="flex gap-3 pt-2 flex-wrap">
          <UButton type="submit" :loading="saving" class="bg-[var(--color-logoblue)] px-5">
            {{ t.update }}
          </UButton>

          <UButton
            color="error"
            variant="soft"
            :loading="deleting"
            @click="deleteItem"
          >
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
