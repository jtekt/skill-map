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
                title="View Skill List"
              />
              <v-list-item
                :to="`/users/${item.user_id}`"
                prepend-icon="mdi-graph"
                title="View Skill Graph"
              />
            </v-list>
          </v-menu>
        </template>
        <template v-slot:item.proficiency_level="{ item }">
          <div v-if="item.proficiency_levels.length === 0">
            No Level added yet
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

const { loggedInUser } = useUser();
const config = useRuntimeConfig();
const route = useRoute();
const { t } = useLocale();

const props = defineProps<{
  propItems: any[];
  propCount?: number;
}>();
const loading = ref(false);
const items = ref<any[]>(props.propItems);
const count = ref(props.propCount ?? 0);

const headers = ref<any[]>([
  { title: "User", value: "display_name", align: "end", width: "30%" },
  {
    title: "Proficiency",
    value: "proficiency_level",
    align: "center",
    width: "70%",
  },
]);

const levelColor = (level: number) => {
  if (level < 25) return "error";
  else if (level < 50) return "orange";
  else if (level < 75) return "teal";
  else if (level >= 75) return "success";
};

const getUserSkills = async ({ page, itemsPerPage }) => {
  const url = `/api/skills/${route.params.id}/userSkills?page=${page}&take=${itemsPerPage}&notUser=${loggedInUser.value.username}`;
  loading.value = true;
  await useFetchApi(url)
    .then((response: any) => {
      items.value = response.items;
      count.value = response.count;
      getUsersProficiencyLvl();
    })
    .catch((error) => {
      console.log(error);
      loading.value = false;
    });
};

const getUsersProficiencyLvl = async () => {
  if (!config.public.userManagerApiUrl) return;
  const user_ids = items.value.map(({ user_id }) => user_id);
  if (user_ids.length === 0) return;

  await useFetchApi(`${config.public.userManagerApiUrl}/v3/users`, {
    params: { username: user_ids },
  })
    .then((response: any) => {
      items.value = response.users.map((user: any) => ({
        display_name: user.display_name,
        ...items.value.find(({ user_id }) => user_id === user.username),
      }));
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => (loading.value = false));
};
</script>
