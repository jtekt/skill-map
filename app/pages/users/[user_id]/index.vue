<template>
  <template v-if="loading">
    <GraphLoader />
  </template>

  <SkillGraph
    :nodes="skills"
    @skill-added="refresh"
    :loading="loading"
    :users="users"
  />
</template>

<script setup lang="ts">
const { session } = useUserSession();
const route = useRoute();
const config = useRuntimeConfig();
const queryParams = computed(() => ({ ...route.query }));
const skills = computed(() => data.value?.items ?? []);
const user_id = computed(() => route.params.user_id as string);
const compareTo = computed(() => route.query.compareTo);

const {
  data,
  pending: loading,
  refresh,
} = useFetch(() => `/api/users/${route.params.user_id}/skills/graph`, {
  query: queryParams,
  watch: [queryParams],
  immediate: true,
});

const user_ids = computed(() => {
  const ids = [user_id.value];
  if (compareTo.value && compareTo.value !== "all") {
    ids.push(compareTo.value as string);
  }
  return ids;
});

const { data: users } = useFetch(
  () => `${config.public.userManagerApiUrl}/v3/users`,
  {
    params: {
      username: user_ids,
    },
    headers: {
      Authorization: `Bearer ${session.value?.tokens?.access_token || ""}`,
    },
    watch: [user_ids],
    transform: (response: any) => response.users,
    immediate: true,
  },
);
</script>
