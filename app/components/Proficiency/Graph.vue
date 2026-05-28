<template>
  <div class="px-5">
    <!-- <canvas id="proficiencyChart" />
     -->
    <Line :data="processJson()" />
  </div>
</template>
<script lang="ts" setup>
import { useLocale } from "vuetify";
import { format } from "date-fns";
import { ja, enUS } from "date-fns/locale";
import { Line } from "vue-chartjs";
import { CategoryScale } from "chart.js";
import Chart from "chart.js/auto";

const locales = { ja, enUS };

const { current, t } = useLocale();

onMounted(() => {
  Chart.register(CategoryScale);
});

const props = defineProps<{
  proficiencyLevels: any[];
}>();

const processJson = () => {
  let sortedArr = [...props.proficiencyLevels.sort(dateSort)];
  return {
    labels: sortedArr.map((data) =>
      format(data.createdAt, "PPPp", {
        locale: locales[current.value === "en" ? "enUS" : current.value],
      }).split(current.value === "en" ? " at " : " ")
    ),
    datasets: [
      {
        label: t("graph.proficiency_chart_label"),
        data: sortedArr.map((data) => data.level),
        fill: false,
        borderColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            // This case happens on initial chart load
            return;
          }
          return getGradient(ctx, chartArea);
        },
        tension: 0.1,
      },
    ],
  };
};
const dateSort = (a: any, b: any) => {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
};

let width, height, gradient;
const getGradient = (ctx, chartArea) => {
  const chartWidth = chartArea.right - chartArea.left;
  const chartHeight = chartArea.bottom - chartArea.top;
  if (!gradient || width !== chartWidth || height !== chartHeight) {
    width = chartWidth;
    height = chartHeight;
    gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, "rgb(244, 67, 54)");
    gradient.addColorStop(0.25, "rgb(255, 152, 0)");
    gradient.addColorStop(0.75, "rgb(0, 150, 136)");
    gradient.addColorStop(1, "rgb(76, 175, 80)");
  }

  return gradient;
};
</script>
