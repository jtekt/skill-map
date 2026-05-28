<template>
  <v-data-table-server
    :headers="headers"
    :items="skills"
    item-key="id"
    :search="effectiveSearch"
    :loading="loading"
    :style="tableStyle"
    :items-length="count"
    @update:options="getSkills"
  >
    <template v-slot:top>
      <v-text-field
        v-if="showInternalSearch"
        prepend-inner-icon="mdi-magnify"
        v-model="effectiveSearch"
        :placeholder="$t('common.search_skills')"
        hide-details
      />
    </template>
    <template v-slot:loading>
      <v-skeleton-loader type="table-tbody" />
    </template>

    <template v-slot:item.name="{ item }">
      <v-hover>
        <template #default="{ isHovering, props }">
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

const props = defineProps<{
  add?: boolean;
  tableStyle?: any;
  showSearch?: boolean;
}>();

const modelSearch = defineModel<string>("search", { default: null });
const localSearch = ref("");
const showInternalSearch = computed(
  () => (props.showSearch ?? true) && modelSearch.value === null,
);

const effectiveSearch = computed({
  get: () =>
    modelSearch.value !== null ? modelSearch.value : localSearch.value,
  set: (val) => {
    if (modelSearch.value !== null) modelSearch.value = val;
    else localSearch.value = val;
  },
});

const emit = defineEmits(["add"]);

const skills = ref<any[]>([]);
const loading = ref(false);
const count = ref(0);
const { t } = useLocale();
const headers = computed(() => {
  const base = [
    { title: "", value: "see" },
    { title: t("skill_table.logo"), value: "image" },
    { title: t("skill_table.name"), value: "name" },
  ];
  if (props.add) base.push({ title: t("skill_table.add"), value: "add" });
  return base;
});

const handleAddClicked = (item: any) => emit("add", item);

onMounted(() => {
  getSkills({ page: 1, itemsPerPage: 10 });
});

const getSkills = async (event: any) => {
  loading.value = true;

  const q = encodeURIComponent(effectiveSearch.value || "");

  $fetch(
    `/api/skills?page=${event.page}&take=${event.itemsPerPage}&skills=${q}`,
  )
    .then((res: any) => {
      skills.value = res.items;
      count.value = res.count;
    })
    .catch(console.error)
    .finally(() => (loading.value = false));
};
</script>
