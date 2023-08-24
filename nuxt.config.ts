export default defineNuxtConfig({
  devtools: {enabled: true},
  ssr: true,
  components: true,
  runtimeConfig: {
    apiSecret: "123",
    public: {
      apiBase: "/api",
    },
  },

  devServer: {
    port: 3010,
  },
  
  modules: [
    // "@nuxtjs/tailwindcss'",
    "@unocss/nuxt",
    "nuxt-windicss",
    "nuxt-mapbox",
    "nuxt-font-loader",
    "@alireza-ab/vue3-persian-datepicker/nuxt",
  ],
  mapbox: {
    accessToken:
      "pk.eyJ1IjoibW1zaG9vcmVzaGkiLCJhIjoiY2t5Y3J0dXMxMHB4ejJwcDV1c3E1bnl1MCJ9.enUObQQA1mfr9uXhRftfxw",
  },

  css: [
    "virtual:windi.css",
    "@/assets/css/main.css",
    "@unocss/reset/tailwind.css",
  ],

  fontLoader: {
    autoImport: true,
    local: [
      {
        src: "@/assets/fonts/woff/PeydaWeb-Black-Persian.woff",
        family: "peyda",
        weight: "100 900",
        class: "font-peyda",
      },
    ],
  },
});