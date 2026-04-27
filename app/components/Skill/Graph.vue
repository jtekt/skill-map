<template>
  <div class="graph">
    <div align="center" justify="center" style="margin-top: 85px !important">
      <svg class="graph_wrapper"></svg>
      <v-fab
        class="speed-dial"
        location="end"
        color="primary"
        absolute
        app
        appear
        @click="resetZoom"
        :active="zoomed"
        icon="mdi-magnify-remove-cursor"
      />
    </div>

    <GraphLegend :users="users" />
    <div class="speed-dial">
      <v-speed-dial transition="fade-transition" location="top left">
        <template v-slot:activator="{ props: activatorProps }">
          <v-fab
            absolute
            app
            appear
            v-bind="activatorProps"
            size="large"
            location="bottom start"
            icon="mdi-hammer-wrench"
            color="primary"
          ></v-fab>
        </template>

        <GraphCompare key="compare">
          <v-tooltip
            activator="parent"
            :text="$t('graph.compare_skills')"
            location="right"
          />
        </GraphCompare>

        <GraphFilter key="filter" :hidden="hideFilter">
          <v-tooltip
            activator="parent"
            :text="$t('graph.add_filter')"
            location="right"
          />
        </GraphFilter>

        <div key="table" style="display: inline-block">
          <v-btn :icon="routeConfig.icon" :to="routeConfig.path" />
          <v-tooltip
            activator="parent"
            :text="$t('graph.display_as_table')"
            location="right"
          />
        </div>

        <SkillForm
          key="add"
          :dialog-data="{
            icon: 'mdi-notebook-plus-outline',
            title: $t('add_new_skill'),
          }"
          @save-data="doAdd($event)"
        >
          <v-tooltip
            activator="parent"
            :text="$t('add_new_skill')"
            location="right"
          />
        </SkillForm>
        <!-- <v-btn key="4" icon="$error"></v-btn> -->
      </v-speed-dial>
    </div>
  </div>
  <template v-if="!nodes || nodes.length === 0">
    <div class="w-100">
      <EmptyStateGraph :loading="loading" @skill-added="emit('skill-added')" />
    </div>
  </template>
</template>
<script setup lang="ts">
import { useToast } from "@jtekt/vue-feedback-kit";
const toast = useToast();
//@ts-ignore
import * as d3 from "d3";
import { useLocale } from "vuetify";
const emit = defineEmits(["skill-added"]);
const { t } = useLocale();
let isDestroyed = false;
const props = defineProps<{
  nodes?: any[];
  loading: boolean;
  users?: any;
}>();
const route = useRoute();
const zoomed = ref(false);
const link = ref<any>();
const skillNode = ref<any>();
const conceptNode = ref<any>();
const simulationRef = ref<d3.Simulation<any, any> | null>(null);

// Debounced resize -> rebuild graph safely
let resizeTimeout: number | null = null;

const hideFilter = computed(() => {
  return route.name !== "index" && route.name !== "users-user_id";
});

const enableComparison = computed(() => {
  return route.query.compareTo ?? false;
});

const routeConfig = computed(() => {
  const { user_id } = route.params;
  switch (route.name) {
    case "index":
      return { path: "/skills", icon: "mdi-table" };

    case "users-user_id":
      return { path: `/users/${user_id}/skills`, icon: "mdi-table" };

    default:
      return { path: "/", icon: "mdi-graph" };
  }
});

const doAdd = async (data: any) => {
  try {
    $fetch("/api/skills", { method: "POST", body: data });
    emit("skill-added");
  } catch (err: any) {
    toast.error(err.message || t("error.saving_skill"));
  }
};

const zoom = d3
  .zoom<SVGSVGElement, unknown>()
  .scaleExtent([0.3, 5])
  .on("zoom", (event) => {
    const t = event.transform;

    link.value?.attr("transform", t);
    skillNode.value?.attr("transform", t);
    conceptNode.value?.attr("transform", t);

    zoomed.value = !(t.x === 0 && t.y === 0);
  });

const resetZoom = () => {
  const svg = d3.select("svg.graph_wrapper");
  svg
    .transition()
    .duration(700)
    .call(zoom.transform as any, d3.zoomIdentity);
};

function destroyGraph() {
  const svg = d3.select("svg.graph_wrapper");
  svg.on(".zoom", null);
  svg.selectAll("*").on(".", null);
  svg.selectAll("*").remove();

  // Dispose simulation
  if (simulationRef.value) {
    simulationRef.value.on("tick", null);
    simulationRef.value.stop();
    simulationRef.value.nodes([]);
    simulationRef.value = null;
  }

  link.value = null;
  skillNode.value = null;
  conceptNode.value = null;
}

function reload() {
  destroyGraph();
  createGraph();
}

const handleResize = () => {
  if (resizeTimeout !== null) {
    clearTimeout(resizeTimeout);
  }

  resizeTimeout = window.setTimeout(() => {
    reload(); // SAFE NOW because destroyGraph clears everything
    resizeTimeout = null;
  }, 200);
};

function createGraph() {
  if (!props.nodes || props.nodes.length === 0) return;

  const width = window.innerWidth;
  const height = window.innerHeight - 110;

  // fresh SVG
  const svg = d3.select("svg.graph_wrapper");
  svg.selectAll("*").remove();

  svg
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr(
      "style",
      `width: ${
        width - 20
      }px; height: ${height}px; overflow: hidden !important;`,
    );

  zoom.extent([
    [0, 0],
    [width, height],
  ]);

  // links
  const nodeIds = new Set(props.nodes.map((n: any) => n.id));
  const links = props.nodes.flatMap(
    (node: any) =>
      node.parents
        ?.filter((p: any) => nodeIds.has(p.target_skill_id))
        .map((p: any) => ({
          source: p.source_skill_id,
          target: p.target_skill_id,
        })) ?? [],
  );

  // simulation
  const simulation = d3
    .forceSimulation(props.nodes)
    .force(
      "link",
      d3.forceLink(links).id((d: any) => d.id),
    )
    .force(
      "charge",
      d3.forceManyBody().strength((d: any) => {
        // YOUR ORIGINAL FORCE RETURNS
        if (props.nodes!.length < 25) return -(props.nodes!.length * 400);
        if (props.nodes!.length < 50) return -(props.nodes!.length * 50);
        if (!d.image) return -120;
        return -(props.nodes!.length * 5);
      }),
    )
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .alphaDecay(0.08)
    .on("tick", ticked)
    .on("end", () => simulation.stop());

  simulationRef.value = simulation;

  // links
  link.value = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.1)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", 1);

  // concept nodes
  conceptNode.value = svg
    .append("g")
    .selectAll("text")
    .data(props.nodes.filter((n) => !n.image))
    .enter()
    .append("text")
    .attr("font-size", 10)
    .attr("fill", "#999")
    .attr("text-anchor", "middle")
    .text((d) => d.name)
    .on("click", (_, d) => navigateTo(`/skills/${d.id}`));

  conceptNode.value.call(
    d3
      .drag()
      .on("start.drag", dragStart)
      .on("drag.drag", dragMove)
      .on("end.drag", dragEnd),
  );

  // skill nodes
  skillNode.value = svg
    .append("g")
    .selectAll("a")
    .data(props.nodes.filter((n) => n.image))
    .enter()
    .append("a")
    .on("click", (_, d) => navigateTo(`/skills/${d.id}`));

  const haloNode = skillNode.value
    .append("circle")
    .attr("r", (d) => d.importance * 0.8)
    .attr("fill", "transparent")
    .attr("stroke", (d) =>
      enableComparison.value ? getComparisonColor(d) : "transparent",
    )
    .attr("stroke-width", 3)
    .attr("opacity", (d) => (enableComparison.value ? 0.6 : 0));

  const skillImage = skillNode.value
    .append("image")
    .attr("xlink:href", (d) => d.image || "/icons/school.png")
    .attr("width", (d) => d.importance)
    .attr("height", (d) => d.importance)
    .attr(
      "transform",
      (d) => `translate(-${d.importance / 2} -${d.importance / 2})`,
    );

  const skillText = skillNode.value
    .append("text")
    .attr("fill", "#999")
    .attr("text-anchor", "middle")
    .attr("font-size", (d) => d.importance * 0.3)
    .attr("transform", (d) => `translate(0 ${d.importance * 0.8})`)
    .text((d) => d.name);

  skillNode.value.call(
    d3
      .drag()
      .on("start.drag", dragStart)
      .on("drag.drag", dragMove)
      .on("end.drag", dragEnd),
  );

  let ticking = false;

  function ticked() {
    if (ticking) return;
    ticking = true;

    let frameId = requestAnimationFrame(() => {
      if (isDestroyed || !link.value || !conceptNode.value) {
        ticking = false;
        return;
      }

      link.value
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      if (enableComparison.value && haloNode) {
        haloNode.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      }

      skillImage?.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);
      skillText?.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);
      conceptNode.value.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);

      ticking = false;
    });
  }

  svg.call(zoom as any).call((zoom as any).transform, d3.zoomIdentity);

  function dragStart(event: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  function dragMove(event: any) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  function dragEnd(event: any) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
}

// Get comparison color based on status
const getComparisonColor = (node: any) => {
  if (!enableComparison.value) return "#E0E0E0"; // Default color when comparison is disabled

  switch (node.comparisonStatus) {
    case "has-skill":
      return "#4CAF50"; // Green for skills the user has
    case "missing-skill":
      return "transparent"; // Gray / transparent for skills the user doesn't have
    case "only-user-has-skill":
      return "#4CAF50"; // Green for skills only the user has
    case "only-comparison-user-has-skill":
      return "#F44336"; // Red for skills only the comparison user has
    case "both-have-skill":
      return "#2196F3"; // Blue for skills both users have
    case "neither-has-skill":
      return "transparent";
    default:
      return "#E0E0E0";
  }
};

watch(
  () => props.nodes?.length,
  () => reload(),
);

onMounted(() => {
  window.addEventListener("resize", handleResize);
  createGraph();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  destroyGraph();
});
</script>

<style>
svg.graph_wrapper {
  width: 100% !important;
  height: 100% !important;
  display: block;
  overflow: hidden !important;
  position: absolute;
  top: 0;
  left: 0;
}
.graph {
  position: absolute;
  bottom: 0;
  left: 0;
  margin: 0 !important;
  padding: 0 !important;
  width: 100vw;
  height: 100vh;
}

.onMouseHover {
  padding: 10px;
  background-color: black;
  height: 50px;
  width: 50px;
  opacity: 1 !important;
}

div.tooltip-node {
  position: absolute;
  text-align: center;
  padding: 0.5rem;
  background: #ffffff;
  color: #313639;
  border: 1px solid #b2b4b6;
  border-radius: 8px;
  pointer-events: none;
  font-size: 1rem;
}
.speed-dial {
  position: fixed !important;
  bottom: 100px !important;
  z-index: 9999;
}
</style>
