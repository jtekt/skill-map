<template>
  <div>
    <v-dialog max-width="500" v-model="menu">
      <template v-slot:activator="{ props }">
        <v-btn
          icon="mdi-filter-menu-outline"
          v-bind="props"
          @click="menu = true"
        />
      </template>

      <div class="text-center">
        <v-card>
          <v-card-title>Filter</v-card-title>
          <v-card-text>
            <v-select
              v-model="selected"
              item-title="name"
              :items="items"
              label="Select Item"
              item-value="id"
            >
              <template v-slot:selection="{ item }">
                <v-chip>
                  <span>{{ item.title }}</span>
                </v-chip>
              </template>
            </v-select>
            <v-switch
              v-model="recommended"
              label="Show only recommended"
              hide-details
              inset
              color="primary"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn variant="text" @click="reset()" :disabled="resetDisable">
              Reset
            </v-btn>
            <v-btn color="primary" variant="text" @click="updateFilter()">
              Filter
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </v-dialog>
  </div>
</template>
<script lang="ts" setup>
const route = useRoute();
const router = useRouter();
const menu = ref(false);

const items = ref();
const selected = ref(-1);
const recommended = ref(false);

const resetDisable = computed(
  () => selected.value === -1 && !recommended.value
);

onMounted(() => {
  getSkillCategories();
  const { filter, recommended: qRec } = route.query;
  if (filter) selected.value = filter as any;
  if (qRec) recommended.value = JSON.parse(qRec as any) ?? false;
});
const getSkillCategories = async () => {
  const url = "/api/skills/categories";
  await useFetchApi(url)
    .then((response: any) => {
      items.value = [{ id: -1, name: "All" }, ...response.items];
    })
    .catch((error) => {
      console.log(error);
    });
};

const updateFilter = () => {
  let query = {};
  const { compareTo } = route.query;
  if (selected.value !== -1) query = { ...query, filter: selected.value };
  if (recommended.value) query = { ...query, recommended: recommended.value };
  if (compareTo) query = { ...query, compareTo };
  router.push({
    name: route.name,
    query,
  });
  menu.value = false;
};

const reset = () => {
  selected.value = -1;
  recommended.value = false;
};
</script>
