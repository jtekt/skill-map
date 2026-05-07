<template>
  <v-card v-if="skill">
    <v-card-title class="d-flex align-center">
      {{ $t("skill_info.title") }}

      <v-spacer></v-spacer>

      <v-tooltip :text="$t('skill_info.update_skill')" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn
            @click="$emit('update:skill', skill)"
            icon="mdi-content-save"
            variant="text"
            v-bind="props"
            color="success"
            :disabled="!isChanged"
          />
        </template>
      </v-tooltip>

      <v-tooltip :text="$t('skill_info.delete_skill')" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-trash-can"
            color="error"
            variant="text"
            v-bind="props"
            @click="$emit('delete-skill')"
          />
        </template>
      </v-tooltip>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-row align="start">
        <!-- LEFT SIDE --><!-- LEFT SIDE -->
        <v-col cols="12" md="4" class="d-flex flex-column">
          <!-- IMAGE AREA -->
          <div class="mb-2" style="height: 220px">
            <v-img
              v-if="skill.image"
              :src="skill.image"
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

          <!-- TEXTFIELD -->
          <v-text-field
            v-model="skill.image"
            :label="$t('skill_table.logo')"
            clearable
            hide-details
            class="mt-1"
          />
        </v-col>

        <!-- RIGHT SIDE -->
        <v-col cols="12" md="8" class="d-flex flex-column">
          <!-- Skill Name -->
          <v-text-field
            v-model="skill.name"
            :label="$t('skill_table.name')"
            class="mb-3"
            clearable
          />

          <!-- Description -->
          <v-textarea
            v-model="skill.description"
            :label="$t('skill.form.description')"
            rows="3"
            auto-grow
            class="mb-4"
            clearable
          />

          <!-- CONTROL PANEL -->

          <v-row align="center">
            <!-- Recommended -->
            <v-col cols="4" class="d-flex align-center">
              <v-switch
                v-model="skill.recommended"
                :label="$t('skill.form.recommended')"
                color="primary"
                inset
                hide-details
              />
            </v-col>

            <!-- Importance -->
            <v-col cols="7">
              <v-slider
                :color="levelColor"
                step="1"
                max="100"
                min="10"
                v-model="skill.importance"
                :label="$t('skill.form.importance')"
                track-color="grey"
                thumb-label="always"
                hide-details
              />
            </v-col>
          </v-row>
        </v-col> </v-row
    ></v-card-text>
  </v-card>
</template>

<script setup lang="ts">
const skill = defineModel<any>("skill");
defineEmits(["delete-skill"]);

const originalSkill = ref<any>(null);

watch(
  skill,
  (val) => {
    if (val) {
      originalSkill.value = JSON.parse(JSON.stringify(val));
    }
  },
  { immediate: true },
);

const isChanged = computed(() => {
  return JSON.stringify(skill.value) !== JSON.stringify(originalSkill.value);
});

const levelColor = computed(() => {
  if (!skill.value.importance) return "error";
  else if (skill.value.importance < 30) return "orange";
  else if (skill.value.importance < 50) return "teal";
  else return "success";
});
</script>
