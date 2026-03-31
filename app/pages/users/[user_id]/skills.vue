<template>
  <v-card>
    <v-card-title class="d-flex align-center pe-2">
      <v-icon icon="mdi-lightbulb-on-20" /> &nbsp; {{ pageTitle }}
      <v-spacer></v-spacer>
      <div class="pe-4">
        <v-row justify="end">
          <v-col>
            <v-tooltip text="Display as Graph" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  :to="path"
                  size="x-small"
                  icon="mdi-graph"
                  color="primary"
                  v-bind="props"
                />
              </template>
            </v-tooltip>
          </v-col>
          <v-col>
            <v-tooltip text="Compare Skills" location="top">
              <template v-slot:activator="{ props }">
                <GraphCompare
                  key="1"
                  v-bind="props"
                  :button-props="{
                    size: 'x-small',
                    icon: 'mdi-chart-scatter-plot-hexbin',
                    color: 'primary',
                  }"
                />
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
      </div>
      <v-text-field
        prepend-inner-icon="mdi-magnify"
        v-model="search"
        flat
        hide-details
        single-line
        variant="solo-filled"
        density="compact"
        label="Search"
      />
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-data-table-server
        :headers="headers"
        :items="skills"
        item-key="name"
        :search="search"
        :loading="loading"
        hide-default-header
        :items-length="count"
        @update:options="updateOptions"
      >
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
        <template v-slot:item.proficiency_level="{ item, index }">
          <v-row no-gutters>
            <v-col cols="10">
              <div class="pt-4">
                <div v-if="item.user_skill[0].proficiency_levels.length === 0">
                  No Levels added yet
                </div>
                <div v-else>
                  <v-progress-linear
                    :color="
                      levelColor(item.user_skill[0].proficiency_levels[0].level)
                    "
                    :model-value="
                      item.user_skill[0].proficiency_levels[0].level
                    "
                    striped
                    height="10"
                  />
                </div>
              </div>
            </v-col>
            <v-col cols="2">
              <ProficiencyDialog
                :id="item.user_skill[0].id"
                @updated-proficiency="updatedProficiency(index, $event)"
                :allow-changes="allowChanges ?? false"
              />
            </v-col>
          </v-row>
        </template>
        <template v-slot:item.remove="{ item }">
          <v-btn
            icon="mdi-close"
            @click="removeFromSkillList(item)"
            variant="flat"
          />
        </template>
      </v-data-table-server>
    </v-card-text>

    <v-snackbar v-model="snackbar.display" :color="snackbar.color">
      {{ snackbar.text }}

      <template v-slot:actions>
        <v-btn @click="snackbar.display = false" icon="mdi-close" />
      </template>
    </v-snackbar>
  </v-card>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";

const config = useRuntimeConfig();
const route = useRoute();
const { t } = useLocale();
const { user: loggedInUser } = useOidcAuth();

const search = ref("");
const pagination = ref({ page: 1, itemsPerPage: 10 });

const snackbar = ref({
  display: false,
  text: "",
  color: "primary",
});

const allowChanges = computed(
  () =>
    loggedInUser.value &&
    loggedInUser.value.userInfo.preferred_username === route.params.user_id,
);

const userId = computed(() => route.params.user_id);
const path = computed(() => `/users/${userId.value}`);
const {
  data: skillsData,
  pending: loading,
  refresh: refreshSkills,
} = useFetch(() => `/api/users/${userId.value}/skills`, {
  query: () => ({
    page: pagination.value.page,
    take: pagination.value.itemsPerPage,
    skills: search.value,
  }),
  watch: [pagination, search, userId],
  immediate: true,
  deep: true,
});

const skills = computed(() => skillsData.value?.items ?? []);
const count = computed(() => skillsData.value?.count ?? 0);

const { data: user } = useFetch<Record<string, any>>(
  () => `${config.public.userManagerApiUrl}/v3/employees/${userId.value}`,
  {
    headers: {
      Authorization: `Bearer ${loggedInUser.value?.accessToken}`,
    },
    immediate: true,
    watch: [userId],
  },
);

const removeFromSkillList = async (item) => {
  if (!confirm(t("confirmation.remove_from_user_skill"))) return;

  await $fetch(`/api/userSkills/${item.user_skill[0].id}`, {
    method: "DELETE",
  })
    .then(() => {
      snackbar.value = {
        text: t("success_msg.removed_from_my_list"),
        color: "success",
        display: true,
      };
      refreshSkills(); // update list
    })
    .catch((error) => {
      snackbar.value = { text: error, color: "error", display: true };
    })
    .finally(() => {
      setTimeout(() => (snackbar.value.display = false), 5000);
    });
};

const updatedProficiency = (index: number, data: any) => {
  if (data) skills.value[index].user_skill[0].proficiency_levels[0] = data;
  else skills.value[index].user_skill[0].proficiency_levels = [];
};

const pageTitle = computed(() => {
  if (!user.value && !loggedInUser.value) return t("user");

  if (
    user.value?.preferred_username ===
    loggedInUser.value?.userInfo.preferred_username
  ) {
    return t("my_skills");
  }

  return t("user_name_skills", user.value?.display_name ?? "");
});

// Color helper
const levelColor = (level: number) => {
  if (level < 25) return "error";
  if (level < 50) return "orange";
  if (level < 75) return "teal";
  return "success";
};

const headers = computed(() => {
  let list: any = [
    {
      title: t("skills"),
      value: "skills",
      align: "center",
      children: [
        { title: t("skill_table.logo"), value: "image", width: "5%" },
        {
          title: t("skill_table.name"),
          value: "name",
          width: "10%",
          align: "center",
        },
      ],
    },
    {
      title: t("proficiency_level"),
      value: "proficiency_level",
      width: "20%",
      align: "center",
    },
  ];

  if (allowChanges.value) {
    list.push({
      title: t("skill_table.remove"),
      value: "remove",
      align: "center",
      width: "10%",
    });
  }

  return list;
});

const updateOptions = (event) => {
  pagination.value = event;
};
</script>
