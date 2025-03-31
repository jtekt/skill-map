<template>
  <div>
    <v-dialog v-model="show" max-width="700" persistent>
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn
          size="small"
          variant="text"
          icon="mdi-information"
          v-bind="activatorProps"
        />
      </template>

      <v-card>
        <template v-if="!loading">
          <ProficiencyCard
            :proficiency-levels="proficiencyLevels"
            :user-skill-id="id"
            @updated-proficiency="emit('updated-proficiency', $event)"
            :allow-changes="allowChanges"
            :elevation="0"
            :total-lvl-count="count"
          />
        </template>
        <template v-else>
          <v-skeleton-loader class="mx-auto" type="table" boilerplate />
        </template>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="show = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["updated-proficiency"]);
const show = ref(false);
const loading = ref(false);
const count = ref(0);
const proficiencyLevels = ref<any[]>([]);
const props = defineProps<{
  id: number;
  allowChanges: boolean;
}>();

// Fetch only when show is true
watch(
  () => show.value,
  (newVal, _) => {
    if (newVal) getProficiencyLvls();
  }
);

const getProficiencyLvls = async () => {
  const url = `/api/userSkills/${props.id}/proficiency?page=1&take=10`;
  loading.value = true;
  await useFetchApi(url)
    .then((response: any) => {
      proficiencyLevels.value = response.items;
      count.value = response.count;
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      loading.value = false;
    });
};
</script>
