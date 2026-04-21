<template>
  <v-app-bar v-bind="$attrs" :color="color">
    <v-btn
      v-if="hasNav"
      icon="mdi-menu"
      :color="iconColor"
      aria-label="Open navigation"
      @click="toggleDrawer"
    />
    <div
      v-if="hasLead"
      class="lead-container d-flex align-center justify-center"
    >
      <div class="lead-content">
        <slot name="leading" />
      </div>
    </div>

    <v-app-bar-title :class="titleClass">
      <slot name="title">
        {{ title }}
      </slot>
    </v-app-bar-title>

    <v-spacer />

    <v-btn
      :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
      @click="toggleTheme"
    />

    <slot name="trailing" />
  </v-app-bar>

  <v-navigation-drawer
    v-if="hasNav"
    v-model="drawer"
    :width="drawerWidth"
    :location="drawerLocation"
  >
    <slot name="nav" />
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useTheme } from "vuetify";

defineOptions({ inheritAttrs: false });

type Props = {
  title?: string;
  color?: string;
  drawerWidth?: number | string;
  drawerLocation?: "start" | "end" | "left" | "right";
  leadGap?: number | string;
};

const props = withDefaults(defineProps<Props>(), {
  color: "black",
  drawerWidth: 280,
  drawerLocation: "start",
});

const slots = useSlots();
const hasNav = computed(() => !!slots.nav);
const hasLead = computed(() => !!slots.leading);
const isDarkBar = computed(() => (props.color ?? "").toLowerCase() === "black");
const titleClass = computed(() => (isDarkBar.value ? "text-white" : undefined));
const iconColor = computed(() => (isDarkBar.value ? "white" : undefined));

const isDark = computed(() => theme.global.current.value.dark);

const theme = useTheme();
const drawer = ref(true);

function toggleDrawer() {
  drawer.value = !drawer.value;
}

function toggleTheme() {
  const newTheme = theme.global.name.value === "dark" ? "light" : "dark";

  theme.change(newTheme);
  localStorage.setItem("theme", newTheme);
}
</script>

<style>
.lead-container {
  height: 100%;
  display: flex;
  align-items: center;
}

.lead-content {
  height: 70%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 22px;
}

.lead-content img,
.lead-content .v-img,
.lead-content svg,
.lead-content .v-icon {
  height: 100%;
  width: auto;
  object-fit: contain;
  max-height: 100%;
}
</style>
