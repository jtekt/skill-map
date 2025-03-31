<template>
  <template v-if="loading"> <GraphLoader /> </template>
  <SkillGraph
    :nodes="skills"
    @skill-added="getSkills"
    :loading="loading"
    :user="user"
  />
</template>

<script setup lang="ts">
const { useAuthUser } = useAuth();
const loading = ref(false);
const route = useRoute();
const skills = ref<any>();
const user = ref<any>();

onMounted(() => {
  if (useAuthUser().value) {
    getSkills();
    getUserData();
  }
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
  const config = useRuntimeConfig();
  if (!config.public.userManagerApiUrl) return;
  const { user_id } = route.params;

  await useFetchApi(`${config.public.userManagerApiUrl}/v3/users`, {
    params: { username: user_id },
  })
    .then((response: any) => {
      user.value = response.users[0];
    })
    .catch((error) => {
      console.log(error);
    });
};

watch(
  () => route.query, // Watch only the query part of the route
  () => {
    getSkills();
  },
  { deep: true } // Enables deep watching for reactive objects like `query`
);

watch(
  () => useAuthUser().value,
  () => {
    getSkills();
    getUserData();
  }
);
</script>
