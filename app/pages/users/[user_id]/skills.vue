<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="d-flex align-center pe-2">
        <v-icon icon="mdi-lightbulb-on-20" /> &nbsp; {{ pageTitle }}
        <v-spacer></v-spacer>
        <div class="pe-4">
          <v-row justify="end">
            <v-col>
              <v-tooltip :text="$t('display_as_graph')" location="top">
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
              <v-tooltip :text="$t('graph.compare_skills')" location="top">
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
          :label="$t('search')"
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
                  <div
                    v-if="item.user_skill[0].proficiency_levels.length === 0"
                  >
                    {{ $t("proficiency.no_levels") }}
                  </div>
                  <div v-else>
                    <v-progress-linear
                      :color="
                        levelColor(
                          item.user_skill[0].proficiency_levels[0].level,
                        )
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
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useLocale } from "vuetify";
import { useAuthIdentifier } from "~/composables/useAuthIdentifier";
import { useToast, useConfirm } from "@jtekt/vue-feedback-kit";
const toast = useToast();

const confirm = useConfirm();
const route = useRoute();
const { t } = useLocale();
const { user_id } = useAuthIdentifier();

const search = ref("");
const pagination = ref({ page: 1, itemsPerPage: 10 });
const query = computed(() => ({
  page: pagination.value.page,
  take: pagination.value.itemsPerPage,
  skills: search.value,
}));

const allowChanges = computed(
  () => user_id.value && user_id.value === route.params.user_id,
);

const skills = computed(() => skillsData.value?.items ?? []);
const count = computed(() => skillsData.value?.count ?? 0);

const rawUser = ref<{ user_id: string; display_name: string } | null>(null);
const userId = computed(() => String(route.params.user_id));
const path = computed(() => `/users/${userId.value}`);

const { fetchUsers } = useUserLookup();

const {
  data: skillsData,
  pending: loading,
  refresh: refreshSkills,
} = useFetch(() => `/api/users/${userId.value}/skills`, {
  query,
  watch: [pagination, search, userId],
  immediate: true,
  deep: true,
});

const loadUserInfo = async () => {
  const result = await fetchUsers([userId.value]);
  rawUser.value = result[0] ?? {
    user_id: userId.value,
    display_name: userId.value,
  };
};

watch(userId, loadUserInfo, { immediate: true });

const pageTitle = computed(() => {
  if (!rawUser.value && !user_id.value) return t("user");

  if (rawUser.value?.user_id === user_id.value) {
    return t("my_skills");
  }

  return t("user_name_skills", rawUser.value?.display_name ?? "");
});

const removeFromSkillList = async (item) => {
  const ok = await confirm(t("confirmation.remove_from_user_skill"), {
    color: "error",
  });

  if (!ok) return;
  try {
    await $fetch(`/api/userSkills/${item.user_skill[0].id}`, {
      method: "DELETE",
    });

    toast.success(t("success_msg.removed_from_my_list"));
    refreshSkills();
  } catch (error: any) {
    toast.error(error.message || t("error.removing_skill"));
  }
};

const updatedProficiency = (index: number, data: any) => {
  if (data) {
    skills.value[index].user_skill[0].proficiency_levels[0] = data;
  } else {
    skills.value[index].user_skill[0].proficiency_levels = [];
  }
};

const levelColor = (level: number) => {
  if (level < 25) return "error";
  if (level < 50) return "orange";
  if (level < 75) return "teal";
  return "success";
};

const headers = computed(() => {
  const list: any = [
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
