<template>
  <v-card variant="text">
    <!-- Header -->
    <v-card-title class="d-flex align-center">
      {{ title }}

      <v-spacer></v-spacer>

      <RelationshipAdd
        :child-id="childId"
        :parent-id="parentId"
        :tooltip="tooltip"
        @relationship-added="loadNextPage({ page: 1, itemsPerPage: 10 })"
      />
    </v-card-title>

    <v-divider />

    <!-- Content -->
    <v-card-text>
      <v-data-table-server
        :headers="headers"
        :items="skills"
        item-key="id"
        :loading="loading"
        :style="tableStyle"
        :items-length="count"
        @update:page="loadNextPage({ page: $event, itemsPerPage: 10 })"
        @update:items-per-page="loadNextPage({ page: 1, itemsPerPage: $event })"
      >
        <!-- Name -->
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

        <!-- Image -->
        <template v-slot:item.image="{ item }">
          <v-img
            width="3em"
            height="3em"
            :src="item.image || '/icons/school.png'"
            @click="navigateTo(`/skills/${item.id}`)"
            style="cursor: pointer"
          />
        </template>

        <!-- Remove -->
        <template v-slot:item.remove="{ item }">
          <v-btn
            icon="mdi-close"
            @click="deleteRelationship(item)"
            variant="flat"
          />
        </template>
      </v-data-table-server>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useToast, useConfirm } from "@jtekt/vue-feedback-kit";
const toast = useToast();
const { confirm } = useConfirm();
import { useLocale } from "vuetify";
const props = defineProps<{
  childId?: Number;
  parentId?: Number;
  items: any[];
  totalItemCount: number;
  title: string;
  tooltip: string;
  tableStyle?: any;
}>();
const { t } = useLocale();
const skills = ref<any[]>([...props.items]);
const count = ref(props.totalItemCount);
const loading = ref(false);

const headers = computed(() => {
  let defaultList = [
    { title: "", value: "see" },
    { title: t("skill_table.logo"), value: "image" },
    { title: t("skill_table.name"), value: "name" },
    { title: t("skill_table.remove"), value: "remove" },
  ];
  return defaultList;
});

const loadNextPage = async ({ page, itemsPerPage }) => {
  let url = `/api/skills/relationship?page=${page}&take=${itemsPerPage}`;
  if (props.childId) url = url + `&source_skill_id=${props.childId}`;
  else if (props.parentId) url = url + `&target_skill_id=${props.parentId}`;
  loading.value = true;
  $fetch(url)
    .then((response: any) => {
      count.value = response.count;
      skills.value = response.items.map((obj) => {
        if (obj.source_skill)
          return { ...obj.source_skill, relationId: obj.id };
        else return { ...obj.target_skill, relationId: obj.id };
      });
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => (loading.value = false));
};

const deleteRelationship = async (item: any) => {
  const ok = await confirm({
    text: t("confirmation.remove_relationship"),
    color: "error",
  });

  if (!ok) return;
  if (!item.relationId) return console.error("Missing relationship ID");
  loading.value = true;
  $fetch(`/api/relationships/${item.relationId}`, {
    method: "DELETE",
  })
    .then((_) => {
      loadNextPage({ page: 1, itemsPerPage: 10 });
    })
    .catch((error) => {
      console.log(error);
      toast.error(error.message || t("error.deleting_relationship"));
    })
    .finally(() => {
      loading.value = false;
    });
};
</script>
