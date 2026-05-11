<template>
  <v-card class="pa-4 text-center step-card" elevation="0" rounded="lg">
    <div class="step-number">{{ number }}</div>
    <v-img :src="img" height="100" contain class="mb-2" />
    <v-card-text>
      <div class="text-caption" v-html="label"></div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
  img: String,
  label: String,
  number: Number,
});
</script>

<style scoped>
.step-card {
  border: 1px solid #e0e0e0;
}
.step-number {
  font-size: 14px;
  font-weight: 700;
  color: #888;
  margin-bottom: 8px;
}
</style>
