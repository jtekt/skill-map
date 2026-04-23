<template>
  <v-data-table-server
    :headers="headers"
    :items="skills"
    item-key="id"
    :search="search"
    :loading="loading"
    :style="tableStyle"
    :items-length="count"
    @update:options="getSkills"
  >
    <template v-slot:top>
      <v-text-field prepend-inner-icon="mdi-magnify" v-model="search" />
    </template>
    <template v-slot:loading>
      <v-skeleton-loader type="table-tbody"></v-skeleton-loader>
    </template>
    <template v-slot:item.name="{ item }">
      <v-hover>
        <template v-slot:default="{ isHovering, props }">
          <span
            v-bind="props"
            @click="navigateTo(`/skills/${item.id}`)"
            style="cursor: pointer"
            :class="isHovering ? 'text-primary' : undefined"
          >
            {{ item.name }}
          </span>
        </template>
      </v-hover>
    </template>
    <template v-slot:item.image="{ item }">
      <v-img
        width="3em"
        height="3em"
        :src="item.image || '/icons/school.png'"
        @click="navigateTo(`/skills/${item.id}`)"
        style="cursor: pointer"
      />
    </template>
    <template v-slot:item.add="{ item }">
      <v-btn icon="mdi-plus" @click="handleAddClicked(item)" variant="flat" />
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";

const emit = defineEmits(["add", "relationshipDeleted", "loadPage"]);

const props = defineProps<{
  add?: boolean;
  tableStyle?: any;
}>();
const skills = ref<any[]>([]);
const search = ref("");
const loading = ref(false);
const count = ref(0);

const { t } = useLocale();
const headers = computed(() => {
  let defaultList = [
    { title: "", value: "see" },
    { title: t("skill_table.logo"), value: "image" },
    { title: t("skill_table.name"), value: "name" },
  ];

  if (props.add) {
    defaultList.push({ title: t("skill_table.add"), value: "add" });
  }

  return defaultList;
});
const handleAddClicked = async (item: any) => {
  emit("add", item);
};

onMounted(() => {
  getSkills({ page: 1, itemsPerPage: 10 });
});

const getSkills = async (event: any) => {
  $fetch(
    `/api/skills?page=${event.page}&take=${event.itemsPerPage}&skills=${search.value}`,
  )
    .then((response: any) => {
      skills.value = response.items;
      count.value = response.count;
    })
    .catch((error) => {
      console.log(error);
    });
};
</script>
