// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
   modules: [
    'nuxt-mapbox',
    'nuxt-windicss',
    'nuxt-font-loader'

  ],
  mapbox: {
    accessToken:"pk.eyJ1IjoibW1zaG9vcmVzaGkiLCJhIjoiY2t5Y3J0dXMxMHB4ejJwcDV1c3E1bnl1MCJ9.enUObQQA1mfr9uXhRftfxw",
  },

  css: [
    'virtual:windi.css',
    'virtual:windi-devtools',
  ],

  windicss: {
    analyze: true
  },

  fontLoader: {
    autoImport: true,
    local: [
      {
        src: '/fonts/woff2/PeydaWeb-Black.woff2',
        family: 'peyda',
        weight: '100 900',
        class: 'font-peyda'
      }
    ]
  }
})
