import { readSkillsForGraph } from "~/db/skills";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);
  const query = getQuery(event);
  return await readSkillsForGraph(params, query);
});
