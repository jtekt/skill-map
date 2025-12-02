<template>
  <div>
    <v-dialog max-width="500" v-model="menu">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="{ ...buttonProps, ...props }" @click="menu = true" />
      </template>

      <div class="text-center">
        <v-card>
          <v-card-title>Compare Your Skills To:</v-card-title>
          <v-card-text>
            <v-select
              v-model="compareTo"
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
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn variant="text" @click="reset()" :disabled="resetDisable">
              Reset
            </v-btn>
            <v-btn color="primary" variant="text" @click="doCompare()">
              Compare
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
const { loggedInUser } = useUser();
const menu = ref(false);
withDefaults(
  defineProps<{
    buttonProps?: any;
  }>(),
  {
    buttonProps: () => ({
      size: "small",
      icon: "mdi-chart-scatter-plot-hexbin",
      color: "",
    }),
  }
);
const items = ref([
  {
    name: "ALL",
    id: "all",
  },
]);
const compareTo = ref("all");

const resetDisable = computed(() => compareTo.value !== "all");

onMounted(() => {
  const { user_id } = route.params;
  if (
    loggedInUser.value &&
    user_id &&
    loggedInUser.value.username !== user_id
  ) {
    items.value.push({
      name: "Your skills",
      id: loggedInUser.value.username,
    });
  }
  const { compareTo: ct } = route.query;
  if (ct) compareTo.value = ct as any;
});

const doCompare = () => {
  if (compareTo.value === "")
    router.push({
      name: route.name,
    });
  else {
    const user_id = route.params.user_id ?? loggedInUser.value.username;
    router.push({
      path: `/users/${user_id}`,
      query: { compareTo: compareTo.value },
    });
  }
  menu.value = false;
};

const reset = () => {
  compareTo.value = "";
};
</script>
