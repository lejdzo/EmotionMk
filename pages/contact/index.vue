<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

type Lang = 'mk' | 'en'

const lang = useState<Lang>('lang', () => 'mk')

const texts = {
  mk: {
    sendMessage: 'Испрати порака',
    contactInfo: 'Контакт информации',
    name: 'Име',
    phone: 'Телефон',
    email: 'Е-пошта',
    subject: 'Наслов',
    message: 'Порака',
    namePlaceholder: 'Внеси име',
    phonePlaceholder: 'Внеси телефон',
    emailPlaceholder: 'vasiot@email.com',
    subjectPlaceholder: 'За што се однесува?',
    messagePlaceholder: 'Напиши ја твојата порака...',
    send: 'Испрати',
    locationMapTitle: 'Локација на E-MOTION MK',
    phoneLabel: 'Телефон:',
    emailLabel: 'Е-пошта:',
    locationLabel: 'Локација:',
    locationValue: 'GTC Скопје, 1 кат',
    errors: {
      required: 'Пополнете ги сите задолжителни полиња.',
      failed: 'Неуспешно испраќање на пораката.'
    },
    success: 'Пораката е успешно испратена.'
  },
  en: {
    sendMessage: 'Send message',
    contactInfo: 'Contact info',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    subject: 'Subject',
    message: 'Message',
    namePlaceholder: 'Enter your name',
    phonePlaceholder: 'Enter your phone',
    emailPlaceholder: 'your@email.com',
    subjectPlaceholder: 'What is this about?',
    messagePlaceholder: 'Write your message...',
    send: 'Send',
    locationMapTitle: 'E-MOTION MK location map',
    phoneLabel: 'Phone:',
    emailLabel: 'Email:',
    locationLabel: 'Location:',
    locationValue: 'GTC Skopje, 1st floor',
    errors: {
      required: 'Please fill in all required fields.',
      failed: 'Failed to send message.'
    },
    success: 'Message sent successfully.'
  }
} as const

const t = computed(() => texts[lang.value] ?? texts.mk)

const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const form = reactive({
  name: '',
  phone: '',
  email: '',
  subject: '',
  message: ''
})

const submitContact = async () => {
  errorMsg.value = ''
  successMsg.value = ''

  if (!form.name || !form.email || !form.subject || !form.message) {
    errorMsg.value = t.value.errors.required
    return
  }

  loading.value = true

  try {
    await $fetch('/api/mail/send', {
      method: 'POST',
      body: {
        type: 'contact',
        name: form.name,
        phone: form.phone,
        email: form.email,
        subject: form.subject,
        message: form.message
      }
    })

    successMsg.value = t.value.success

    form.name = ''
    form.phone = ''
    form.email = ''
    form.subject = ''
    form.message = ''
  } catch (e: any) {
    errorMsg.value =
      e?.data?.message ||
      e?.data?.statusMessage ||
      e?.message ||
      t.value.errors.failed
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="h-full place-content-center bg-gradient-to-b from-slate-900 via-[var(--color-logoblue)] to-slate-900 p-5">
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
      <UCard class="bg-slate-900">
        <template #header>
          <p class="font-poppins font-bold text-white">{{ t.sendMessage }}</p>
        </template>

        <UForm :state="form" @submit="submitContact">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <UCard>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <UFormField :label="t.name" name="name" required>
                  <UInput v-model="form.name" :placeholder="t.namePlaceholder" size="xl" />
                </UFormField>

                <UFormField :label="t.phone" name="phone">
                  <UInput v-model="form.phone" :placeholder="t.phonePlaceholder" size="xl" />
                </UFormField>

                <UFormField :label="t.email" name="email" required>
                  <UInput v-model="form.email" type="email" :placeholder="t.emailPlaceholder" size="xl" />
                </UFormField>

                <UFormField :label="t.subject" name="subject" required>
                  <UInput v-model="form.subject" :placeholder="t.subjectPlaceholder" size="xl" />
                </UFormField>

                <UFormField :label="t.message" name="message" class="md:col-span-2" required>
                  <UTextarea
                    v-model="form.message"
                    :rows="6"
                    size="xl"
                    :placeholder="t.messagePlaceholder"
                  />
                </UFormField>
              </div>

              <div class="w-full flex items-start justify-between gap-4 mt-5">
                <div>
                  <div v-if="errorMsg" class="text-red-400 text-sm">
                    {{ errorMsg }}
                  </div>

                  <div v-if="successMsg" class="text-emerald-400 text-sm">
                    {{ successMsg }}
                  </div>
                </div>

                <UButton
                  type="submit"
                  :loading="loading"
                  class="bg-[var(--color-logoblue)]"
                >
                  {{ t.send }}
                </UButton>
              </div>
            </UCard>

            <div class="pt-2 w-full">
              <div class="overflow-hidden rounded-xl border border-white/10">
                <iframe
                  :title="t.locationMapTitle"
                  src="https://www.google.com/maps?q=GTC%20Skopje&output=embed"
                  class="w-full h-[27.5em]"
                  style="border:0;"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  allowfullscreen
                />
              </div>
            </div>
          </div>
        </UForm>
      </UCard>

      <UCard class="h-fit">
        <template #header>
          <p class="font-poppins font-bold text-white">{{ t.contactInfo }}</p>
        </template>

        <div class="space-y-3 text-white/80">
          <p><span class="text-white font-semibold">{{ t.phoneLabel }}</span> 073/857-811</p>
          <p><span class="text-white font-semibold">{{ t.emailLabel }}</span> pegla699@gmail.com</p>
          <p><span class="text-white font-semibold">{{ t.locationLabel }}</span> {{ t.locationValue }}</p>
        </div>

        <template #footer>
          <div class="pt-2">
            <img src="/images/DSC03024.jpg" class="rounded-xl" alt="">
          </div>
        </template>
      </UCard>
    </div>
  </main>
</template>
