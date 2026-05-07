<template>
  <v-container fluid>
    <template v-if="skill">
      <SkillInfoCard
        v-model:skill="skill"
        class="pa-4 mb-4"
        @delete-skill="doDelete"
        @update:skill="doUpdate"
      />

      <v-card class="pa-2 mb-4">
        <!-- Header -->
        <v-card-title class="d-flex align-center">
          {{ $t("skill_info.relationship") }}
        </v-card-title>

        <!-- Content -->
        <v-card-text>
          <!-- Loading -->
          <template v-if="loading">
            <v-skeleton-loader
              class="mx-auto"
              type="table-heading, list-item-two-line, image, table-tfoot, table"
            />
          </template>

          <!-- Main Content -->
          <v-row>
            <!-- Parents -->
            <v-col>
              <RelationshipTable
                :title="$t('skill_info.parents')"
                :items="
                  skill.parents.map((r) => ({
                    ...r.target_skill,
                    relationId: r.id,
                  }))
                "
                :total-item-count="skill._count.parents"
                :tooltip="$t('skill_info.add_new_parent')"
                :child-id="skill.id"
                table-style="max-height: 500px;"
              />
            </v-col>
            <v-col>
              <RelationshipTable
                :title="$t('skill_info.children')"
                :items="
                  skill.children.map((r) => ({
                    ...r.source_skill,
                    relationId: r.id,
                  }))
                "
                :total-item-count="skill._count.children"
                :tooltip="$t('skill_info.add_new_child')"
                :parent-id="skill.id"
                table-style="max-height: 500px;"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Proficiency -->
      <v-card class="mb-4">
        <v-card-title class="d-flex align-center">
          {{ $t("skill_info.user_profeciency_title") }}

          <v-spacer></v-spacer>

          <v-tooltip
            :text="
              skill.skill_added
                ? $t('skill_info.remove_from_skill')
                : $t('skill_info.add_to_skill')
            "
            location="top"
          >
            <template v-slot:activator="{ props }">
              <v-btn
                :loading="addingSkill"
                v-bind="props"
                :color="skill.skill_added ? 'error' : 'success'"
                :icon="
                  skill.skill_added ? 'mdi-notebook-minus' : 'mdi-notebook-plus'
                "
                @click="addToUserSkills"
                variant="plain"
              />
            </template>
          </v-tooltip>
        </v-card-title>

        <v-divider />

        <!-- CONTENT AREA -->
        <v-card-text>
          <!-- WHEN NOT ADDED -->
          <template v-if="!skill.skill_added">
            <div class="text-body-1 text-center py-6">
              {{ $t("skill_info.not_added_yet") }}
            </div>
          </template>

          <!-- WHEN ADDED -->
          <template v-else>
            <ProficiencyCard
              class="mb-4"
              :elevation="0"
              :total-lvl-count="skill.skill_added._count.proficiency_levels"
              :proficiency-levels="skill.skill_added.proficiency_levels"
              :user-skill-id="skill.skill_added.id"
              :allow-changes="true"
            />
          </template>
        </v-card-text>
      </v-card>
      <!-- Proficiency -->
      <template v-if="skill.user_skill && !loadingUserLevel">
        <UserProficiencyTable
          class="mb-4"
          :prop-items="skill.user_skill"
          :prop-count="skill._count.user_skill"
        />
      </template>
    </template>
  </v-container>
</template>
<script lang="ts" setup>
import { useLocale } from "vuetify";

import { useToast, useConfirm } from "@jtekt/vue-feedback-kit";
const toast = useToast();
const confirm = useConfirm();
const { fetchUsers } = useUserLookup();
const { user_id } = useAuthIdentifier();
const { t } = useLocale();
const route = useRoute();
const addingSkill = ref(false);
const loadingUserLevel = ref(false);

const { data: skill, pending: loading } = useFetch<any>(
  () =>
    user_id.value
      ? `/api/users/${user_id.value}/skills/${route.params.id}`
      : `/api/skills/${route.params.id}`,
  {
    immediate: true,
    deep: true,
  },
);

const getUsersProficiencyLvl = async () => {
  loadingUserLevel.value = true;

  const rows = skill.value?.user_skill ?? [];
  const ids = rows.map((r: any) => String(r.user_id));

  if (ids.length === 0) {
    loadingUserLevel.value = false;
    return;
  }

  try {
    const normalized = await fetchUsers(ids);
    skill.value.user_skill = rows.map((entry: any) => {
      const match = normalized.find((u) => u.user_id === entry.user_id);

      return {
        ...entry,
        display_name: match?.display_name ?? entry.user_id,
      };
    });
  } catch (err) {
    console.error("User lookup failed:", err);

    skill.value.user_skill = rows.map((entry: any) => ({
      ...entry,
      display_name: entry.user_id,
    }));
  } finally {
    loadingUserLevel.value = false;
  }
};

const doUpdate = async (updatedData: any) => {
  const ok = await confirm(t("confirmation.update_skill"), {
    color: "error",
  });

  if (!ok) return;
  $fetch(`/api/skills/${route.params.id}`, {
    method: "PUT",
    body: updatedData,
  })
    .then((response: any) => {
      toast.success(t("success_msg.update_skill"));
      skill.value = {
        ...skill.value,
        recommended: response.recommended,
        importance: response.importance,
        name: response.name,
        image: response.image,
      };
    })
    .catch((error) => {
      toast.error(error.message || t("error.updating_skill"));
    });
};

const doDelete = async () => {
  const ok = await confirm(t("confirmation.delete_skill"), {
    color: "error",
  });

  if (!ok) return;
  $fetch(`/api/skills/${route.params.id}`, { method: "DELETE" })
    .then(() => {
      navigateTo("/skills");
    })
    .catch((error) => {
      toast.error(error.message || t("error.deleting_skill"));
    });
};

const addToUserSkills = async () => {
  if (
    skill.value.skill_added &&
    !(await confirm(t("confirmation.remove_from_user_skill"), {
      color: "error",
    }))
  )
    return;
  let url = `/api/userSkills`;
  let options: any = {
    method: "POST",
    body: {
      skill_id: skill.value.id,
      user_id: user_id.value,
    },
  };

  if (skill.value.skill_added) {
    url = url + `/${skill.value.skill_added.id}`;
    options = { method: "DELETE" };
  }
  addingSkill.value = true;
  $fetch(url, options)
    .then((response) => {
      skill.value.skill_added = response;
      toast.success(
        skill.value.skill_added
          ? t("success_msg.added_my_list")
          : t("success_msg.removed_from_my_list"),
      );
    })
    .catch((error) => {
      toast.error(error.message || t("error.updating_user_skills"));
    })
    .finally(() => {
      addingSkill.value = false;
    });
};

watch(
  () => skill.value,
  (newVal) => {
    if (newVal) {
      getUsersProficiencyLvl();
    }
  },
  { immediate: true },
);
</script>
