<template>
  <div>
    <v-dialog v-model="show" max-width="500" persistent>
      <template v-slot:activator="{ props: activatorProps }">
        <div v-bind="activatorProps">
          <v-btn :icon="dialogData.icon" :color="dialogData.color"> </v-btn>
        </div>
      </template>

      <v-form
        @submit.prevent="submitForm"
        v-model="form"
        class="pt-8 text-center pa-4"
      >
        <v-card>
          <v-card-title>{{ dialogData.title }}</v-card-title>
          <v-card-text>
            <v-row>
              <v-col>
                <v-text-field
                  :label="$t('skill_table.name')"
                  variant="outlined"
                  v-model="formData.name"
                  required
                  :rules="[(v) => !!v || 'Field Required']"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field
                  :label="$t('skill_table.logo')"
                  variant="outlined"
                  v-model="formData.image"
                />
              </v-col>
            </v-row>
            <v-row v-if="formData.image">
              <v-col>
                <v-img height="100px" :src="formData.image" />
              </v-col>
            </v-row>
            <v-checkbox
              v-model="formData.recommended"
              label="Recommended"
              color="primary"
            />
            <v-slider
              :color="levelColor"
              :step="1"
              max="60"
              min="20"
              v-model="formData.importance"
              label="Importance"
              track-color="grey"
            />
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
const props = withDefaults(
  defineProps<{
    dialogData: any;
    initialData?: any;
  }>(),
  {
    initialData: () => ({
      name: "",
      image: "",
      recommended: true,
      importance: 30,
    }),
  }
);
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

watch(
  () => formData.value.recommended,
  (value, _) => {
    if (!value) formData.value.importance = 20;
    else formData.value.importance = 30;
  }
);

const submitForm = () => {
  emit("save-data", formData.value);
  show.value = false;
};

const reset = () => {
  show.value = false;
  formData.value = props.initialData || {
    name: "",
    image: "",
    recommended: true,
    importance: 30,
  };
};

const levelColor = computed(() => {
  if (!formData.value.importance) return "error";
  else if (formData.value.importance < 30) return "orange";
  else if (formData.value.importance < 50) return "teal";
  else return "success";
});
</script>
