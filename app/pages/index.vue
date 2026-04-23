<template>
  <template v-if="pending"> <GraphLoader /> </template>
  <SkillGraph :nodes="skills" @skill-added="refresh" :loading="pending" />
</template>

<script setup lang="ts">
const route = useRoute();

// Make query reactive
const queryParams = computed(() => ({ ...route.query }));

const { data, pending, refresh } = useFetch("/api/skills/graph", {
  query: queryParams,
  watch: [queryParams],
  immediate: true,
  deep: true,
});

const skills = computed(() => data.value?.items ?? []);
</script>
