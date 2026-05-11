<template>
  <v-card :title="$t('other_user_skills_level')">
    <v-card-text>
      <v-data-table-server
        :headers="headers"
        :items="items"
        item-key="id"
        :loading="loading"
        :items-length="count"
        @update:page="getUserSkills({ page: $event, itemsPerPage: 10 })"
        @update:items-per-page="
          getUserSkills({ page: 1, itemsPerPage: $event })
        "
      >
        <template v-slot:loading>
          <v-skeleton-loader type="table-tbody"></v-skeleton-loader>
        </template>

        <template v-slot:item.display_name="{ item }">
          <v-menu transition="scale-transition">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" variant="text">
                {{ item.display_name ?? "..." }}
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                :to="`/users/${item.user_id}/skills`"
                prepend-icon="mdi-table"
                :title="$t('user_proficiency.view_skill_list')"
              />
              <v-list-item
                :to="`/users/${item.user_id}`"
                prepend-icon="mdi-graph"
                :title="$t('user_proficiency.view_skill_graph')"
              />
            </v-list>
          </v-menu>
        </template>

        <template v-slot:item.proficiency_level="{ item }">
          <div v-if="!item.proficiency_levels?.length">
            {{ $t("proficiency.no_levels") }}
          </div>
          <div v-else class="px-10">
            <v-progress-linear
              :color="levelColor(item.proficiency_levels[0].level)"
              :model-value="item.proficiency_levels[0].level"
              striped
              height="10"
            />
          </div>
        </template>
      </v-data-table-server>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";

const { t } = useLocale();
const { user_id } = useAuthIdentifier();
const route = useRoute();
const { fetchUsers } = useUserLookup();

const props = defineProps<{
  propItems: any[];
  propCount?: number;
}>();

const loading = ref(false);
const items = ref<any[]>(props.propItems);
const count = ref(props.propCount ?? 0);

const headers = computed(
  () =>
    [
      { title: t("user"), value: "display_name", align: "end", width: "30%" },
      {
        title: t("proficiency_level"),
        value: "proficiency_level",
        align: "center",
        width: "70%",
      },
    ] as const,
);

const levelColor = (level: number) => {
  if (level < 25) return "error";
  else if (level < 50) return "orange";
  else if (level < 75) return "teal";
  else if (level >= 75) return "success";
};

const getUserSkills = async ({ page, itemsPerPage }) => {
  loading.value = true;

  try {
    const response = await $fetch(
      `/api/skills/${route.params.id}/userSkills?page=${page}&take=${itemsPerPage}&notUser=${user_id.value}`,
    );

    items.value = response.items;
    count.value = response.count;

    await enrichUserDisplayNames();
  } catch (err) {
    console.error(err);
    loading.value = false;
  }
};

const enrichUserDisplayNames = async () => {
  const rows = items.value ?? [];
  const ids = rows.map((r: any) => String(r.user_id));

  if (ids.length === 0) return;

  const normalized = await fetchUsers(ids);
  const userMap = Object.fromEntries(
    normalized.map((u) => [u.user_id, u.display_name]),
  );

  items.value = rows.map((row) => ({
    ...row,
    display_name: userMap[row.user_id] || row.user_id,
  }));

  loading.value = false;
};
</script>
