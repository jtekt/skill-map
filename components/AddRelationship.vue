<template>
  <v-dialog v-model="show" max-width="800" persistent>
    <template v-slot:activator="{ props: activatorProps }">
      <v-tooltip :text="tooltip" location="top">
        <template v-slot:activator="{ props }">
          <div v-bind="props">
            <v-btn v-bind="activatorProps" icon="mdi-format-list-group-plus" />
          </div>
        </template>
      </v-tooltip>
    </template>
    <template v-if="items">
      <v-card>
        <v-toolbar prominent>
          <v-toolbar-title>{{ $t("add_relationship") }}</v-toolbar-title>

          <v-spacer></v-spacer>
          <v-btn :text="$t('$vuetify.close')" @click="show = false" />
        </v-toolbar>
        <v-card-text>
          <SkillTable
            :items="items"
            :add="true"
            :show-search="true"
            @add="addRelationship"
          />
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>
<script setup lang="ts">
import useFetchApi from "~/composables/useFetchApi";
const show = ref(false);
const emit = defineEmits(["relationshipAdded"]);
const props = defineProps<{
  childId?: Number;
  parentId?: Number;
  tooltip: string;
}>();

const items = ref([]);
watch(show, () => getSkills());

const getSkills = async () => {
  await useFetchApi("/api/skills")
    .then((response: any) => {
      items.value = response.items;
    })
    .catch((error) => {
      console.log(error);
    });
};

async function addRelationship(item: any) {
  const { childId, parentId } = props;
  if (!childId && !parentId) return alert("Missing childId or parentId");
  if (childId && parentId)
    return alert("Cannot have both childId and parentId");
  let body: any;
  if (childId) body = { target_skill_id: item.id, source_skill_id: childId };
  else if (parentId)
    body = { source_skill_id: item.id, target_skill_id: parentId };

  await useFetchApi("/api/relationships", { method: "post", body }).then(
    (response: any) => {
      emit("relationshipAdded", { skill: item, relationship: response.items });
      show.value = false;
    }
  );
}
</script>
