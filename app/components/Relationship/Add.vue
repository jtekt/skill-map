<template>
  <v-dialog v-model="show" max-width="800" persistent>
    <template v-slot:activator="{ props: activatorProps }">
      <v-tooltip :text="tooltip" location="top">
        <template v-slot:activator="{ props }">
          <div v-bind="props">
            <v-btn
              v-bind="activatorProps"
              icon="mdi-format-list-group-plus"
              variant="text"
            />
          </div>
        </template>
      </v-tooltip>
    </template>
    <v-card>
      <v-toolbar prominent>
        <v-toolbar-title>{{ $t("add_relationship") }}</v-toolbar-title>

        <v-spacer></v-spacer>
        <v-btn :text="$t('$vuetify.close')" @click="show = false" />
      </v-toolbar>
      <v-card-text>
        <SkillTable :add="true" @add="addRelationship" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
const { showToast } = useToast();
const show = ref(false);
const emit = defineEmits(["relationshipAdded"]);
const props = defineProps<{
  childId?: Number;
  parentId?: Number;
  tooltip: string;
}>();

const addRelationship = async (item: any) => {
  const { childId, parentId } = props;
  if (!childId && !parentId)
    return showToast("Missing childId or parentId", "error");
  if (childId && parentId)
    return showToast("Cannot have both childId and parentId", "error");
  let body: any;
  if (childId) body = { target_skill_id: item.id, source_skill_id: childId };
  else if (parentId)
    body = { source_skill_id: item.id, target_skill_id: parentId };

  $fetch("/api/relationships", { method: "post", body }).then(
    (response: any) => {
      emit("relationshipAdded", { skill: item, relationship: response.items });
      show.value = false;
    },
  );
};
</script>
