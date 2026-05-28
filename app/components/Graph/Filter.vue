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
          <v-card-title>{{ $t('graph.filter') }}</v-card-title>
          <v-card-text>
            <v-select
              v-model="selected"
              :items="items"
              item-title="name"
              item-value="id"
              :label="$t('common.select_item')"
            >
              <template #selection="{ item }">
                <v-chip>
                  <span>{{ item.name }}</span>
                </v-chip>
              </template>
            </v-select>

            <v-switch
              v-model="recommended"
              :label="$t('graph.show_recommended')"
              hide-details
              inset
              color="primary"
            />
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn variant="text" @click="reset" :disabled="resetDisable">
              {{ $t('common.reset') }}
            </v-btn>

            <v-btn color="primary" variant="text" @click="updateFilter">
              {{ $t('graph.filter') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";

const route = useRoute();
const router = useRouter();
const { t } = useLocale();

const menu = ref(false);

const { data } = useFetch("/api/skills/categories", {
  transform: (res: any) => res.items,
  immediate: true,
  deep: true,
});

const items = computed(() => [
  { id: -1, name: t("graph.filter_all") },
  ...(data.value ?? []),
]);
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
