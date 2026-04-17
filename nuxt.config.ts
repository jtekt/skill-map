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
    "nuxt-oidc-auth",
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

  oidc: {
    providers: {
      keycloak: {
        audience: "account",
        baseUrl: "",
        authorizationUrl: "",
        tokenUrl: "",
        userInfoUrl: "",
        logoutUrl: "",
        clientId: "",
        clientSecret: "",
        redirectUri: "",
        logoutRedirectUri: "",
        exposeAccessToken: true,
      },
    },
    session: {
      expirationCheck: true,
      automaticRefresh: true,
    },
    middleware: {
      globalMiddlewareEnabled: true,
      customLoginPage: false,
    },
  },
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

  devtools: { enabled: false },
  ssr: false,

  runtimeConfig: {
    public: {
      apiBase: "/api",
      userManagerApiUrl: "",
      developer: "",
      developerHomepage: "",
      appRepo: "",
    },
  },
  compatibilityDate: "2025-07-15",
});
