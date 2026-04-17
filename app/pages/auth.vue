<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card
      elevation="8"
      max-width="448"
      rounded="lg"
      class="pa-8 mx-auto w-100"
    >
      <h2 class="text-h4 text-center mb-2 font-weight-bold">Welcome Back</h2>

      <p class="text-body-1 text-center text-medium-emphasis mb-8">
        Please log in to access your dashboard.
      </p>

      <v-btn
        block
        color="primary"
        size="large"
        variant="elevated"
        prepend-icon="mdi-auth0"
        @click="login"
      >
        Continue with Keycloak
      </v-btn>

      <v-divider class="my-8"></v-divider>

      <div class="text-center text-caption text-medium-emphasis">
        By continuing, you agree to our
        <NuxtLink to="#">Terms of Service</NuxtLink>.
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const loading = ref(false);

const login = () => {
  loading.value = true;
  navigateTo("/auth/oidc", { external: true });
};

definePageMeta({
  layout: "auth",
});
</script>
