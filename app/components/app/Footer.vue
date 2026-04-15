<template>
  <v-footer app height="40">
    <div class="text-caption text-disabled">
      Maintained by —
      <a
        v-if="devInfo"
        class="text-decoration-none on-surface"
        :href="devInfo.href"
        rel="noopener noreferrer"
        target="_blank"
      >
        {{ devInfo.name }}
      </a>
    </div>
    <div
      class="text-caption text-disabled"
      style="position: absolute; right: 16px"
    >
      &copy; {{ displayYear }}
      <span class="d-none d-sm-inline-block">JTEKT Corporation</span>
      —
      <a
        v-if="appInfo"
        class="text-decoration-none on-surface"
        :href="appInfo.href"
        rel="noopener noreferrer"
        target="_blank"
      >
        {{ appInfo.title }}
      </a>
      | v{{ version }}
    </div>
  </v-footer>
</template>

<script setup lang="ts">
import { version } from "../../../package.json";
type Props = {
  appInfo?: AppInformation;
  devInfo?: DevInfo;
};

type AppInformation = {
  title: string;
  href: string;
};

type DevInfo = {
  name: string;
  href: string;
  icon?: string;
};

defineProps<Props>();

const developedYear = 2023;
const currentYear = new Date().getFullYear();

const displayYear =
  developedYear === currentYear
    ? `${developedYear}`
    : `${developedYear}-${currentYear}`;
</script>

<style scoped lang="sass">
.social-link :deep(.v-icon)
  color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
  text-decoration: none
  transition: .2s ease-in-out

  &:hover
    color: rgba(25, 118, 210, 1)
</style>
