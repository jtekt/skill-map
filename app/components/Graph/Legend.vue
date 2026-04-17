<template>
  <div v-if="enableComparison" class="legend">
    <h3>Comparison Legend</h3>
    <div v-if="route.query.compareTo === 'all'" class="legend-items">
      <div class="legend-item">
        <div class="color-box has-skill"></div>
        <span>{{ smOwnerLegend ?? "You" }} have this skill</span>
      </div>
      <div class="legend-item">
        <div class="color-box missing-skill"></div>
        <span>{{ smOwnerLegend ?? "You" }} don't have this skill</span>
      </div>
    </div>
    <div v-else class="legend-items">
      <div class="legend-item">
        <div class="color-box only-user-has-skill"></div>
        <span>Only {{ smOwnerLegend ?? "You" }} have this skill</span>
      </div>
      <div class="legend-item">
        <div class="color-box only-comparison-user-has-skill"></div>
        <span>Only {{ comparetOUser }} have this skill</span>
      </div>
      <div class="legend-item">
        <div class="color-box both-have-skill"></div>
        <span>Both have this skill</span>
      </div>
      <div class="legend-item">
        <div class="color-box neither-has-skill"></div>
        <span>Neither has this skill</span>
      </div>
    </div>
  </div>

  <div v-if="!enableComparison && smOwnerLegend" class="legend">
    <h3>{{ smOwnerLegend }}'s Skill</h3>
  </div>
</template>
<script setup lang="ts">
const { user } = useUserSession();
const route = useRoute();
const props = defineProps<{
  users?: any;
}>();

const enableComparison = computed(() => {
  return props.users && props.users[1]
    ? props.users[1].display_name
    : undefined;
});

const comparetOUser = computed(() => {
  return props.users && props.users[1]
    ? props.users[1].display_name
    : undefined;
});

const smOwnerLegend = computed(() => {
  return props.users &&
    props.users[0].username != user.value?.preferred_username
    ? props.users[0].display_name
    : undefined;
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
