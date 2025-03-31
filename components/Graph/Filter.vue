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
            <v-radio-group v-model="recommended" row>
              <v-radio label="Not Set" :value="-1"></v-radio>
              <v-radio label="Recommended" :value="true"></v-radio>
              <v-radio label="Not Recommended" :value="false"></v-radio>
            </v-radio-group>
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
const recommended = ref(-1);

const resetDisable = computed(
  () => selected.value === -1 && recommended.value === -1
);

onMounted(() => {
  const nuxtApp = useNuxtApp();
  if (nuxtApp.isHydrating) return;
  getSkillCategories();
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
  router.push({
    name: route.name,
    query: { filter: selected.value, recommended: recommended.value },
  });
  menu.value = false;
};

const reset = () => {
  selected.value = -1;
  recommended.value = -1;
};
</script>
