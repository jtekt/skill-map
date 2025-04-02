import { readSkillsForGraph, compareSkillsForGraph } from "~/server/db/skills";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);
  const query = getQuery(event);
  if (query.compareTo) return await compareSkillsForGraph(params, query)
  else return await readSkillsForGraph(params, query);
});
