<template>
  <v-footer app height="18" class="pa-0">
    <div
      class="footer-mini px-2 d-flex align-center justify-space-between w-100"
    >
      <div v-if="hasDevInfo">
        {{ $t('footer.maintained_by') }}
        <a
          class="link"
          :href="devInfo!.href"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ devInfo!.name }}
        </a>
      </div>

      <div>
        © {{ displayYear }}
        <span class="d-none d-sm-inline">JTEKT</span>
        ·
        <a
          v-if="appInfo"
          class="link"
          :href="appInfo.href"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ appInfo.title }}
        </a>
        · v{{ version }}
      </div>
    </div>
  </v-footer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { version } from "../../../package.json";

type AppInformation = {
  title: string;
  href: string;
};

type DevInfo = {
  name: string;
  href: string;
  icon?: string;
};

const props = defineProps<{
  appInfo?: AppInformation;
  devInfo?: DevInfo;
}>();

const developedYear = 2021;

const currentYear = new Date().getFullYear();

const displayYear = computed(() =>
  developedYear === currentYear
    ? `${developedYear}`
    : `${developedYear}-${currentYear}`,
);

const hasDevInfo = computed(() => !!props.devInfo?.name);
</script>

<style scoped>
.footer-mini {
  font-size: 11px;
  line-height: 1.2;
  opacity: 0.65;
}

.link {
  text-decoration: none;
  color: inherit;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.link:hover {
  opacity: 1;
}

.social-link :deep(.v-icon) {
  color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity));
  text-decoration: none;
  transition: 0.2s ease-in-out;
}

.social-link :deep(.v-icon):hover {
  color: rgb(var(--v-theme-primary));
}
</style>
