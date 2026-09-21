<template>
  <main class="h-full flex items-center align-center h-[30em] justify-center bg-gradient-to-b from-slate-900 via-[var(--color-logoblue)] to-slate-900">
    <UCard class="w-full max-w-md">
      <template #header>
        <div>
          <h1 class="font-poppins font-extrabold text-2xl text-white">{{ t.title }}</h1>
          <p class="text-white/70 text-sm mt-1">{{ t.subtitle }}</p>
        </div>
      </template>

      <UForm :state="state" @submit="onSubmit" class="space-y-4">
        <UFormField :label="t.username" name="username">
          <UInput v-model="state.username" size="lg" class="w-full" autocomplete="username" />
        </UFormField>

        <UFormField :label="t.password" name="password">
          <UInput
            v-model="state.password"
            :type="showPassword ? 'text' : 'password'"
            size="lg"
            class="w-full"
            autocomplete="current-password"
          >
            <template #trailing>
              <button type="button" class="text-white/60 hover:text-white text-xs" @click="showPassword = !showPassword">
                {{ showPassword ? t.hide : t.show }}
              </button>
            </template>
          </UInput>
        </UFormField>

        <p v-if="errorMsg" class="text-red-400 text-sm">{{ errorMsg }}</p>

        <UButton type="submit" block size="lg" :loading="loading" class="justify-center font-poppins font-bold">
          {{ t.login }}
        </UButton>
      </UForm>
    </UCard>
  </main>
</template>

<script setup lang="ts">
type Lang = 'mk' | 'en' | 'sq'

definePageMeta({
  layout: 'default',
  middleware: 'admin-login'
})

const lang = useState<Lang>('lang', () => 'mk')

const state = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const errorMsg = ref('')
const showPassword = ref(false)

const labels = {
  mk: {
    title: 'Админ најава',
    subtitle: 'Најавете се за управување со содржина.',
    username: 'Корисничко име',
    password: 'Лозинка',
    login: 'Најави се',
    show: 'Покажи',
    hide: 'Сокриј',
    invalid: 'Погрешни податоци.',
    failed: 'Грешка при најава.'
  },
  en: {
    title: 'Admin Login',
    subtitle: 'Sign in to manage content.',
    username: 'Username',
    password: 'Password',
    login: 'Login',
    show: 'Show',
    hide: 'Hide',
    invalid: 'Invalid credentials.',
    failed: 'Login failed.'
  },
  sq: {
    title: 'Hyrje Admin',
    subtitle: 'Kyçu për menaxhimin e përmbajtjes.',
    username: 'Emri',
    password: 'Fjalëkalimi',
    login: 'Kyçu',
    show: 'Shfaq',
    hide: 'Fshih',
    invalid: 'Të dhëna të pasakta.',
    failed: 'Hyrja dështoi.'
  }
} as const

const t = computed(() => labels[lang.value])

const onSubmit = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: state.username,
        password: state.password
      },
      credentials: 'include'
    })

    state.password = ''
    await navigateTo('/admin')
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || t.value.invalid
  } finally {
    loading.value = false
  }
}
</script>
