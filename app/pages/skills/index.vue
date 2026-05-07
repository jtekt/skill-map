<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="d-flex align-center pe-2">
        <!-- TITLE -->
        <span class="text-h6"> {{ $t("skills") }} {{ $t("table") }} </span>

        <v-spacer />

        <div class="d-flex align-center me-4">
          <!-- Graph Button -->
          <div class="me-2">
            <v-tooltip :text="$t('display_as_graph')" location="top">
              <template #activator="{ props }">
                <v-btn
                  to="/"
                  icon="mdi-graph"
                  size="small"
                  color="primary"
                  v-bind="props"
                />
              </template>
            </v-tooltip>
          </div>

          <!-- Compare Graph -->
          <div class="me-2">
            <v-tooltip :text="$t('graph.compare_skills')" location="top">
              <template #activator="{ props }">
                <GraphCompare
                  v-bind="props"
                  :button-props="{
                    size: 'small',
                    icon: 'mdi-chart-scatter-plot-hexbin',
                    color: 'primary',
                  }"
                />
              </template>
            </v-tooltip>
          </div>

          <!-- Add Skill -->
          <div class="me-2">
            <SkillForm
              :dialog-data="{
                size: 'small',
                color: 'success',
                icon: 'mdi-notebook-plus-outline',
                title: $t('add_new_skill'),
              }"
              @save-data="doAdd($event)"
            >
              <v-tooltip
                activator="parent"
                :text="$t('add_new_skill')"
                location="right"
              />
            </SkillForm>
          </div>
        </div>

        <!-- SEARCH FIELD -->
        <v-text-field
          prepend-inner-icon="mdi-magnify"
          v-model="search"
          flat
          hide-details
          single-line
          :label="$t('search')"
          class="p-4"
          style="max-width: 350px"
        />
      </v-card-title>
      <v-card-text>
        <SkillTable v-model:search="search" :showSearch="false" />
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script lang="ts" setup>
import { useLocale } from "vuetify";
import { useToast } from "@jtekt/vue-feedback-kit";
const toast = useToast();
const router = useRouter();
const { t } = useLocale();
const search = ref("");

const doAdd = async (data: any) => {
  $fetch("/api/skills", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => {
      toast.success(t("success_msg.add_skill", response.name));
      router.push(`/skills/${response.id}`);
    })
    .catch((error) => {
      toast.error(error.message || t("error.adding_skill"));
    });
};
</script>
