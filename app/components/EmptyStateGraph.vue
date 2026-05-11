<template>
  <v-empty-state
    image="/empty/planet.png"
    class="w-100"
    align="center"
    justify="center"
    :title="$t('empty_state.title')"
  >
    <template v-slot:text v-if="!loading">
      <div>
        {{
          $t(
            route.params.user_id
              ? "empty_state.content_user"
              : "empty_state.content",
          )
        }}
      </div>
    </template>
    <v-container v-if="route.params.user_id" class="steps-container">
      <v-row align="center" justify="center">
        <v-col cols="12" sm="4">
          <StepCard
            :number="1"
            img="/empty/step-1.png"
            :label="$t('empty_state.step1')"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <StepCard
            :number="2"
            img="/empty/step-2.png"
            :label="$t('empty_state.step2')"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <StepCard
            :number="3"
            img="/empty/step-3.png"
            :label="$t('empty_state.step3')"
          />
        </v-col>
      </v-row>

      <div class="mt-6">
        <v-btn color="primary" variant="flat" @click="goToAllSkills">
          {{ $t("empty_state.cta") }}
        </v-btn>
      </div>
    </v-container>

    <template v-slot:actions v-if="!loading">
      <div v-if="!route.params.user_id">
        <v-tooltip :text="$t('add_new_skill')" location="right">
          <template v-slot:activator="{ props }">
            <SkillForm
              v-bind="props"
              :dialog-data="{
                icon: 'mdi-notebook-plus-outline',
                title: $t('add_new_skill'),
                color: 'primary',
                size: 'x-large',
              }"
              @save-data="doAdd($event)"
            />
          </template>
        </v-tooltip>
      </div>
    </template>
  </v-empty-state>
</template>

<script setup lang="ts">
import { useToast } from "@jtekt/vue-feedback-kit";
const toast = useToast();
const route = useRoute();
const emit = defineEmits(["skill-added"]);
defineProps<{
  loading: boolean;
}>();

onMounted(() => {});

const doAdd = async (data: any) => {
  $fetch("/api/skills", { method: "POST", body: data })
    .then(() => {
      emit("skill-added");
    })
    .catch((error) => {
      toast.error(error.message);
    });
};

const goToAllSkills = () => {
  navigateTo("/");
};
</script>
<style lang="css">
.steps-container {
  max-width: 900px;
  padding-top: 16px;
}
</style>
