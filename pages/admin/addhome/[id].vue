<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

type Lang = 'mk' | 'en'
const lang = useState<Lang>('lang', () => 'mk')

const texts = {
  mk: {
    title: 'Додај елемент на почетна',
    back: 'Назад',
    image: 'Слика',
    dragDrop: 'Повлечи и пушти слика тука',
    chooseDevice: 'Или избери од телефон/компјутер',
    selectImage: 'Избери слика',
    uploading: 'Се прикачува...',
    imagePath: 'Патека до слика',
    preview: 'Преглед',
    headerMk: 'Наслов MK',
    headerEn: 'Наслов EN',
    descriptionMk: 'Опис MK',
    descriptionEn: 'Опис EN',
    create: 'Креирај',
    cancel: 'Откажи',
    uploadImageOnly: 'Избери слика.',
    uploadFailed: 'Неуспешно прикачување.',
    createFailed: 'Неуспешно креирање на елементот.'
  },
  en: {
    title: 'Add Home Item',
    back: 'Back',
    image: 'Image',
    dragDrop: 'Drag and drop image here',
    chooseDevice: 'Or choose from your phone/computer',
    selectImage: 'Select Image',
    uploading: 'Uploading...',
    imagePath: 'Image path',
    preview: 'Preview',
    headerMk: 'Header MK',
    headerEn: 'Header EN',
    descriptionMk: 'Description MK',
    descriptionEn: 'Description EN',
    create: 'Create',
    cancel: 'Cancel',
    uploadImageOnly: 'Please select an image file.',
    uploadFailed: 'Upload failed.',
    createFailed: 'Failed to create home item.'
  }
} as const

const t = computed(() => texts[lang.value] ?? texts.mk)

const form = reactive({
  img: '',
  header: {
    mk: '',
    en: ''
  },
  description: {
    mk: '',
    en: ''
  }
})

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
    const res = await $fetch('/api/admin/upload-home-image', {
      method: 'POST',
      body,
      credentials: 'include'
    }) as { ok: boolean; path: string }

    form.img = res.path
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
    const res = await $fetch('/api/admin/home/create', {
      method: 'POST',
      credentials: 'include',
      body: {
        img: form.img,
        header: {
          mk: form.header.mk,
          en: form.header.en
        },
        description: {
          mk: form.description.mk,
          en: form.description.en
        }
      }
    }) as any

    await navigateTo(`/admin/changehome/${res.insertedId}`)
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
    <div class="flex items-center justify-between mb-4">
      <h1 class="font-poppins font-bold text-2xl text-white">{{ t.title }}</h1>
      <NuxtLink to="/admin" class="text-white/70 hover:text-white">← {{ t.back }}</NuxtLink>
    </div>

    <UCard>
      <UForm :state="form" @submit="submit" class="space-y-6">
        <div class="space-y-3">
          <p class="text-white font-semibold">{{ t.image }}</p>

          <div
            class="border-2 border-dashed rounded-2xl p-6 text-center transition"
            :class="dragActive
              ? 'border-[var(--color-logoblue)] bg-[var(--color-logoblue)]/10'
              : 'border-white/20 bg-white/5'"
            @dragenter.prevent.stop="dragActive = true"
            @dragover.prevent.stop="dragActive = true"
            @dragleave.prevent.stop="dragActive = false"
            @drop.prevent.stop="onDrop"
          >
            <p class="text-white font-medium">
              {{ t.dragDrop }}
            </p>

            <p class="text-white/60 text-sm mt-1">
              {{ t.chooseDevice }}
            </p>

            <label class="inline-block mt-4 cursor-pointer">
              <span class="px-4 py-2 rounded-lg bg-[var(--color-logoblue)] text-white font-semibold">
                {{ t.selectImage }}
              </span>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFileChange"
              >
            </label>

            <p v-if="uploading" class="text-white/70 mt-3">{{ t.uploading }}</p>
            <p v-if="uploadError" class="text-red-400 mt-3">{{ uploadError }}</p>
          </div>

          <UFormField :label="t.imagePath">
            <UInput v-model="form.img" placeholder="/uploads/home/filename.jpg" />
          </UFormField>

          <div v-if="localPreview || form.img" class="pt-2">
            <p class="text-white/70 text-sm mb-2">{{ t.preview }}</p>
            <img
              :src="localPreview || form.img"
              alt="preview"
              class="w-full max-w-md h-48 object-cover rounded-lg border border-white/10"
            >
          </div>
        </div>

        <UFormField :label="t.headerMk">
          <UInput v-model="form.header.mk" />
        </UFormField>

        <UFormField :label="t.headerEn">
          <UInput v-model="form.header.en" />
        </UFormField>

        <UFormField :label="t.descriptionMk">
          <UTextarea v-model="form.description.mk" :rows="6" />
        </UFormField>

        <UFormField :label="t.descriptionEn">
          <UTextarea v-model="form.description.en" :rows="6" />
        </UFormField>

        <p v-if="errorMsg" class="text-red-400">{{ errorMsg }}</p>

        <div class="flex gap-3">
          <UButton type="submit" :loading="saving" class="bg-[var(--color-logoblue)]">
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
