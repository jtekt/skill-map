<template>
  <div class="graph">
    <div align="left" justify="center" style="margin-top: 85px !important">
      <svg class="graph_wrapper"></svg>
      <v-fab
        class="my-4"
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

    <GraphLegend :user="user" />
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
  user?: any;
}>();
const route = useRoute();
const zoomed = ref(false);
const link = ref();
const skillNode = ref();
const conceptNode = ref();
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

const zoom = computed(() => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  return d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.3, 5]) // This control how much you can unzoom (x0.5) and zoom (x20)
    .extent([
      [0, 0],
      [width, height],
    ])
    .on("zoom", ({ transform }, d) => {
      link.value.attr("transform", transform);
      skillNode.value.attr("transform", transform);
      conceptNode.value.attr("transform", transform);
      if (transform.x === 0 || transform.y === 0) {
        zoomed.value = false;
      } else zoomed.value = true;
    });
});

const resetZoom = () => {
  const svg = d3.select<SVGSVGElement, unknown>("svg");
  svg.transition().duration(750).call(zoom.value.transform, d3.zoomIdentity);
};

const makeLabel = (n: any) => `${n.name}`;

const computeSkillSize = (node: any) => node.importance;

const main = async () => {
  // check first if looking for recommended skills.
  // Otherwise, set opacity to of not recommended skills to 0.3
  const { recommended } = route.query;
  // Specify the dimensions of the chart.
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Compute links from nodes and their parents
  const links = props.nodes.reduce(
    (acc, { parents }) =>
      parents.length
        ? [
            ...acc,
            ...parents
              .filter((r) =>
                props.nodes.find((n) => n.id === r.target_skill_id)
              )
              .map((r) => ({
                source: r.source_skill_id,
                target: r.target_skill_id,
              })),
          ]
        : acc,
    []
  );

  // Create a simulation with several forces.
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
    .on("tick", ticked);

  // Create the SVG container.
  const svg = d3
    .select<SVGSVGElement, unknown>("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr(
      "style",
      `width: ${width - 20}px; height: ${
        height - 110
      }px; overflow: hidden !important;`
    );

  // Add a line for each link, and a circle for each node.
  link.value = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.1) // OG 0.15
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", 1);

  conceptNode.value = svg
    .append("g")
    .selectAll("node") // Not sure what to put here
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
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended) as any
  );

  skillNode.value = svg
    .append("g")
    .selectAll("node") // Not sure what to put here
    .data(props.nodes.filter((n: any) => n.image))
    .enter()
    .append("a")
    .attr("class", "v-list-item v-list-item--link v-list-item--variant-text")
    .on("click", function (_, d: any) {
      navigateTo(`/skills/${d.id}`);
    });

  const haloNode = skillNode.value
    .append("circle")
    .attr("r", (d) => computeSkillSize(d) * 0.8)
    .attr("fill", "transparent")
    .attr("stroke", (d) =>
      enableComparison.value ? getComparisonColor(d) : "transparent"
    )
    .attr("stroke-width", 3)
    .attr("stroke-opacity", (d) => (enableComparison.value ? 0.8 : 0))
    .attr("opacity", (d) => (enableComparison.value ? 0.6 : 0));

  const skillNodeImage = skillNode.value
    .append("image")
    .attr("xlink:href", (d: any) => d.image || "/icons/school.png")
    .attr("height", computeSkillSize)
    .attr("width", computeSkillSize)
    .attr(
      "transform",
      (n) =>
        `translate(-${0.5 * computeSkillSize(n)} -${0.5 * computeSkillSize(n)})`
    )
    .style("opacity", (n) => {
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
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended) as any
  );

  // Set the position attributes of links and nodes each time the simulation ticks.
  function ticked() {
    link.value
      .attr("x1", (d: any) => d.source.x)
      .attr("y1", (d: any) => d.source.y)
      .attr("x2", (d: any) => d.target.x)
      .attr("y2", (d: any) => d.target.y);

    if (enableComparison.value)
      haloNode.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
    skillNodeImage.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);
    skillNodeText.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);
    conceptNode.value.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);
  }

  // Reheat the simulation when drag starts, and fix the subject position.
  function dragstarted(event: any) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  // Update the subject (dragged node) position during drag.
  function dragged(event: any) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  // Restore the target alpha so the simulation cools after dragging ends.
  // Unfix the subject position now that it’s no longer being dragged.
  function dragended(event: any) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  svg.call(zoom.value).call(zoom.value.transform, d3.zoomIdentity);
};
// Get comparison color based on status
const getComparisonColor = (node) => {
  if (!enableComparison.value) return "#E0E0E0"; // Default color when comparison is disabled

  switch (node.comparisonStatus) {
    case "has-skill":
      return "#4CAF50"; // Green for skills the user has
    case "missing-skill":
      return "transparent"; // Gray for skills the user doesn't have
    case "only-user-has-skill":
      return "#4CAF50"; // Green for skills only the user has
    case "only-comparison-user-has-skill":
      return "#F44336"; // Red for skills only the comparison user has
    case "both-have-skill":
      return "#2196F3"; // Blue for skills both users have
    case "neither-has-skill":
      return "transparent"; // Dark gray for skills neither user has
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
watch(
  () => props.nodes, // Watch only the query part of the route
  (newValue, oldValue) => {
    if (newValue === oldValue) return;
    reload();
  },
  { deep: true } // Enables deep watching for reactive objects like `query`
);
</script>

<style>
.graph {
  position: absolute;
  bottom: 0;
  left: 0;
  margin: 0 !important;
  padding: 0 !important;
  width: 100%;
  height: 100%;
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
  position: absolute !important;
  bottom: 0% !important;
  left: 0 !important;
}
</style>
