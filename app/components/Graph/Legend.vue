<template>
  <div v-if="isComparing" class="legend">
    <h3>{{ $t("graph.legend.title") }}</h3>
    <div v-if="route.query.compareTo === 'all'" class="legend-items">
      <div class="legend-item">
        <div class="color-box has-skill"></div>
        <span>{{
          $t("graph.legend.has_skill", [smOwnerLegend ?? $t("user")])
        }}</span>
      </div>
      <div class="legend-item">
        <div class="color-box missing-skill"></div>
        <span>{{
          $t("graph.legend.missing_skill", [smOwnerLegend ?? $t("user")])
        }}</span>
      </div>
    </div>
    <div v-else class="legend-items">
      <div class="legend-item">
        <div class="color-box only-user-has-skill"></div>
        <span>{{
          $t("graph.legend.only_user_has", [smOwnerLegend ?? $t("user")])
        }}</span>
      </div>
      <div class="legend-item">
        <div class="color-box only-comparison-user-has-skill"></div>
        <span>{{
          $t("graph.legend.only_other_has", ["", comparetOUser])
        }}</span>
      </div>
      <div class="legend-item">
        <div class="color-box both-have-skill"></div>
        <span>{{ $t("graph.legend.both_have") }}</span>
      </div>
      <div class="legend-item">
        <div class="color-box neither-has-skill"></div>
        <span>{{ $t("graph.legend.neither_has") }}</span>
      </div>
    </div>
  </div>

  <!-- Only show user legend when NOT comparing -->
  <div v-else-if="smOwnerLegend" class="legend">
    <h3>{{ $t("graph.legend.owner_skill", [smOwnerLegend]) }}</h3>
  </div>
</template>
<script setup lang="ts">
const { user_id } = useAuthIdentifier();
const route = useRoute();
const props = defineProps<{
  users?: { user_id: string; display_name: string }[];
}>();

const isComparing = computed(() => {
  return Array.isArray(props.users) && props.users.length > 1;
});

const comparetOUser = computed(() => {
  return props.users?.[1]?.display_name ?? "";
});

const smOwnerLegend = computed(() => {
  const owner = props.users?.[0];
  if (!owner) return undefined;

  return owner.user_id !== user_id.value ? owner.display_name : undefined;
});
</script>
<style>
.controls {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  background: rgba(var(--v-theme-surface), 0.9);
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.comparison-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comparison-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 20px;
  margin-top: 5px;
}

select {
  margin-top: 5px;
  padding: 5px;
  border-radius: 4px;
}

.legend {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(var(--v-theme-surface), 0.9);
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.legend h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 16px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-box {
  width: 15px;
  height: 15px;
  border-radius: 3px;
}

/* Comparison colors for "all skills" comparison */
.has-skill {
  background-color: #4caf50;
}

.missing-skill {
  background-color: "transparent";
}

/* Comparison colors for "user" comparison */
.only-user-has-skill {
  background-color: #4caf50;
}

.only-comparison-user-has-skill {
  background-color: #f44336;
}

.both-have-skill {
  background-color: #2196f3;
}

.neither-has-skill {
  background-color: "transparent";
}
</style>
