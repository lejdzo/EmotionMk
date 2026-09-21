<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

type Lang = 'mk' | 'en'
const lang = useState<Lang>('lang', () => 'mk')

const texts = {
  mk: {
    title: 'Додај слика во галерија',
    back: 'Назад',
    image: 'Слика',
    dragDrop: 'Повлечи и пушти слика за галерија тука',
    chooseDevice: 'Или избери од телефон/компјутер',
    selectImage: 'Избери слика',
    uploading: 'Се прикачува...',
    imagePath: 'Патека до слика',
    category: 'Категорија',
    sortOrder: 'Редослед',
    active: 'Активна',
    preview: 'Преглед',
    noImage: 'Нема избрана слика',
    create: 'Креирај',
    cancel: 'Откажи',
    uploadImageOnly: 'Избери слика.',
    uploadFailed: 'Неуспешно прикачување.',
    createFailed: 'Неуспешно креирање на ставката.'
  },
  en: {
    title: 'Add Gallery Photo',
    back: 'Back',
    image: 'Image',
    dragDrop: 'Drag and drop gallery image here',
    chooseDevice: 'Or choose from your phone/computer',
    selectImage: 'Select Image',
    uploading: 'Uploading...',
    imagePath: 'Image path',
    category: 'Category',
    sortOrder: 'Sort Order',
    active: 'Active',
    preview: 'Preview',
    noImage: 'No image selected',
    create: 'Create',
    cancel: 'Cancel',
    uploadImageOnly: 'Please select an image file.',
    uploadFailed: 'Upload failed.',
    createFailed: 'Failed to create gallery item.'
  }
} as const

const t = computed(() => texts[lang.value] ?? texts.mk)

const form = reactive({ src: '', category: 'showroom', sortOrder: 1, active: true }) 
const saving = ref(false) 
const errorMsg = ref('') 
const uploading = ref(false) 
const uploadError = ref('') 
const dragActive = ref(false) 
const localPreview = ref('')

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

const submit = async () => {
  errorMsg.value = ''
  saving.value = true

  try {
    const res = await $fetch('/api/admin/gallery/create', {
      method: 'POST',
      credentials: 'include',
      body: {
        src: form.src,
        category: form.category,
        sortOrder: form.sortOrder,
        active: form.active
      }
    }) as any

    await navigateTo(`/admin/changegallery/${res.insertedId}`)
  } catch (err: any) {
    errorMsg.value =
      err?.data?.statusMessage ||
      err?.message ||
      t.value.createFailed
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <main class="p-5 bg-gradient-to-b from-slate-900 via-[var(--color-logoblue)] to-slate-900 min-h-screen">
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-poppins font-bold text-2xl text-white">{{ t.title }}</h1>
      <NuxtLink to="/admin" class="text-white/70 hover:text-white">← {{ t.back }}</NuxtLink>
    </div>

    <UCard class="max-w-5xl mx-auto">
      <UForm :state="form" @submit="submit" class="space-y-6">
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
                      {{ t.selectImage }}
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
                <UInput v-model="form.category" placeholder="showroom" size="xl" />
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
            {{ t.create }}
          </UButton>

          <UButton color="neutral" variant="outline" @click="navigateTo('/admin')">
            {{ t.cancel }}
          </UButton>
        </div>
      </UForm>
    </UCard>
  </main>
</template>
