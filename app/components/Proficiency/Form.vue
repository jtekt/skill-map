<template>
  <div class="text-center pa-4">
    <v-dialog v-model="show" max-width="420" persistent>
      <!-- ACTIVATOR -->
      <template v-slot:activator="{ props: activatorProps }">
        <div v-bind="activatorProps">
          <v-btn
            :icon="dialogData.icon"
            :size="dialogData.size ?? ''"
            :color="dialogData.color"
            :variant="dialogData.variant ?? 'text'"
          />
        </div>
      </template>

      <!-- FORM -->
      <v-form v-model="form" @submit.prevent="submitForm">
        <v-card>
          <!-- TITLE BAR -->
          <v-card-title class="d-flex align-center">
            <span class="text-h6">{{ dialogData.title }}</span>
            <v-spacer />
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="reset"
              size="small"
            />
          </v-card-title>

          <v-divider />

          <!-- CONTENT -->
          <v-card-text class="pt-10 pb-0">
            <v-slider
              v-model="formData.level"
              min="1"
              max="100"
              step="1"
              track-color="grey-lighten-2"
              :color="levelColor"
              thumb-label="always"
            />
          </v-card-text>

          <!-- ACTIONS -->
          <v-card-actions class="px-4 justify-end">
            <v-btn color="primary" :text="$t('skill.form.add_btn')" type="submit" :disabled="!form" />
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  dialogData: any;
}>();
const emit = defineEmits(["save-data"]);

const show = ref(false);
const form = ref(false);

const formData = ref({
  level: 50, // default level for new skill
});

const submitForm = () => {
  emit("save-data", { level: formData.value.level });
  reset();
};

const reset = () => {
  show.value = false;
  formData.value = { level: 50 };
};

const levelColor = computed(() => {
  if (!formData.value) return "error";
  else if (formData.value.level < 25) return "error";
  else if (formData.value.level < 50) return "orange";
  else if (formData.value.level < 75) return "teal";
  else if (formData.value.level >= 75) return "success";
});
</script>
