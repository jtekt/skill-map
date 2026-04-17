<template>
  <ClientOnly>
    <v-app>
      <AppHeader :title="title">
        <template #leading>
          <img src="/jtekt_logo_negative.jpg" alt="Logo" />
        </template>

        <template #trailing>
          <v-btn to="/">
            {{ $t("all_skills") }}
          </v-btn>

          <v-btn v-if="user" :to="`/users/${user.preferred_username}`">
            {{ $t("my_skills") }}
          </v-btn>

          <!-- Localization temporarily disabled -->
          <!--
          <v-btn prepend-icon="mdi-translate" @click="changeLocale">
            {{ current === "en" ? "EN" : "JA" }}
          </v-btn>
          -->

          <v-btn icon="mdi-logout" @click="handleLogout()" />
        </template>
      </AppHeader>

      <v-main>
        <slot />
      </v-main>

      <AppFooter :app-info="appInfo" :dev-info="devInfo" />
    </v-app>
  </ClientOnly>
</template>

<script setup lang="ts">
const { user, clear } = useUserSession();
const config = useRuntimeConfig();
const router = useRouter();

const title = "Skill Map";

const appInfo = {
  title,
  href: config.public.appRepo,
};

const devInfo = {
  name: config.public.developer,
  href: config.public.developerHomepage,
};

const handleLogout = async () => {
  await clear();
  router.push("/auth");
};
</script>
