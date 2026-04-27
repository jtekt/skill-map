<template>
  <v-empty-state
    image="https://cdni.iconscout.com/illustration/premium/thumb/find-folder-4816549-4004140.png"
    size="200"
    class="w-100"
    align="center"
    justify="center"
    :headline="$t('empty_state.title')"
  >
    <template v-slot:title v-if="!loading">
      <div class="text-body-1">
        {{
          $t(
            route.params.user_id
              ? "empty_state.content_user"
              : "empty_state.content",
          )
        }}
      </div>
      <v-container v-if="route.params.user_id">
        <v-row align="center">
          <v-col cols="4" sm="3">
            <v-img src="/empty/step-1.png" />
          </v-col>
          <v-icon icon="mdi-arrow-right-bold-outline" />

          <v-col cols="4" sm="3">
            <v-img src="/empty/step-2.png" />
          </v-col>
          <v-icon icon="mdi-arrow-right-bold-outline" />

          <v-col cols="4" sm="3">
            <v-img src="/empty/step-3.png" />
          </v-col>
        </v-row>
      </v-container>
    </template>

    <template v-slot:actions v-if="!loading">
      <div v-if="!route.params.user_id">
        <v-tooltip :text="$t('add_new_skill')" location="right">
          <template v-slot:activator="{ props }">
            <SkillForm
              v-bind="props"
              :dialog-data="{
                icon: 'mdi-notebook-plus-outline',
                title: $t('add_new_skill'),
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
</script>
