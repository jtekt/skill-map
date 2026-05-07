<template>
  <div>
    <v-dialog v-model="show" max-width="800" persistent>
      <template v-slot:activator="{ props: activatorProps }">
        <div v-bind="activatorProps">
          <v-btn
            :icon="dialogData.icon"
            :color="dialogData.color"
            :size="dialogData.size"
            :variant="dialogData.variant ?? 'elevated'"
          >
          </v-btn>
        </div>
      </template>

      <v-form v-model="form" @submit.prevent="submitForm">
        <v-card>
          <!-- TITLE BAR -->
          <v-card-title class="d-flex align-center">
            {{ dialogData.title }}
            <v-spacer></v-spacer>
            <v-btn icon="mdi-close" variant="text" @click="reset" />
          </v-card-title>

          <v-divider />
          <v-card-text>
            <v-row align="start">
              <!-- LEFT PANEL -->
              <v-col cols="12" md="4" class="d-flex flex-column">
                <div class="mb-2" style="height: 220px">
                  <v-img
                    v-if="formData.image"
                    :src="formData.image"
                    class="rounded h-100"
                    contain
                  />
                  <div
                    v-else
                    class="d-flex align-center justify-center rounded h-100"
                    style="border: 1px dashed grey"
                  >
                    <v-icon size="48" color="grey">mdi-image-off</v-icon>
                  </div>
                </div>

                <v-text-field
                  v-model="formData.image"
                  :label="$t('skill_table.logo')"
                  clearable
                  hide-details
                  class="mt-1"
                />
              </v-col>

              <!-- RIGHT PANEL -->
              <v-col cols="12" md="8" class="d-flex flex-column">
                <v-text-field
                  v-model="formData.name"
                  :label="$t('skill_table.name')"
                  clearable
                  class="mb-3"
                  required
                />

                <v-textarea
                  v-model="formData.description"
                  :label="$t('skill.form.description')"
                  auto-grow
                  rows="3"
                  clearable
                  class="mb-4"
                />

                <v-row align="center">
                  <v-col cols="12" md="5">
                    <v-switch
                      v-model="formData.recommended"
                      :label="$t('skill.form.recommended')"
                      inset
                      hide-details
                      color="primary"
                    />
                  </v-col>

                  <v-col cols="12" md="7">
                    <v-slider
                      v-model="formData.importance"
                      :label="$t('skill.form.importance')"
                      min="10"
                      max="100"
                      step="1"
                      thumb-label="always"
                      track-color="grey"
                      :color="levelColor"
                      hide-details
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-text>

          <!-- BUTTONS -->
          <v-card-actions class="d-flex justify-end">
            <v-btn
              color="primary"
              size="lg"
              text="Add"
              type="submit"
              :disabled="!form || !formData.name"
            />
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ dialogData: any }>();
const emit = defineEmits(["save-data"]);

const show = ref(false);
const form = ref(false);

const formData = ref({
  image: "",
  name: "",
  description: "",
  recommended: false,
  importance: 50,
});

const reset = () => {
  show.value = false;
  formData.value = {
    image: "",
    name: "",
    description: "",
    recommended: false,
    importance: 50,
  };
};

const submitForm = () => {
  emit("save-data", { ...formData.value });
  reset();
};

const levelColor = computed(() => {
  const lvl = formData.value.importance;
  if (lvl < 30) return "orange";
  if (lvl < 50) return "teal";
  return "success";
});
</script>
