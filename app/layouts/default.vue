<template>
  <v-app>
    <AppHeader :title="title">
      <template #leading>
        <img src="/logo.svg" class="text-red-500" />
      </template>

      <template #trailing>
        <v-btn to="/">
          {{ $t("all_skills") }}
        </v-btn>

        <v-btn v-if="user_id" :to="`/users/${user_id}`">
          {{ $t("my_skills") }}
        </v-btn>

        <LocaleSelector class="ma-2" />
        <v-btn
          v-if="!isAuthDisabled()"
          icon="mdi-logout"
          @click="handleLogout()"
        />
      </template>
    </AppHeader>

    <v-main>
      <slot />
    </v-main>

    <client-only>
      <ConfirmDialog />
      <Toaster />
    </client-only>
    <AppFooter :app-info="appInfo" :dev-info="devInfo" />
  </v-app>
</template>

<script setup lang="ts">
const { clear } = useUserSession();
const config = useRuntimeConfig();
const router = useRouter();
const { user_id } = useAuthIdentifier();

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
