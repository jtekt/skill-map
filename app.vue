<template>
  <v-app>
    <ClientOnly>
      <AppHeader :title="title">
        <template #leading>
          <img src="/jtekt_logo_negative.jpg" alt="Logo" />
        </template>
        <template #trailing>
          <v-btn to="/"> {{ $t("all_skills") }} </v-btn>
          <v-btn :to="`/users/${loggedInUser.username}`" v-if="loggedInUser">
            {{ $t("my_skills") }}
          </v-btn>
          <!-- Hide localization for now -->
          <!-- <v-btn prepend-icon="mdi-translate" @click="changeLocale">
        {{ current === "en" ? "EN" : "JA" }}
      </v-btn> -->
          <v-btn icon="mdi-logout" @click="logout" />
        </template>
      </AppHeader>
      <v-main>
        <NuxtPage />
      </v-main>
      <AppFooter :app-info="appInfo" :dev-info="devInfo" />
    </ClientOnly>
  </v-app>
</template>
<script setup lang="ts">
import { useLocale } from "vuetify";
import { useUser } from "./composables/useUser";

const { current } = useLocale();

const config = useRuntimeConfig();
const { tokenSet, logout } = useAuth();
const { loggedInUser, loadUser } = useUser();
const title = "Skill Map";
const appInfo = {
  title: title,
  href: config.public.appRepo,
};

const devInfo = {
  name: config.public.developer,
  href: config.public.developerHomepage,
};
onMounted(() => {
  const savedLocale = localStorage.getItem("locale");
  if (!savedLocale) return;
  current.value = "en";
  // current.value = savedLocale;
});

watch(
  () => tokenSet.value,
  () => {
    loadUser();
  },
  { deep: true }
);

useHead({
  title: title,
});
</script>
