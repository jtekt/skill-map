<template>
  <v-dialog v-model="state.visible" max-width="400">
    <v-card>
      <v-card-text>
        {{ state.options?.text }}
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="cancel">
          {{ state.options?.cancelText || t("common.cancel") }}
        </v-btn>

        <v-btn :color="state.options?.color || 'primary'" @click="accept">
          {{ state.options?.confirmText || t("common.confirm") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { useLocale } from "vuetify";
const { state, accept, cancel } = useConfirm();
const { t } = useLocale();
</script>
