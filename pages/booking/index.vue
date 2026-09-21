<template>
  <main class="h-full place-content-center bg-gradient-to-b from-slate-900 via-[var(--color-logoblue)] to-slate-900 p-5">
    <div>
      <h1 class="font-poppins font-extrabold text-2xl md:text-3xl text-white">
        {{ t.pageTitle }}
      </h1>
      <p class="text-white/70 mt-1">
        {{ t.pageSubtitle }}
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-5 items-start">
      <!-- Calendar -->
      <UCard>
        <template #header>
          <p class="font-poppins font-bold text-white">{{ t.selectDate }}</p>
        </template>

        <div class="space-y-3">
          <UCalendar
            v-model="selectedDate"
            :is-date-disabled="isDateDisabled"
            class="w-full"
          />

          <div class="text-sm text-white/70">
            <p>
              {{ t.availableFrom }}
              <span class="text-white font-semibold">{{ formatDate(minAllowedDate) }}</span>
            </p>
            <p>{{ t.firstDaysBlocked }}</p>
          </div>
        </div>
      </UCard>

      <!-- Form -->
      <UCard>
        <template #header>
          <p class="font-poppins font-bold text-white">{{ t.bookingDetails }}</p>
        </template>

        <UForm :state="form" @submit="submitBooking" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField :label="t.model" name="productId">
              <USelect
                v-model="form.productId"
                :items="productOptions"
                option-attribute="label"
                value-attribute="value"
                :placeholder="t.selectModel"
              />
            </UFormField>

            <UFormField :label="t.hour" name="hour">
              <USelect
                v-model="form.hour"
                :items="hourOptions"
                option-attribute="label"
                value-attribute="value"
                :disabled="!selectedDate"
                :placeholder="t.selectHour"
              />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField :label="t.fullName" name="name">
              <UInput v-model="form.name" :placeholder="t.namePlaceholder" />
            </UFormField>

            <UFormField :label="t.phone" name="phone">
              <UInput v-model="form.phone" :placeholder="t.phonePlaceholder" />
            </UFormField>
          </div>

          <UFormField :label="t.note" name="note">
            <UTextarea v-model="form.note" :rows="3" :placeholder="t.notePlaceholder" />
          </UFormField>

          <div class="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
            <p class="text-white/70">{{ t.selectedDate }}:</p>
            <p class="text-white font-semibold">
              {{ selectedDate ? formatDate(selectedDate) : t.noDateSelected }}
            </p>
          </div>

          <div v-if="errorMsg" class="text-red-400 text-sm">
            {{ errorMsg }}
          </div>

          <div v-if="successMsg" class="text-emerald-400 text-sm">
            {{ successMsg }}
          </div>

          <UButton
            type="submit"
            :loading="loading"
            class="bg-[var(--color-logoblue)]"
          >
            {{ t.submit }}
          </UButton>
        </UForm>
      </UCard>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

type Lang = 'mk' | 'en' | 'sq'

type BookingItem = {
  id: string
  productId: string
  date: string
  hour: string
  status: 'booked' | 'cancelled' | 'done'
}

const lang = useState<Lang>('lang', () => 'mk')

const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const selectedDate = ref<any>(null)

const form = reactive({
  productId: '',
  hour: '',
  name: '',
  phone: '',
  note: ''
})

const texts = {
  mk: {
    pageTitle: 'Закажи тест возење',
    pageSubtitle: 'Термините се достапни најрано 1 ден однапред.',
    selectDate: 'Избери датум',
    availableFrom: '✅ Достапни се датуми од:',
    firstDaysBlocked: '❌ Денешниот датум е блокиран',
    bookingDetails: 'Податоци за резервација',
    model: 'Модел',
    selectModel: 'Избери модел',
    hour: 'Час',
    selectHour: 'Избери час',
    fullName: 'Име и презиме',
    namePlaceholder: 'Внеси име и презиме',
    phone: 'Телефон',
    phonePlaceholder: 'Внеси телефон',
    note: 'Забелешка',
    notePlaceholder: 'Опционално...',
    selectedDate: 'Избран датум',
    noDateSelected: 'Нема избран датум',
    submit: 'Закажи тест возење',
    errors: {
      selectDate: 'Избери датум.',
      invalidDate: 'Невалиден датум.',
      oneDayAhead: 'Може да резервираш најрано 1 ден однапред.',
      requiredFields: 'Пополнете ги задолжителните полиња.',
      generic: 'Грешка при закажување.'
    },
    success: 'Успешно закажано тест возење!'
  },
  en: {
    pageTitle: 'Book a test ride',
    pageSubtitle: 'Appointments are available at least 1 day in advance.',
    selectDate: 'Select date',
    availableFrom: '✅ Available dates from:',
    firstDaysBlocked: '❌ Today is blocked',
    bookingDetails: 'Booking details',
    model: 'Model',
    selectModel: 'Select model',
    hour: 'Time',
    selectHour: 'Select time',
    fullName: 'Full name',
    namePlaceholder: 'Enter full name',
    phone: 'Phone',
    phonePlaceholder: 'Enter phone number',
    note: 'Note',
    notePlaceholder: 'Optional...',
    selectedDate: 'Selected date',
    noDateSelected: 'No date selected',
    submit: 'Book a test ride',
    errors: {
      selectDate: 'Select a date.',
      invalidDate: 'Invalid date.',
      oneDayAhead: 'You can book at least 1 day in advance.',
      requiredFields: 'Please fill in the required fields.',
      generic: 'Booking error.'
    },
    success: 'Test ride booked successfully!'
  },
  sq: {
    pageTitle: 'Rezervo test drive',
    pageSubtitle: 'Terminet janë të disponueshme të paktën 1 ditë përpara.',
    selectDate: 'Zgjidh datën',
    availableFrom: '✅ Datat e disponueshme nga:',
    firstDaysBlocked: '❌ Dita e sotme është e bllokuar',
    bookingDetails: 'Të dhënat e rezervimit',
    model: 'Modeli',
    selectModel: 'Zgjidh modelin',
    hour: 'Ora',
    selectHour: 'Zgjidh orën',
    fullName: 'Emri dhe mbiemri',
    namePlaceholder: 'Shkruaj emrin dhe mbiemrin',
    phone: 'Telefoni',
    phonePlaceholder: 'Shkruaj numrin e telefonit',
    note: 'Shënim',
    notePlaceholder: 'Opsionale...',
    selectedDate: 'Data e zgjedhur',
    noDateSelected: 'Nuk ka datë të zgjedhur',
    submit: 'Rezervo test drive',
    errors: {
      selectDate: 'Zgjidh një datë.',
      invalidDate: 'Datë e pavlefshme.',
      oneDayAhead: 'Mund të rezervosh të paktën 1 ditë përpara.',
      requiredFields: 'Plotëso fushat e detyrueshme.',
      generic: 'Gabim gjatë rezervimit.'
    },
    success: 'Test drive u rezervua me sukses!'
  }
} as const

const t = computed(() => texts[lang.value] ?? texts.mk)

const toJsDate = (value: any): Date | null => {
  if (!value) return null

  if (value instanceof Date) return value

  if (typeof value === 'string') {
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
  }

  if (
    typeof value === 'object' &&
    typeof value.year === 'number' &&
    typeof value.month === 'number' &&
    typeof value.day === 'number'
  ) {
    return new Date(value.year, value.month - 1, value.day)
  }

  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

const startOfDay = (input: any): Date | null => {
  const d = toJsDate(input)
  if (!d) return null
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

const dateToYMD = (input: any): string => {
  const d = toJsDate(input)
  if (!d) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const formatDate = (input: any): string => {
  const d = toJsDate(input)
  if (!d) return ''

  const localeMap: Record<Lang, string> = {
    mk: 'mk-MK',
    en: 'en-GB',
    sq: 'sq-AL'
  }

  return d.toLocaleDateString(localeMap[lang.value] || 'mk-MK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const { data: productsRes } = await useFetch('/api/products')

const products = computed<any[]>(() => {
  if (!productsRes.value) return []
  if (Array.isArray(productsRes.value)) return productsRes.value as any[]
  return ((productsRes.value as any)?.data || []) as any[]
})

const pick = (value: any, fallback = ''): string => {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return value[lang.value] ?? value.mk ?? value.en ?? value.sq ?? Object.values(value)[0] ?? fallback
}

const productOptions = computed(() =>
  products.value.map((p: any) => ({
    label: pick(p?.displayName, p.id),
    value: p.id
  }))
)

const selectedProductLabel = computed(() => {
  return productOptions.value.find((p: any) => p.value === form.productId)?.label || form.productId
})

const { data: bookingsRes, refresh: refreshBookings } = await useFetch('/api/test-rides/booking')

const bookings = computed<BookingItem[]>(() => {
  if (!bookingsRes.value) return []
  if (Array.isArray(bookingsRes.value)) return bookingsRes.value as BookingItem[]
  return (((bookingsRes.value as any)?.data || []) as BookingItem[])
})

const minAllowedDate = computed(() => {
  const today = startOfDay(new Date())!
  const d = new Date(today)
  d.setDate(d.getDate() + 1)
  return d
})

const isDateDisabled = (date: any) => {
  const check = startOfDay(date)
  const min = startOfDay(minAllowedDate.value)
  if (!check || !min) return true
  return check < min
}

const ALL_HOURS = ['10:00', '11:00', '12:00', '13:00', '17:00', '18:00', '19:00']

const selectedDateYmd = computed(() => (selectedDate.value ? dateToYMD(selectedDate.value) : ''))

const bookedHoursForSelectedDate = computed(() => {
  if (!selectedDateYmd.value) return []
  return bookings.value
    .filter((b) => b.status === 'booked' && b.date === selectedDateYmd.value)
    .map((b) => b.hour)
})

const hourOptions = computed(() => {
  const taken = new Set(bookedHoursForSelectedDate.value)
  return ALL_HOURS
    .filter((h) => !taken.has(h))
    .map((h) => ({ label: h, value: h }))
})

watch(selectedDate, () => {
  if (!hourOptions.value.find((x: any) => x.value === form.hour)) {
    form.hour = ''
  }
})

const submitBooking = async () => {
  errorMsg.value = ''
  successMsg.value = ''

  if (!selectedDate.value) {
    errorMsg.value = t.value.errors.selectDate
    return
  }

  const selectedDay = startOfDay(selectedDate.value)
  const minDay = startOfDay(minAllowedDate.value)

  if (!selectedDay || !minDay) {
    errorMsg.value = t.value.errors.invalidDate
    return
  }

  if (selectedDay < minDay) {
    errorMsg.value = t.value.errors.oneDayAhead
    return
  }

  if (!form.productId || !form.hour || !form.name || !form.phone) {
    errorMsg.value = t.value.errors.requiredFields
    return
  }

  loading.value = true

  try {
    const payload = {
      productId: form.productId,
      date: dateToYMD(selectedDate.value),
      hour: form.hour,
      customerName: form.name,
      customerPhone: form.phone,
      note: form.note || ''
    }

    await $fetch('/api/test-rides/booking', {
      method: 'POST',
      body: payload
    })

    await $fetch('/api/mail/send', {
      method: 'POST',
      body: {
        type: 'test-ride',
        model: selectedProductLabel.value,
        date: formatDate(selectedDate.value),
        hour: form.hour,
        name: form.name,
        phone: form.phone,
        note: form.note || ''
      }
    })

    successMsg.value = t.value.success

    form.hour = ''
    form.name = ''
    form.phone = ''
    form.note = ''

    await refreshBookings()
  } catch (e: any) {
    errorMsg.value =
      e?.data?.message ||
      e?.data?.statusMessage ||
      e?.message ||
      t.value.errors.generic
  } finally {
    loading.value = false
  }
}
</script>
