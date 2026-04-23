<template>
  <v-app>
    <AppHeader :title="title">
      <template #leading>
        <v-icon>mdi-graph-outline</v-icon>
      </template>

      <template #trailing>
        <v-btn to="/">
          {{ $t("all_skills") }}
        </v-btn>

        <v-btn v-if="user" :to="`/users/${user.preferred_username}`">
          {{ $t("my_skills") }}
        </v-btn>

        <LocaleSelector />
        <v-btn icon="mdi-logout" @click="handleLogout()" />
      </template>
    </AppHeader>

    <v-main>
      <slot />
    </v-main>

    <client-only>
      <v-snackbar-queue v-model="queue" />
      <AppConfirmDialog />
    </client-only>
    <AppFooter :app-info="appInfo" :dev-info="devInfo" />
  </v-app>
</template>

<script setup lang="ts">
const { queue } = useToast();
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
