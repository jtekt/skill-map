<template>
  <v-app>
    <AppTemplate
      :options="options"
      @user-changed="handleUserChanged($event)"
      v-if="options"
    >
      <template v-slot:header>
        <v-btn to="/"> {{ $t("all_skills") }} </v-btn>
        <v-btn
          :to="`/users/${useAuthUser().value.username}`"
          v-if="useAuthUser().value"
        >
          {{ $t("my_skills") }}
        </v-btn>
        <!-- Hide localization for now -->
        <!-- <v-btn prepend-icon="mdi-translate" @click="changeLocale">
        {{ current === "en" ? "EN" : "JA" }}
      </v-btn> -->
      </template>
      <NuxtPage />
    </AppTemplate>
  </v-app>
</template>
<script setup lang="ts">
// @ts-ignore
import AppTemplate from "@moreillon/vuetify3-application-template";
import "@moreillon/vuetify3-application-template/dist/style.css";
import { useLocale } from "vuetify";

const { current } = useLocale();

const config = useRuntimeConfig();
const { setUser, setAccessToken, useAuthUser } = useAuth();
const title = computed(() => {
  console.log();
  if (config.public.nodeEnv) return `${config.public.nodeEnv} | Skill Map`;
  else return `Skill Map`;
});
const options = ref({
  title: title.value,
  logo: "/jtekt_logo_negative.jpg",
  author: "Leah Ishiguro",
  footer: false,
  appBarColor: "black",
  oidc: {
    authority: config.public.oidcAuthority,
    client_id: config.public.oidcClientId,
    extraQueryParams: {
      audience: "",
    },
  },
});

onMounted(() => {
  const savedLocale = localStorage.getItem("locale");
  if (!savedLocale) return;
  current.value = "en";
  // current.value = savedLocale;
});

const handleUserChanged = ({ user }) => {
  if (!user) return;
  setAccessToken(user.access_token);
  getUser();
};

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

const changeLocale = () => {
  current.value = current.value === "en" ? "ja" : "en";
  localStorage.setItem("locale", current.value);
};
useHead({
  title: title.value,
});
</script>
