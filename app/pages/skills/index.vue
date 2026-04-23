<template>
  <v-row>
    <v-col>
      <v-toolbar prominent>
        <v-toolbar-title>{{ $t("skills") }}{{ $t("table") }}</v-toolbar-title>
        <v-spacer></v-spacer>

        <div class="pe-4">
          <v-row justify="end">
            <v-col>
              <v-tooltip :text="$t('display_as_graph')" location="top">
                <template v-slot:activator="{ props }">
                  <v-btn
                    to="/"
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
                      icon: 'mdi-chart-scatter-plot-hexbin',
                      color: 'primary',
                    }"
                  />
                </template>
              </v-tooltip>
            </v-col>
          </v-row>
        </div>
        <v-tooltip :text="$t('add_new_skill')" location="bottom">
          <template v-slot:activator="{ props }">
            <SkillForm
              v-bind="props"
              :dialog-data="{
                icon: 'mdi-notebook-plus-outline',
                color: 'success',
                title: $t('add_new_skill'),
              }"
              @save-data="doAdd($event)"
            />
          </template>
        </v-tooltip>
      </v-toolbar>
    </v-col>
  </v-row>
  <v-row>
    <v-col>
      <SkillTable />
    </v-col>
  </v-row>
</template>
<script lang="ts" setup>
const { showToast } = useToast();
import { useLocale } from "vuetify";
const { t } = useLocale();

const doAdd = async (data: any) => {
  $fetch("/api/skills", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((response) => {
      showToast(t("success_msg.add_skill", response.name), "success");
    })
    .catch((error) => {
      showToast(
        error.message || "An error occurred while adding the skill.",
        "error",
      );
    });
};
</script>
