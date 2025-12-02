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

        <v-tooltip text="Compare Skills" location="right">
          <template v-slot:activator="{ props }">
            <GraphCompare key="1" v-bind="props" />
          </template>
        </v-tooltip>

        <v-tooltip text="Add filter" location="right">
          <template v-slot:activator="{ props }">
            <GraphFilter key="2" :hidden="hideFilter" v-bind="props" />
          </template>
        </v-tooltip>

        <v-tooltip text="Display as table" location="right">
          <template v-slot:activator="{ props }">
            <v-btn
              key="3"
              :to="routeConfig.path"
              :icon="routeConfig.icon"
              v-bind="props"
            />
          </template>
        </v-tooltip>
        <v-tooltip :text="$t('add_new_skill')" location="right">
          <template v-slot:activator="{ props }">
            <SkillForm
              v-bind="props"
              :dialog-data="{
                icon: 'mdi-notebook-plus-outline',
                title: $t('add_new_skill'),
              }"
              @save-data="doAdd($event)"
            />
          </template>
        </v-tooltip>
        <!-- <v-btn key="4" icon="$error"></v-btn> -->
      </v-speed-dial>
    </div>
  </div>
  <template v-if="!nodes">
    <div class="w-100">
      <EmptyStateGraph :loading="loading" />
    </div>
  </template>
</template>
<script setup lang="ts">
//@ts-ignore
import * as d3 from "d3";
import useFetchApi from "~/composables/useFetchApi";
const emit = defineEmits(["skill-added"]);

const props = defineProps<{
  nodes?: any;
  loading: boolean;
  users?: any;
}>();
const route = useRoute();
const zoomed = ref(false);
const link = ref<any>();
const skillNode = ref<any>();
const conceptNode = ref<any>();
const simulationRef = ref<d3.Simulation<any, any> | null>(null);

const hideFilter = computed(() => {
  return route.name !== "index" && route.name !== "users-user_id";
});

const enableComparison = computed(() => {
  return route.query.compareTo ?? false;
});

const routeConfig = computed(() => {
  const { user_id } = route.params;
  switch (route.name) {
    case "index": {
      return {
        path: "/skills",
        icon: "mdi-table",
      };
    }
    case "users-user_id": {
      return {
        path: `/users/${user_id}/skills`,
        icon: "mdi-table",
      };
    }
    default: {
      return {
        path: "/",
        icon: "mdi-graph",
      };
    }
  }
});

const reload = () => {
  d3.selectAll(".graph_wrapper > *").remove();
  main();
};

// global zoom instance (not re-created every time)
const zoom = d3
  .zoom<SVGSVGElement, unknown>()
  .scaleExtent([0.3, 5])
  .on("zoom", ({ transform }) => {
    if (link.value) link.value.attr("transform", transform);
    if (skillNode.value) skillNode.value.attr("transform", transform);
    if (conceptNode.value) conceptNode.value.attr("transform", transform);

    // consider "zoomed" if not at identity
    zoomed.value = !(transform.x === 0 && transform.y === 0);
  });

const resetZoom = () => {
  const svg = d3.select<SVGSVGElement, unknown>("svg.graph_wrapper");
  svg
    .transition()
    .duration(750)
    .call((zoom as any).transform, d3.zoomIdentity);
};

const makeLabel = (n: any) => `${n.name}`;
const computeSkillSize = (node: any) => node.importance;

const main = async () => {
  if (!props.nodes || !props.nodes.length) return;

  // stop previous simulation if any
  if (simulationRef.value) {
    simulationRef.value.stop();
    simulationRef.value = null;
  }

  const { recommended } = route.query;

  const width = window.innerWidth;
  const height = window.innerHeight - 110;

  // update zoom extent based on current viewport
  (zoom as any).extent([
    [0, 0],
    [width, height],
  ]);

  // Compute links from nodes and their parents
  const links = props.nodes.reduce(
    (acc: any[], { parents }: any) =>
      parents.length
        ? [
            ...acc,
            ...parents
              .filter((r: any) =>
                props.nodes.find((n: any) => n.id === r.target_skill_id)
              )
              .map((r: any) => ({
                source: r.source_skill_id,
                target: r.target_skill_id,
              })),
          ]
        : acc,
    []
  );

  // Create the simulation
  const simulation = d3
    .forceSimulation(props.nodes as any)
    .force(
      "link",
      d3.forceLink(links).id((d: any) => d.id)
    )
    .force(
      "charge",
      d3.forceManyBody().strength((d: any) => {
        if (props.nodes.length < 25) return -(props.nodes.length * 400);
        if (props.nodes.length < 50) return -(props.nodes.length * 50);
        if (!d.image) return -120;
        else return -(props.nodes.length * 5);
      })
    )
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .alphaDecay(0.08)
    .on("tick", ticked)
    .on("end", () => {
      simulation.stop();
    });

  simulationRef.value = simulation;

  // Create the SVG container.
  const svg = d3
    .select<SVGSVGElement, unknown>("svg.graph_wrapper")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr(
      "style",
      `width: ${
        width - 20
      }px; height: ${height}px; overflow: hidden !important;`
    );

  // Add a line for each link
  link.value = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.1)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", 1);

  // Concept nodes (text-only)
  conceptNode.value = svg
    .append("g")
    .selectAll("node")
    .data(props.nodes.filter((n: any) => !n.image))
    .enter()
    .append("a")
    .append("text")
    .attr("font-size", 10)
    .attr("font-family", "Arial, Helvetica, sans-serif")
    .attr("fill", "#999")
    .attr("text-anchor", "middle")
    .text(makeLabel)
    .on("click", function (_, d: any) {
      navigateTo(`/skills/${d.id}`);
    });

  conceptNode.value.call(
    d3
      .drag()
      .on("start", dragstarted as any)
      .on("drag", dragged as any)
      .on("end", dragended as any) as any
  );

  // Skill nodes (image + text)
  skillNode.value = svg
    .append("g")
    .selectAll("node")
    .data(props.nodes.filter((n: any) => n.image))
    .enter()
    .append("a")
    .attr("class", "v-list-item v-list-item--link v-list-item--variant-text")
    .on("click", function (_, d: any) {
      navigateTo(`/skills/${d.id}`);
    });

  const haloNode = skillNode.value
    .append("circle")
    .attr("r", (d: any) => computeSkillSize(d) * 0.8)
    .attr("fill", "transparent")
    .attr("stroke", (d: any) =>
      enableComparison.value ? getComparisonColor(d) : "transparent"
    )
    .attr("stroke-width", 3)
    .attr("stroke-opacity", (d: any) => (enableComparison.value ? 0.8 : 0))
    .attr("opacity", (d: any) => (enableComparison.value ? 0.6 : 0));

  const skillNodeImage = skillNode.value
    .append("image")
    .attr("xlink:href", (d: any) => d.image || "/icons/school.png")
    .attr("height", computeSkillSize as any)
    .attr("width", computeSkillSize as any)
    .attr(
      "transform",
      (n: any) =>
        `translate(-${0.5 * computeSkillSize(n)} -${0.5 * computeSkillSize(n)})`
    )
    .style("opacity", (n: any) => {
      if (recommended && JSON.parse(recommended as string) === false) return 1;
      else if (n.recommended) return 1;
      else return 0.3;
    });

  const skillNodeText = skillNode.value
    .append("text")
    .attr("fill", () => (enableComparison.value ? "black" : "#999"))
    .attr("text-anchor", "middle")
    .attr("font-size", (n: any) => 0.3 * computeSkillSize(n))
    .attr("font-family", "Arial, Helvetica, sans-serif")
    .attr("transform", (n: any) => `translate(0 ${0.8 * computeSkillSize(n)})`)
    .text(makeLabel);

  skillNode.value.call(
    d3
      .drag()
      .on("start", dragstarted as any)
      .on("drag", dragged as any)
      .on("end", dragended as any) as any
  );

  // Throttle DOM updates to once per animation frame
  let ticking = false;

  function ticked() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      link.value
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      if (enableComparison.value) {
        haloNode.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
      }

      skillNodeImage.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);

      skillNodeText.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);

      conceptNode.value.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);

      ticking = false;
    });
  }

  function dragstarted(event: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event: any) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event: any) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  svg.call(zoom as any).call((zoom as any).transform, d3.zoomIdentity);
};

// debounced resize -> reload
let resizeTimeout: number | null = null;

const handleResize = () => {
  if (resizeTimeout !== null) {
    clearTimeout(resizeTimeout);
  }
  resizeTimeout = window.setTimeout(() => {
    reload();
    resizeTimeout = null;
  }, 200);
};

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

const doAdd = async (data: any) => {
  await useFetchApi("/api/skills", { method: "POST", body: data })
    .then(() => {
      emit("skill-added");
    })
    .catch((error) => {
      alert(error.message);
    });
};

// only rebuild graph when nodes reference changes
watch(
  () => props.nodes,
  (newValue, oldValue) => {
    if (newValue === oldValue) return;
    if (!newValue) return;
    reload();
  }
);

onMounted(() => {
  window.addEventListener("resize", handleResize);
  main();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  simulationRef.value?.stop();
});
</script>

<style>
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
