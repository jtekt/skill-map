<template>
  <v-select
    max-width="150"
    prepend-inner-icon="mdi-translate"
    :items="locales"
    v-model="locale"
    @update:model-value="saveLocale"
    hide-details
    density="compact"
  />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

const locales = [
  { title: "English", value: "en" },
  { title: "日本語", value: "ja" },
];

function saveLocale() {
  localStorage.setItem("locale", locale.value);
}

const saved = localStorage.getItem("locale");
if (saved) locale.value = saved;
</script>
