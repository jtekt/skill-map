<template>
  <div>
    <v-dialog max-width="500" v-model="menu">
      <template #activator="{ props }">
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
              :items="items"
              item-title="name"
              item-value="id"
              label="Select Item"
            >
              <template #selection="{ item }">
                <v-chip>
                  <span>{{ item.name }}</span>
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

            <v-btn variant="text" @click="reset" :disabled="resetDisable">
              Reset
            </v-btn>

            <v-btn color="primary" variant="text" @click="updateFilter">
              Filter
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const menu = ref(false);

const { data } = useFetch("/api/skills/categories", {
  transform: (res: any) => {
    return [{ id: -1, name: "All" }, ...res.items];
  },
  immediate: true,
  deep: true,
});

const items = computed(() => data.value ?? []);
const selected = ref(-1);
const recommended = ref(false);

const resetDisable = computed(() => {
  return selected.value === -1 && !recommended.value;
});

watchEffect(() => {
  if (route.query.filter) {
    selected.value = Number(route.query.filter);
  }

  if (route.query.recommended) {
    recommended.value = route.query.recommended === "true";
  }
});

const updateFilter = () => {
  const query: any = {};

  if (selected.value !== -1) query.filter = selected.value;
  if (recommended.value) query.recommended = true;
  if (route.query.compareTo) query.compareTo = route.query.compareTo;

  router.push({
    name: route.name?.toString(),
    query,
  });

  menu.value = false;
};

const reset = () => {
  selected.value = -1;
  recommended.value = false;
};
</script>
