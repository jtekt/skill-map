<template>
  <v-row>
    <v-col>
      <v-toolbar prominent>
        <v-toolbar-title>{{ $t("skill_info.title") }}</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-tooltip
          :text="$t('skill_info.update_skill')"
          location="bottom"
          v-if="skill"
        >
          <template v-slot:activator="{ props }">
            <SkillForm
              :initial-data="{ ...skill }"
              v-bind="props"
              :dialog-data="{
                icon: 'mdi-lead-pencil',
                color: 'orange-lighten-2',
                title: $t('skill_info.update_skill'),
              }"
              @save-data="doUpdate($event)"
            />
          </template>
        </v-tooltip>
        <v-tooltip :text="$t('skill_info.delete_skill')" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-trash-can"
              color="error"
              v-bind="props"
              @click="doDelete"
            />
          </template>
        </v-tooltip>
      </v-toolbar>
    </v-col>
  </v-row>
  <template v-if="loading">
    <v-skeleton-loader
      class="mx-auto"
      type="table-heading, list-item-two-line, image, table-tfoot, table"
    ></v-skeleton-loader>
  </template>
  <template v-if="skill">
    <v-row>
      <v-col>
        <RelationshipTable
          title="Parents"
          :items="
            skill.parents.map((r) => ({
              ...r.target_skill,
              relationId: r.id,
            }))
          "
          :total-item-count="skill._count.parents"
          tooltip="Add new parent"
          :child-id="skill.id"
          table-style="max-height: 500px;"
        />
      </v-col>
      <v-col>
        <v-card max-width="344" class="mx-auto">
          <v-card-actions v-if="useAuthUser()">
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
                    skill.skill_added
                      ? 'mdi-notebook-minus'
                      : 'mdi-notebook-plus'
                  "
                  @click="addToUserSkills"
                />
              </template>
            </v-tooltip>
          </v-card-actions>
          <v-img
            height="200px"
            class="pa-6"
            :src="skill.image || '/icons/school.png'"
          />

          <v-card-title> {{ skill.name }} </v-card-title>
        </v-card>
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
    <v-row v-if="skill.skill_added">
      <v-col>
        <ProficiencyCard
          :total-lvl-count="skill.skill_added._count.proficiency_levels"
          :proficiency-levels="skill.skill_added.proficiency_levels"
          :user-skill-id="skill.skill_added.id"
          :allow-changes="true"
        />
      </v-col>
    </v-row>
    <v-row v-if="skill.user_skill && !loadingUserLevel">
      <v-col>
        <UserProficiencyTable
          :prop-items="skill.user_skill"
          :prop-count="skill._count.user_skill"
        />
      </v-col>
    </v-row>
  </template>
  <v-snackbar v-model="snackbar.display" :color="snackbar.color">
    {{ snackbar.text }}

    <template v-slot:actions>
      <v-btn @click="snackbar.display = false" icon="mdi-close" />
    </template>
  </v-snackbar>
</template>
<script lang="ts" setup>
import { useLocale } from "vuetify";
const config = useRuntimeConfig();
const { useAuthUser } = useAuth();

const { t } = useLocale();

const loadingUserLevel = ref(false);
const loading = ref(false);
const route = useRoute();
const skill = ref();
const addingSkill = ref(false);
const snackbar = ref({
  display: false,
  text: "",
  color: "primary",
});

onMounted(() => {
  if (!useAuthUser().value) return;
  getSkill();
});

const getSkill = async () => {
  const url = useAuthUser().value
    ? `/api/users/${useAuthUser().value.username}/skills/${route.params.id}`
    : `/api/skills/${route.params.id}`;
  loading.value = true;
  await useFetchApi(url)
    .then((response: any) => {
      skill.value = response;
      getUsersProficiencyLvl();
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => (loading.value = false));
};

const getUsersProficiencyLvl = async () => {
  if (!config.public.userManagerApiUrl) return;
  loadingUserLevel.value = true;
  const user_ids = skill.value.user_skill.map(({ user_id }) => user_id);
  if (user_ids.length === 0) return;

  await useFetchApi(`${config.public.userManagerApiUrl}/v3/users`, {
    params: { username: user_ids },
  })
    .then((response: any) => {
      skill.value.user_skill = response.users.map((user: any) => ({
        display_name: user.display_name,
        ...skill.value.user_skill.find(
          ({ user_id }) => user_id === user.username
        ),
      }));
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => (loadingUserLevel.value = false));
};

const doUpdate = async (updatedData: any) => {
  if (!confirm(t("confirmation.update_skill"))) return;
  await useFetchApi(`/api/skills/${route.params.id}`, {
    method: "PUT",
    body: updatedData,
  })
    .then((response: any) => {
      snackbar.value = {
        text: t("success_msg.update_skill"),
        color: "success",
        display: true,
      };
      skill.value = {
        ...skill.value,
        recommended: response.recommended,
        importance: response.importance,
        name: response.name,
        image: response.image,
      };
    })
    .catch((error) => {
      snackbar.value = { text: error, color: "error", display: true };
    })
    .finally(() => {
      setTimeout(() => {
        snackbar.value.display = false;
      }, 5000);
    });
};

const doDelete = async () => {
  if (!confirm(t("confirmation.delete_skill"))) return;
  await useFetchApi(`/api/skills/${route.params.id}`, { method: "DELETE" })
    .then((response: any) => {
      navigateTo("/skills");
    })
    .catch((error) => {
      snackbar.value = { text: error, color: "error", display: true };
    })
    .finally(() => {
      setTimeout(() => {
        snackbar.value.display = false;
      }, 5000);
    });
};

const addToUserSkills = async () => {
  let url = `/api/userSkills`;
  let options: any = {
    method: "POST",
    body: {
      skill_id: skill.value.id,
      user_id: useAuthUser().value.username,
    },
  };

  if (skill.value.skill_added) {
    url = url + `/${skill.value.skill_added.id}`;
    options = { method: "DELETE" };
  }
  addingSkill.value = true;
  await useFetchApi(url, options)
    .then((response) => {
      skill.value.skill_added = response;
      snackbar.value = {
        text: skill.value.skill_added
          ? t("success_msg.added_my_list")
          : t("success_msg.removed_from_my_list"),
        color: "success",
        display: true,
      };
    })
    .catch((error) => {
      snackbar.value = { text: error, color: "error", display: true };
    })
    .finally(() => {
      addingSkill.value = false;
      setTimeout(() => {
        snackbar.value.display = false;
      }, 5000);
    });
};

watch(
  () => useAuthUser().value,
  () => {
    getSkill();
  }
);
</script>
