import { createI18n } from "vue-i18n";
import { en as vuetifyEn, ja as vuetifyja } from "vuetify/locale";
import enCustom from "~/locales/en-custom";
import jaCustom from "~/locales/ja-custom";

const messages = {
  ja: {
    $vuetify: {
      ...vuetifyja,
    },
    ...jaCustom,
  },
  en: {
    $vuetify: {
      ...vuetifyEn,
    },
    ...enCustom,
  },
};

export default createI18n({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages,
});
