<template>
  <div>
    <v-dialog max-width="500" v-model="menu">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="{ ...buttonProps, ...props }" @click="menu = true" />
      </template>

      <div class="text-center">
        <v-card>
          <v-card-title>{{ $t("graph.compare_title") }}</v-card-title>
          <v-card-text>
            <v-select
              v-model="compareTo"
              item-title="name"
              :items="items"
              :label="$t('common.select_item')"
              item-value="id"
            >
              <template v-slot:selection="{ item }">
                <v-chip>
                  <span>{{ item.name }}</span>
                </v-chip>
              </template>
            </v-select>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn variant="text" @click="reset()" :disabled="resetDisable">
              {{ $t("common.reset") }}
            </v-btn>
            <v-btn color="primary" variant="text" @click="doCompare()">
              {{ $t("graph.compare") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </v-dialog>
  </div>
</template>
<script lang="ts" setup>
import { useLocale } from "vuetify";

const route = useRoute();
const router = useRouter();
const { user_id: loggedInUserId } = useAuthIdentifier();

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
  },
);
const { t } = useLocale();
const items = ref([
  {
    name: t("graph.compare_all"),
    id: "all",
  },
]);
const compareTo = ref("all");

const resetDisable = computed(() => compareTo.value !== "all");

onMounted(() => {
  const { user_id } = route.params;
  if (loggedInUserId.value && user_id && loggedInUserId.value !== user_id) {
    items.value.push({
      name: t("graph.your_skills"),
      id: loggedInUserId.value || "",
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
    const user_id = route.params.user_id ?? loggedInUserId.value;
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
