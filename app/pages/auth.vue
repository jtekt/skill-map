<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card
      elevation="8"
      max-width="448"
      rounded="lg"
      class="pa-8 mx-auto w-100"
    >
      <h2 class="text-h4 text-center mb-2 font-weight-bold">{{ $t('auth.welcome') }}</h2>

      <p class="text-body-1 text-center text-medium-emphasis mb-8">
        {{ $t('auth.login_prompt') }}
      </p>

      <v-btn
        block
        color="primary"
        size="large"
        variant="elevated"
        prepend-icon="mdi-auth0"
        @click="login"
      >
        {{ $t('auth.continue_with_keycloak') }}
      </v-btn>

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
