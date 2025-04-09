<template>
  <v-app>
    <ClientOnly>
      <AppTemplate :options="options" v-if="options">
        <template v-slot:header>
          <v-btn to="/"> {{ $t("all_skills") }} </v-btn>
          <v-btn :to="`/users/${loggedInUser.username}`" v-if="loggedInUser">
            {{ $t("my_skills") }}
          </v-btn>
          <!-- Hide localization for now -->
          <!-- <v-btn prepend-icon="mdi-translate" @click="changeLocale">
        {{ current === "en" ? "EN" : "JA" }}
      </v-btn> -->
          <v-btn icon="mdi-logout" @click="logout()" v-if="loggedInUser" />
        </template>
        <NuxtPage />
      </AppTemplate>
    </ClientOnly>
  </v-app>
</template>
<script setup lang="ts">
// @ts-ignore
import AppTemplate from "@moreillon/vuetify3-application-template";
import "@moreillon/vuetify3-application-template/dist/style.css";
import { useLocale } from "vuetify";

const { current } = useLocale();

const config = useRuntimeConfig();
const { tokenSet, logout } = useAuth();
const { setUser, loggedInUser } = useUser();

const title = computed(() => {
  if (config.public.nodeEnv) return `${config.public.nodeEnv} | Skill Map`;
  else return `Skill Map`;
});
const options = ref({
  title: title.value,
  logo: "/jtekt_logo_negative.jpg",
  author: "Leah Ishiguro",
  footer: false,
  appBarColor: "black",
});

onMounted(() => {
  const savedLocale = localStorage.getItem("locale");
  if (!savedLocale) return;
  current.value = "en";
  // current.value = savedLocale;
  getUser();
});

const getUser = async () => {
  await useFetchApi(`${config.public.userManagerApiUrl}/v3/users/self`)
    .then((response: any) => {
      if (import.meta.dev) console.log("user", response);
      setUser(response);
    })
    .catch((error) => {
      console.log(error);
    });
};

watch(
  () => tokenSet.value,
  (newValue, oldValue) => {
    if (newValue !== oldValue) return;
    getUser();
  },
  { deep: true, immediate: true }
);

useHead({
  title: title.value,
});
</script>
