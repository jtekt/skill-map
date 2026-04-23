<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      Proficieny Level Table

      <v-spacer></v-spacer>

      <!-- NOTE: I dont think chart is necessary. I  will leave it like this as of the moment.  -->
      <div v-if="count > 2" class="pa-2">
        <v-btn-toggle v-model="toggle" variant="outlined" divided>
          <v-btn icon="mdi-table"></v-btn>
          <v-btn icon="mdi-chart-bell-curve-cumulative"></v-btn>
        </v-btn-toggle>
      </div>

      <ProficiencyForm
        v-if="allowChanges"
        :dialog-data="{
          title: 'Add new level',
          icon: 'mdi-playlist-plus',
        }"
        @save-data="saveNewData"
      />
    </v-card-title>

    <v-card-text>
      <template v-if="toggle === 0">
        <v-data-table-server
          :headers="headers"
          :items="items"
          item-key="name"
          style="max-height: 400px"
          :items-length="count"
          @update:page="getLevels({ page: $event, itemsPerPage: 10 })"
          @update:items-per-page="getLevels({ page: 1, itemsPerPage: $event })"
        >
          <template v-slot:item.createdAt="{ item }">
            {{
              format(item.createdAt, "PPPp", {
                locale: locales[current === "en" ? "enUS" : current],
              })
            }}
          </template>
          <template v-slot:item.proficiency_level="{ item }">
            <v-progress-linear
              :color="levelColor(item.level)"
              :model-value="item.level"
              striped
              height="10"
            />
          </template>
          <template v-slot:item.actions="{ item }">
            <div class="d-flex">
              <ProficiencyForm
                :dialog-data="{
                  title: 'Udpate Level',
                  icon: 'mdi-lead-pencil',
                  color: 'warning',
                  variant: 'text',
                }"
                :initial-data="{ ...item }"
                @save-data="updateData($event, item.id)"
              />
              <v-btn
                icon="mdi-close"
                size="small"
                @click="deleteData(item.id)"
                variant="text"
                color="error"
                class="text-center pt-4"
              />
            </div>
          </template>
        </v-data-table-server>
      </template>

      <ProficiencyGraph v-else :proficiency-levels="[...items]" />
    </v-card-text>
  </v-card>
</template>
<script lang="ts" setup>
const { showToast } = useToast();
import { useLocale } from "vuetify";
import { format } from "date-fns";
import { ja, enUS } from "date-fns/locale";

const locales = { ja, enUS };

const { t, current } = useLocale();
const props = defineProps<{
  userSkillId: number;
  proficiencyLevels: any[];
  totalLvlCount: number;
  allowChanges: boolean;
  elevation?: number;
}>();
const emit = defineEmits(["updated-proficiency"]);

const toggle = ref(0);
const items = ref<any[]>([...props.proficiencyLevels]);
const count = ref(props.totalLvlCount ?? 0);

const levelColor = (level: number) => {
  if (level < 25) return "error";
  else if (level < 50) return "orange";
  else if (level < 75) return "teal";
  else if (level >= 75) return "success";
};

watch(
  () => toggle.value,
  (newVal, _) => {
    if (newVal === 1 && items.value.length < count.value)
      getLevels({ page: 1, itemsPerPage: count.value });
  },
);

const headers = computed(() => {
  const defaultHeaders = [
    { title: t("proficiency_level"), value: "proficiency_level" },
    { title: "Added at", value: "createdAt" },
  ];
  if (props.allowChanges)
    defaultHeaders.push({ title: "Actions", value: "actions" });
  return defaultHeaders;
});

const saveNewData = async (data: any) => {
  let body = { ...data, user_skill_id: props.userSkillId };
  $fetch(`/api/proficiency`, {
    method: "POST",
    body,
  })
    .then((response: any) => {
      if (items.value.length === 0) items.value.push(response);
      else items.value.unshift(response);
      count.value += 1;
      emit("updated-proficiency", response);
    })
    .catch((error) => {
      showToast(
        error.message || "An error occurred while saving the data.",
        "error",
      );
      console.error(error);
    });
};

const updateData = async (data: any, id: number) => {
  $fetch(`/api/proficiency/${id}`, {
    method: "PUT",
    body: { ...data },
  })
    .then((response) => {
      if (items.value[0].id === id) {
        items.value[0] = response;
        emit("updated-proficiency", response);
      } else {
        items.value = items.value.map((obj) =>
          obj.id === id ? response : obj,
        );
      }
    })
    .catch((error) => {
      showToast(
        error.message || "An error occurred while updating the data.",
        "error",
      );
      console.error(error);
    });
};

const deleteData = async (id: number) => {
  if (!confirm("Are you sure you want to remove this level from your list?"))
    return;
  $fetch(`/api/proficiency/${id}`, {
    method: "DELETE",
  })
    .then((_) => {
      const foundIndex = items.value.findIndex((s) => s.id === id);
      if (foundIndex > -1) items.value.splice(foundIndex, 1);
      count.value -= 1;
      emit("updated-proficiency", items.value[0] ?? null);
    })
    .catch((error) => {
      showToast(
        error.message || "An error occurred while updating the data.",
        "error",
      );
      console.error(error);
    });
};

const getLevels = async (event: any) => {
  $fetch(
    `/api/userSkills/${props.userSkillId}/proficiency?page=${event.page}&take=${event.itemsPerPage}`,
  )
    .then((response) => {
      items.value = response.items;
      count.value = response.count;
    })
    .catch((error) => {
      console.log(error);
    });
};
</script>
