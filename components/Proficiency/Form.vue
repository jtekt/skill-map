<template>
  <div class="text-center pa-4">
    <v-dialog v-model="show" max-width="500" persistent>
      <template v-slot:activator="{ props: activatorProps }">
        <div v-bind="activatorProps">
          <v-btn
            :icon="dialogData.icon"
            :size="dialogData.size ?? ''"
            :variant="dialogData.variant ?? 'plain'"
          >
          </v-btn>
        </div>
      </template>

      <v-form @submit.prevent="submitForm" v-model="form" class="pt-8">
        <v-card>
          <v-card-title>{{ dialogData.title }}</v-card-title>
          <v-card-text>
            <v-row>
              <v-col>
                <v-slider
                  :color="levelColor"
                  :step="1"
                  max="100"
                  min="1"
                  v-model="formData.level"
                  required
                  track-color="grey"
                />
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="my-2 d-flex justify-end">
            <v-btn
              class="text-none"
              rounded="xl"
              :text="$t('$vuetify.confirmEdit.cancel')"
              @click="reset"
            ></v-btn>

            <v-btn
              :disabled="!form || identical"
              class="text-none"
              color="primary"
              :text="$t('$vuetify.confirmEdit.ok')"
              rounded="xl"
              type="submit"
            />
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
const props = defineProps<{
  dialogData: any;
  initialData?: any;
}>();
const emit = defineEmits(["save-data"]);
const formData = ref({ ...props.initialData });
const form = ref(false);
const identical = ref(true);
const show = ref(false);

watch(formData.value, () => {
  if (!props.initialData || !form.value) {
    identical.value = false;
    return;
  }
  if (
    JSON.stringify(props.initialData).toLocaleLowerCase() ===
    JSON.stringify(formData.value).toLocaleLowerCase()
  ) {
    identical.value = true;
  } else {
    identical.value = false;
  }
});

const submitForm = () => {
  emit("save-data", { level: formData.value.level });
  show.value = false;
};

const reset = () => {
  show.value = false;
  formData.value = props.initialData || {};
};

const levelColor = computed(() => {
  if (!formData.value) return "error";
  else if (formData.value.level < 25) return "error";
  else if (formData.value.level < 50) return "orange";
  else if (formData.value.level < 75) return "teal";
  else if (formData.value.level >= 75) return "success";
});
</script>
