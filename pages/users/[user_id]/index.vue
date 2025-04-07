<template>
  <template v-if="loading"> <GraphLoader /> </template>
  <SkillGraph
    :nodes="skills"
    @skill-added="getSkills"
    :loading="loading"
    :users="users"
  />
</template>

<script setup lang="ts">
const loading = ref(false);
const route = useRoute();
const skills = ref<any>();
const users = ref<any>(undefined);
const config = useRuntimeConfig();

onMounted(() => {
  getSkills();
  getUserData();
});

const getSkills = async () => {
  const { user_id } = route.params;
  let queryStr = "";
  if (route.query)
    queryStr = new URLSearchParams(
      route.query as Record<string, string>
    ).toString();

  let url = `/api/users/${user_id}/skills/graph`;

  loading.value = true;
  await useFetchApi(`${url}?${queryStr}`)
    .then((response: any) => {
      if (response.items.length > 0) skills.value = response.items;
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      loading.value = false;
    });
};

const getUserData = async () => {
  if (!config.public.userManagerApiUrl) return;
  const { user_id } = route.params;
  const { compareTo } = route.query;
  let user_ids = [user_id];

  if (compareTo !== undefined && compareTo !== "all") {
    user_ids.push(compareTo as string);
  }
  await useFetchApi(`${config.public.userManagerApiUrl}/v3/users`, {
    params: { username: user_ids },
  })
    .then((response: any) => {
      users.value = response.users;
    })
    .catch((error) => {
      console.log(error);
    });
};

watch(
  () => route.query, // Watch only the query part of the route
  () => {
    getSkills();
    getUserData();
  },
  { deep: true } // Enables deep watching for reactive objects like `query`
);
</script>
