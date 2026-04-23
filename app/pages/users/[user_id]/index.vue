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
const route = useRoute();
const { fetchUsers } = useUserLookup();
const queryParams = computed(() => ({ ...route.query }));
const skills = computed(() => data.value?.items ?? []);
const user_id = computed(() => String(route.params.user_id));
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

const user_ids = computed<string[]>(() => {
  const ids: string[] = [];

  if (user_id.value) ids.push(String(user_id.value));
  if (compareTo.value && compareTo.value !== "all") {
    ids.push(String(compareTo.value));
  }

  return ids.filter(Boolean);
});

const rawUsers = ref<{ user_id: string; display_name: string }[]>([]);
const loadingUsers = ref(false);

const loadUsers = async () => {
  loadingUsers.value = true;
  rawUsers.value = await fetchUsers(user_ids.value);
  loadingUsers.value = false;
};

watch([user_ids], loadUsers, { immediate: true });

const users = computed(() => rawUsers.value);
</script>
