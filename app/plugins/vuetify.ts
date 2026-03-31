// import this after install `@mdi/font` package
import "@mdi/font/css/materialdesignicons.css";

import "vuetify/styles";
import { createVuetify } from "vuetify";
import i18n from "~/locales/i18n";
import { useI18n } from "vue-i18n";

import { createVueI18nAdapter } from "vuetify/locale/adapters/vue-i18n";

export default defineNuxtPlugin((app) => {
  let defaultTheme: any = "light";
  if (import.meta.client) {
    defaultTheme = localStorage.getItem("theme");

    if (!defaultTheme) {
      defaultTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    localStorage.setItem("theme", defaultTheme);
  }

  const vuetify = createVuetify({
    locale: {
      adapter: createVueI18nAdapter({ i18n, useI18n }),
      rtl: {
        customLocale: true,
      },
    },
    theme: {
      defaultTheme,
      themes: {
        light: {
          colors: { primary: "#c00000" },
        },
        dark: {
          colors: { primary: "#c00000" },
        },
      },
    },
    ssr: true,
  });
  app.vueApp.use(vuetify);
  app.vueApp.use(i18n);
});
