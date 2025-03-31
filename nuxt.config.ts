// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
export default defineNuxtConfig({
  build: {
    transpile: ["vuetify"],
  },

  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(
          vuetify({
            autoImport: true,
          })
        );
      });
    },
    //...
  ],

  css: ["vuetify/styles"],

  vite: {
    ssr: {
      noExternal: ["vuetify"],
    },
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  devtools: { enabled: true },

  runtimeConfig: {
    // Keys within public are also exposed client-side
    public: {
      apiBase: "/api",
      userManagerApiUrl: "",
      oidcAuthority: "",
      oidcClientId: "",
      nodeEnv: "",
    },
  },
  compatibilityDate: "2024-07-08",
});
