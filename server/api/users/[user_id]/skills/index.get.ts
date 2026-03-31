import { readSkills } from "~~/server/db/skills";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);

  const query = getQuery(event);
  return await readSkills(params, query);
});
