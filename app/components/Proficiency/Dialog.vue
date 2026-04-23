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
            :proficiency-levels="data?.items || []"
            :user-skill-id="id"
            @updated-proficiency="emit('updated-proficiency', $event)"
            :allow-changes="allowChanges"
            :elevation="0"
            :total-lvl-count="data?.count || 0"
          />
        </template>
        <template v-else>
          <v-skeleton-loader class="mx-auto" type="table" boilerplate />
        </template>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="show = false">{{ $t('common.close') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["updated-proficiency"]);
const show = ref(false);
const props = defineProps<{
  id: number;
  allowChanges: boolean;
}>();

const { data, pending: loading } = useFetch(
  () => `/api/userSkills/${props.id}/proficiency?page=1&take=10`,
  {
    watch: [() => show],
    immediate: true,
    deep: true,
  },
);
</script>
