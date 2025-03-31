<template>
  <template v-if="loading"> <GraphLoader /> </template>
  <SkillGraph :nodes="skills" @skill-added="getSkills" :loading="loading" />
</template>

<script setup lang="ts">
const { useAuthUser } = useAuth();
const loading = ref(false);
const route = useRoute();
const skills = ref<any>();

onMounted(() => {
  if (useAuthUser().value) getSkills();
});

const getSkills = async () => {
  let queryStr = "";
  if (route.query)
    queryStr = new URLSearchParams(
      route.query as Record<string, string>
    ).toString();

  let url = "/api/skills/graph";

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

watch(
  () => route.query, // Watch only the query part of the route
  () => getSkills(),
  { deep: true } // Enables deep watching for reactive objects like `query`
);

watch(
  () => useAuthUser().value,
  () => getSkills()
);
</script>
