<template>
  <template v-if="loading"> <GraphLoader /> </template>
  <SkillGraph :nodes="skills" @skill-added="getSkills" :loading="loading" />
</template>

<script setup lang="ts">
const loading = ref(false);
const route = useRoute();
const skills = ref<any>();

onMounted(() => {
  getSkills();
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
  () => route.query,
  () => getSkills(),
  { deep: true }
);
</script>
