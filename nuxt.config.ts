// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
export default defineNuxtConfig({
  app: {
    head: {
      title: "Skill Map",
    },
  },
  build: {
    transpile: ["vuetify"],
  },
  imports: {
    autoImport: true,
  },
  components: true,
  modules: [
    "nuxt-auth-utils",
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(
          vuetify({
            autoImport: true,
          }),
        );
      });
    },
  ],
  css: ["vuetify/styles"],

  vite: {
    ssr: {
      noExternal: ["vuetify"],
    },
    optimizeDeps: {
      include: [
        "vue-i18n",
        "d3",
        "date-fns",
        "date-fns/locale",
        "vue-chartjs",
        "chart.js",
        "chart.js/auto",
      ],
    },
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  devtools: { enabled: false },
  ssr: false,

  runtimeConfig: {
    public: {
      userLookup: {
        url: "",
        identifierField: "",
        displayNameField: "",
      },
      authOidcIdentifierField: "",
      apiBase: "/api",
      developer: "",
      developerHomepage: "",
      appRepo: "",
    },
  },
  compatibilityDate: "2025-07-15",
});
