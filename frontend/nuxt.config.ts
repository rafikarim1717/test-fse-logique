export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: false },
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3001',
    },
  },
  css: ['~/assets/main.css'],
});