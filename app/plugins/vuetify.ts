import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import i18n from "~/locales/i18n";
import { useI18n } from "vue-i18n";
import { createUI } from "@jtekt/vue-feedback-kit";
import { createVueI18nAdapter } from "vuetify/locale/adapters/vue-i18n";

export default defineNuxtPlugin((app) => {
  let defaultTheme: string = "light";

  if (import.meta.client) {
    defaultTheme =
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");

    localStorage.setItem("theme", defaultTheme);
  }

  const vuetify = createVuetify({
    locale: {
      adapter: createVueI18nAdapter({ i18n, useI18n }),
      rtl: { customLocale: true },
    },
    defaults: {
      VSwitch: { color: "primary" },
      VTextField: { variant: "underlined" },
      VTextarea: { variant: "underlined" },
      VSelect: { variant: "outlined" },
    },
    theme: {
      defaultTheme,
      themes: {
        light: {
          colors: {
            primary: "#b00000",
            background: "#f5f5f5",
          },
        },
        dark: {
          colors: {
            primary: "#e04444",
          },
        },
      },
    },
    ssr: true,
  });

  app.vueApp.use(vuetify);
  app.vueApp.use(i18n);
  app.vueApp.use(createUI, {
    theme: () => ({
      dark: vuetify.theme.global.current.value.dark,
      colors: vuetify.theme.current.value.colors,
    }),
  });
});
