// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,

  runtimeConfig: {
    mongoUri: process.env.MONGODB_URI,
    mongoDbName: process.env.MONGODB_DB,
    sessionSecret: process.env.SESSION_SECRET,

    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    mailTo: process.env.MAIL_TO
  },

  modules: ['vue3-carousel-nuxt', '@nuxt/ui'],

  css: [
    '~/assets/css/fonts.css',
    '~/assets/css/tailwind.css',
    'flag-icons/css/flag-icons.min.css'
  ], 


nitro: {
    publicAssets: [
      {
        dir: '/var/www/html/static/emotion/uploads',
        baseURL: '/uploads'
      }
    ]
  }
})
